import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    POSITION_TYPE,
    PositionComponent,
    FollowMouseFlag
} from "../component";
import {TOOL_TYPE, ToolSystem, ToolPart} from "./back/toolSystem";
import {
    BOARD_TRANSFORM_TYPE,
    BoardTransformResource,
    PIXI_BOARD_TYPE,
    PixiBoardSystem,
} from "./back/pixi/pixiBoardSystem";
import {ToolType} from "../tools/toolType";
import {
    NETWORK_ENTITY_TYPE,
    NETWORK_STATUS_TYPE,
    NETWORK_TYPE, NetworkEntityComponent,
    NetworkStatusResource, NetworkSystem,
} from "./back/networkSystem";
import PIXI from "../../PIXI";
import {LayerOrder} from "../../phase/editMap/layerOrder";

import TrailImage from "@/assets/trail.png";
import {Resource} from "../resource";
import * as P from "../../protocol/game";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { PacketInfo } from "../../network/webtorrent/WTChannel";
import { Group, Layer } from "@pixi/layers";

import MouseTrailIcon from "@/ui/icons/MouseTrailIcon.vue";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";

export const MOUSE_TRAIL_TYPE = 'mouse_trail';
export type MOUSE_TRAIL_TYPE = typeof MOUSE_TRAIL_TYPE;

const ROPE_SIZE = 500;
const HISTORY_SIZE_MS = 500;
const SEND_HISTORY_AFTER_MS = 100;

// TODO: don't use ticker, use real world clock
// TODO: better interpolation system, it should take time into account (right?)

// How does this work?
// We receive a packet containing coordinates and times between them.
// (note. timings are local clocks for every PC, it should not be compared to any other local clock)
// The received packets are replayed from the last received time, as-is
// (following the received clock, but using deltas from our local clock)
// The trail uses [local_clock - HISTORY_SIZE_MS, local_clock] as the path,
// the rest is future data waiting to be drawn.
// ATTACK RESISTANCE: This method presents possible OOM by allocating too many history entries
//      (no restriction is placed on the received clock timestamps), TODO BUG
export interface MouseTrailComponent extends Component {
    type: MOUSE_TRAIL_TYPE;

    historyx: number[];
    historyy: number[];
    historyt: number[];
    local_clock: number;
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

    layer: Layer;
    container: PIXI.Container;

    private tex: PIXI.Texture;
    private boardScale: number = 1;

    private toUpdate: number[] = [];

    // our "future" to send to others (yes it will have 100ms latency)
    private trailBuffer: number[] = [];
    // Id of the timeout to send the current
    private bufferFlushTimeout: any = undefined;

    constructor(world: World) {
        this.world = world;

        this.pixiBoardSys = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.networkSys = this.world.systems.get(NETWORK_TYPE) as NetworkSystem;

        this.layer = new Layer(new Group(LayerOrder.TOOLS, false));
        this.container = new PIXI.Container();

        // Add system
        let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
        toolSys.addToolPart(new MouseTrailToolPart(this));
        toolSys.addTool(ToolType.MOUSE_TRAIL, {
            parts: ['space_pan', 'mouse_trail'],
            toolbarEntry: {
                icon: MouseTrailIcon,
                title: 'Mouse trail',
                priority: StandardToolbarOrder.MOUSE_TRAIL,
            },
            // TODO: add sidebar with editable color
        });

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
        const now = Date.now();
        if (this.onFuture(netres.myId, [x, y, now], now)) {
            this.onSelfPosition(x, y, now);
        }
    }

    onFuture(senderNetId: number, moves: number[], now: number) {
        const netres = this.networkStatusResource!!;
        const entityId = netres.entityIndex.get(senderNetId);
        if (entityId === undefined) {
            console.warn("Cannot find entity of network player " + senderNetId, netres.entityIndex);
            return false
        }
        let data = this.storage.getComponent(entityId);
        if (data === undefined) {
            console.warn("Cannot find mouse trail for network player " + senderNetId);
            return false;
        }

        if (moves.length % 3 !== 0) {
            console.warn("Client " + senderNetId + " sent unaligned xy moves");
            moves.length = moves.length - (moves.length % 3);
        }
        if (moves.length == 0) return false;

        if (data.historyt.length == 0) {
            data.local_clock = moves[2];
        } else {
            // Quick and stupid filter to align with the remote clock (fixed low gain)
            data.local_clock += (moves[2] - data.local_clock) * 0.25;
        }

        let added = 0;
        for (let i = 0; i < moves.length; i += 3) {
            if (data.historyt.length !== 0 &&
                data.historyx[data.historyx.length - 1] == moves[i] &&
                data.historyy[data.historyy.length - 1] == moves[i + 1]) continue;
            added += 1;
            data.historyx.push(moves[i + 0]);
            data.historyy.push(moves[i + 1]);
            data.historyt.push(moves[i + 2]);
        }
        //this.trimHistory(data, data.local_clock + (now - ticker.lastTime));

        if (this.toUpdate.indexOf(entityId) < 0) {
            this.toUpdate.push(entityId);
        }
        return added != 0;
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

        const ropeSize = ropePoints.length;
        for (let i = 0; i < ropeSize; i++) {
            const p = ropePoints[ropeSize - i - 1];

            const t = c.local_clock - HISTORY_SIZE_MS + (i / ropeSize) * HISTORY_SIZE_MS;
            const x = cubicInterpolation(c.historyx, c.historyt, t) * this.boardScale;
            const y = cubicInterpolation(c.historyy, c.historyt, t) * this.boardScale;

            p.x = x;
            p.y = y;
        }
        rope.scale.set(1/this.boardScale);

        geom.updateVertices();
        if (netwEntity === undefined) {
            netwEntity = this.world.getComponent(c.entity, NETWORK_ENTITY_TYPE) as NetworkEntityComponent;
        }
        rope.tint = netwEntity.color;
        rope.visible = true;
    }


    private onSelfPosition(posx: number, posy: number, post: number) {
        this.trailBuffer.push(posx, posy, post);
        if (this.bufferFlushTimeout === undefined) {
            this.bufferFlushTimeout = setInterval(() => {
                if (this.trailBuffer.length === 0) {
                    clearInterval(this.bufferFlushTimeout);
                    this.bufferFlushTimeout = undefined;
                    return;
                }
                const pkt = {
                    type: 'mtrail',
                    fut: this.trailBuffer,
                } as P.MouseTrailPacket;
                this.networkSys.channel.broadcast(pkt);
                this.trailBuffer = [];
            }, SEND_HISTORY_AFTER_MS);
        }
    }

    trimHistory(trail: MouseTrailComponent, local_clock: number) {
        const last_useful_clock = local_clock - HISTORY_SIZE_MS;
        let remove_count = 0;
        for(; remove_count < trail.historyt.length && trail.historyt[remove_count] < last_useful_clock; remove_count++);
        if (remove_count > 0) {
            trail.historyt.splice(0, remove_count);
            trail.historyx.splice(0, remove_count);
            trail.historyy.splice(0, remove_count);
        }
    }

    private onTick() {
        if (this.toUpdate.length === 0) return;
        const delta = this.pixiBoardSys.clock.elapsedMs;

        let netres = this.networkStatusResource!!;
        const myEntityId = netres.entityIndex.get(netres.myId);
        for (let i = this.toUpdate.length - 1; i >= 0; i--) {
            const entity = this.toUpdate[i];
            const trail = this.storage.getComponent(entity)!;

            // different = Math.abs(nextx - prevx) + Math.abs(nexty - prevy) > Number.EPSILON;
            trail.local_clock += delta;
            // Only keep useful time:
            this.trimHistory(trail, trail.local_clock);

            if (trail.historyt.length === 0) {
                this.toUpdate.splice(i, 1);
                trail._g.visible = false;
                continue
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
                historyx: [],
                historyy: [],
                historyt: [],
                lastinput: 0,
                local_clock: 0,
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
        this.onFuture(info.senderId, pkt.fut, Date.now());
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
    readonly name = ToolType.MOUSE_TRAIL;
    private readonly sys: MouseTrailSystem;

    follower: number = -1;

    constructor(sys: MouseTrailSystem) {
        this.sys = sys;
    }

    initFollower() {
        this.killFollower();

        this.follower = this.sys.world.spawnEntity(
            {
                type: POSITION_TYPE,
                entity: -1,
                x: Number.NEGATIVE_INFINITY,
                y: Number.NEGATIVE_INFINITY,
            } as PositionComponent,
            {
                type: FOLLOW_MOUSE_TYPE,
            } as FollowMouseFlag,
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

function cubicInterpolation(coords: number[], ctimes: number[], t: number, tangentFactor: number = 1) {
    let ki = 0;
    for (ki = 0; ki < ctimes.length - 1; ki++) {
        if (t < ctimes[ki + 1]) break;
    }
    const k = ctimes[ki];
    t = Math.min(Math.max(t - k, 0), 1);
    const p = [clipInput(ki, coords), clipInput(ki + 1, coords)];
    if (t == 1) {
        return p[1];
    }
    return p[0];
    // TODO: reuse the cubic interpolation
    // for now we disabled it because it does not play nice with high sample rate.
    // We might need to lower the sample rate and kick the interpolation back in.
    const m = [getTangent(ki, tangentFactor, coords), getTangent(ki + 1, tangentFactor, coords)];
    const t2 = t * t;
    const t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
}
