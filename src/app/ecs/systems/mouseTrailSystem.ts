import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    FollowMouseComponent,
    HOST_HIDDEN_TYPE,
    HostHiddenComponent,
    POSITION_TYPE,
    PositionComponent
} from "../component";
import {TOOL_TYPE, ToolSystem, ToolPart} from "./back/toolSystem";
import {
    BOARD_TRANSFORM_TYPE,
    BoardTransformResource,
    PIXI_BOARD_TYPE,
    PixiBoardSystem,
} from "./back/pixiBoardSystem";
import {Tool} from "../tools/toolType";
import {
    NETWORK_ENTITY_TYPE,
    NETWORK_STATUS_TYPE,
    NETWORK_TYPE, NetworkEntityComponent,
    NetworkStatusResource, NetworkSystem,
} from "./back/networkSystem";
import PIXI from "../../PIXI";
import {LayerOrder} from "../../phase/editMap/layerOrder";

import TrailImage from "Public/images/trail.png";
import {Resource} from "../resource";
import * as P from "../../protocol/game";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { PacketInfo } from "../../network/webtorrent/WTChannel";

export const MOUSE_TRAIL_TYPE = 'mouse_trail';
export type MOUSE_TRAIL_TYPE = typeof MOUSE_TRAIL_TYPE;

const ROPE_SIZE = 100;
const HISTORY_SIZE = 20;
const SEND_HISTORY_AFTER_MS = 100;

// TODO: don't use ticker, use real world clock
// TODO: better interpolation system, it should take time into account (right?)

export interface MouseTrailComponent extends Component {
    type: MOUSE_TRAIL_TYPE;

    futurexy: number[],// interleaved [x1, y1, x2, y2]
    historyx: number[];
    historyy: number[];
    lastinput: number,// how many frames have passed since an input
    _g: PIXI.SimpleRope;
}


export class MouseTrailSystem implements System {
    readonly name = MOUSE_TRAIL_TYPE;
    readonly dependencies = [TOOL_TYPE, PIXI_BOARD_TYPE, NETWORK_TYPE];

    readonly world: World;
    readonly pixiBoardSys: PixiBoardSystem;
    readonly networkSys: NetworkSystem;

    readonly storage = new SingleEcsStorage<MouseTrailComponent>(MOUSE_TRAIL_TYPE, false, false);

    networkStatusResource?: NetworkStatusResource;

    layer: PIXI.display.Layer;
    container: PIXI.Container;

    private tex: PIXI.Texture;
    private boardScale: number = 1;

    private toUpdate: number[] = [];

    // our "future" to send to others (yes it will have 100ms latency)
    private selfFuture: number[] = [];
    // last time we sent a future
    private futureLastSend: number = 0;

    constructor(world: World) {
        this.world = world;

        this.pixiBoardSys = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.networkSys = this.world.systems.get(NETWORK_TYPE) as NetworkSystem;

        this.layer = new PIXI.display.Layer(new PIXI.display.Group(LayerOrder.TOOLS, false));
        this.container = new PIXI.Container();

        // Add system
        let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
        toolSys.addToolPart(new MouseTrailToolPart(this));
        toolSys.addTool(Tool.MOUSE_TRAIL, ['space_pan', 'mouse_trail']);

        // Add listeners
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);

        // Paint texture
        this.tex = PIXI.Texture.from(TrailImage);
    }

    onSelfInput(x: number, y: number) {
        const netres = this.networkStatusResource!!;
        this.onFuture(netres.myId, [x, y]);
    }

    onFuture(senderNetId: number, moves: number[]) {
        const netres = this.networkStatusResource!!;
        const entityId = netres.entityIndex.get(senderNetId);
        if (entityId === undefined) {
            console.warn("Cannot find entity of network player " + senderNetId, netres.entityIndex);
            return
        }
        let data = this.storage.getComponent(entityId)!!;

        if (moves.length % 2 !== 0) {
            console.warn("Client " + senderNetId + " sent unaligned xy moves");
            moves.length = moves.length - 1;
        }

        data.futurexy.push(...moves);
        if (this.toUpdate.indexOf(entityId) < 0) {
            this.toUpdate.push(entityId);
        }
    }

    private createSimpleRope(): PIXI.SimpleRope {
        const points = new Array<PIXI.Point>(ROPE_SIZE);
        for (let i = 0; i < ROPE_SIZE; i++) {
            points[i] = new PIXI.Point();
        }

        const rope = new PIXI.SimpleRope(this.tex, points);
        (rope as any).blendmode = PIXI.BLEND_MODES.ADD;

        this.container.addChild(rope);

        return rope;
    }

     updateRope(c: MouseTrailComponent, netwEntity: NetworkEntityComponent | undefined = undefined) {
        const rope = c._g;
        const geom = rope.geometry as PIXI.RopeGeometry;
        const ropePoints = geom.points;

        const historySize = c.historyx.length;
        const ropeSize = ropePoints.length;
        for (let i = 0; i < ropeSize; i++) {
            const p = ropePoints[i];

            const x = cubicInterpolation(c.historyx, i / ropeSize * historySize) * this.boardScale;
            const y = cubicInterpolation(c.historyy, i / ropeSize * historySize) * this.boardScale;

            p.x = x;
            p.y = y;
        }
        rope.scale.set(1/this.boardScale);

        geom.updateVertices();
        if (netwEntity === undefined) {
            netwEntity = this.world.getComponent(c.entity, NETWORK_ENTITY_TYPE) as NetworkEntityComponent;
        }
        rope.tint = netwEntity.color;
    }


    private onSelfPosition(posx: number, posy: number) {
        this.selfFuture.push(posx, posy);
        const now = Date.now();
        if (this.futureLastSend + SEND_HISTORY_AFTER_MS < now) {
            const pkt = {
                type: 'mtrail',
                fut: this.selfFuture,
            } as P.MouseTrailPacket;
            this.networkSys.channel.broadcast(pkt);
            this.selfFuture = [];
            this.futureLastSend = now;
        }
    }

    private onTick() {
        if (this.toUpdate.length === 0) return;

        let netres = this.networkStatusResource!!;
        const myEntityId = netres.entityIndex.get(netres.myId);
        for (let i = this.toUpdate.length - 1; i >= 0; i--) {
            const entity = this.toUpdate[i];
            const trail = this.storage.getComponent(entity)!;

            let prevx = trail.historyx[HISTORY_SIZE - 1];
            let prevy = trail.historyy[HISTORY_SIZE - 1];

            let nextx = prevx;
            let nexty = prevy;
            let different = false;
            if (trail.futurexy.length !== 0) {
                nextx = trail.futurexy[0];
                nexty = trail.futurexy[1];
                trail.futurexy.splice(0, 2);
                different = Math.abs(nextx - prevx) + Math.abs(nexty - prevy) > Number.EPSILON;
            }
            if (entity === myEntityId && trail.lastinput < HISTORY_SIZE) {
                this.onSelfPosition(nextx, nexty);
            }

            trail.historyx.pop();
            trail.historyy.pop();
            trail.historyx.unshift(nextx);
            trail.historyy.unshift(nexty);

            if (different) {
                trail.lastinput = 0;
                trail._g.visible = true;
            } else {
                // If no update has been found in the last 20 frames remove the player from the update list
                // it will be re-added if we get another change
                trail.lastinput += 1;
                if (trail.lastinput > HISTORY_SIZE) {
                    this.toUpdate.splice(i, 1);
                    trail._g.visible = false;
                    continue
                }
            }

            this.updateRope(trail);
        }
    }


    private onComponentAdd(c: Component): void {
        if (c.type === NETWORK_ENTITY_TYPE) {
            const _g = this.createSimpleRope();
            const com = {
                type: MOUSE_TRAIL_TYPE,
                entity: -1,
                color: 0xFFFFFF,
                historyx: new Array(HISTORY_SIZE).fill(0),
                historyy: new Array(HISTORY_SIZE).fill(0),
                futurexy: [],
                lastinput: HISTORY_SIZE,
                _g,
            } as MouseTrailComponent;

            this.updateRope(com, c as NetworkEntityComponent);

            this.world.addComponent(c.entity, com);
        }
    }

    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === MOUSE_TRAIL_TYPE) {
            let c = comp as MouseTrailComponent;

            this.updateRope(c);
        } else if (comp.type === NETWORK_ENTITY_TYPE) {
            if ('color' in changed) {
                const mtc = this.storage.getComponent(comp.entity);
                if (mtc !== undefined) {
                    this.updateRope(mtc, comp as NetworkEntityComponent);
                }
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === MOUSE_TRAIL_TYPE) {
            let c = comp as MouseTrailComponent;
            c._g.destroy();
        }
    }

    private changeScales(): void {
        for (let c of this.storage.allComponents()) {
            this.updateRope(c);
        }
    }

    private onResourceEdited(res: Resource): void {
        if (res.type === BOARD_TRANSFORM_TYPE) {
            this.boardScale = (res as BoardTransformResource).scaleX || 1;
            this.changeScales();
        }
    }

    private onMouseTrailPacket(pkt: P.MouseTrailPacket, info: PacketInfo): void {
        this.onFuture(info.senderId, pkt.fut);
    }

    enable(): void {
        this.layer.interactive = false;
        this.layer.interactiveChildren = false;
        this.pixiBoardSys.root.addChild(this.layer);

        this.pixiBoardSys.board.addChild(this.container);

        this.container.interactive = false;
        this.container.interactiveChildren = false;
        this.container.parentLayer = this.layer;

        this.networkStatusResource = this.world.getResource(NETWORK_STATUS_TYPE) as NetworkStatusResource;


        this.pixiBoardSys.ticker.add(this.onTick, this);
        this.networkSys.channel.packets.on('mtrail', this.onMouseTrailPacket, this);
    }

    destroy(): void {
        this.networkSys.channel.packets.off('mtrail', this.onMouseTrailPacket, this);
        this.pixiBoardSys.ticker.remove(this.onTick, this);
    }
}

export class MouseTrailToolPart implements ToolPart {
    readonly name = Tool.MOUSE_TRAIL;
    private readonly sys: MouseTrailSystem;

    follower: number = -1;

    constructor(sys: MouseTrailSystem) {
        this.sys = sys;
    }

    initFollower() {
        this.killFollower();

        this.follower = this.sys.world.spawnEntity(
            {
                type: HOST_HIDDEN_TYPE,
            } as HostHiddenComponent,
            {
                type: POSITION_TYPE,
                entity: -1,
                x: Number.NEGATIVE_INFINITY,
                y: Number.NEGATIVE_INFINITY,
            } as PositionComponent,
            {
                type: FOLLOW_MOUSE_TYPE,
            } as FollowMouseComponent,
        );
    }

    killFollower() {
        if (this.follower > 0) {
            this.sys.world.despawnEntity(this.follower);
            this.follower = -1;
        }
    }

    private onTick() {
        const pos = this.sys.world.getComponent(this.follower, POSITION_TYPE) as PositionComponent;
        if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
        this.sys.onSelfInput(pos.x, pos.y);
    }

    onEnable(): void {
        this.initFollower();
        this.sys.pixiBoardSys.ticker.add(this.onTick, this, PIXI.UPDATE_PRIORITY.HIGH);
    }

    onDisable(): void {
        this.sys.pixiBoardSys.ticker.remove(this.onTick, this);
        this.killFollower();
    }

    initialize(events: SafeEventEmitter): void {
    }

    destroy(): void {
    }
}


/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 */
function clipInput<X>(k: number, arr: X[]): X {
    if (k < 0) k = 0;
    if (k > arr.length - 1) k = arr.length - 1;
    return arr[k];
}

function getTangent(k: number, factor: number, array: number[]) {
    return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
}

function cubicInterpolation(array: number[], t: number, tangentFactor: number = 1) {
    const k = Math.floor(t);
    const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
    const p = [clipInput(k, array), clipInput(k + 1, array)];
    t -= k;
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}
