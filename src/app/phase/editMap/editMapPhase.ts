import EditMapComponent from "../../ui/edit/editMap.vue";
import {BirdEyePhase} from "../birdEyePhase";
import PIXI from "../../PIXI";
import {app, stage} from "../../index";
import {BackgroundSystem} from "../../ecs/systems/backgroundSystem";
import {PointDB} from "../../game/pointDB";
import {SelectionGroup} from "../../game/selectionGroup";
import {NetworkManager} from "../../network/networkManager";
import {HostEditMapPhase} from "./hostEditMapPhase";
import {GameMap} from "../../map/gameMap";
import {PinSystem} from "../../ecs/systems/pinSystem";
import {WallSystem} from "../../ecs/systems/wallSystem";
import {LightSystem} from "../../ecs/systems/lightSystem";
import {TextSystem} from "../../ecs/systems/textSystem";
import {QueryHitEvent} from "../../ecs/interaction";
import {VisibilitySystem} from "../../ecs/systems/visibilitySystem";
import {InteractionSystem} from "../../ecs/systems/interactionSystem";
import {PlayerSystem} from "../../ecs/systems/playerSystem";
import {VisibilityAwareSystem} from "../../ecs/systems/visibilityAwareSystem";


export class EditMapPhase extends BirdEyePhase {
    isHost: boolean;
    networkManager: NetworkManager;

    tool: Tool = Tool.INSPECT;

    interactionSystem: InteractionSystem;
    backgroundSystem: BackgroundSystem;
    textSystem: TextSystem;
    wallSystem: WallSystem;
    visibilitySystem: VisibilitySystem;
    visibilityAwareSystem: VisibilityAwareSystem;
    pinSystem: PinSystem;
    playerSystem: PlayerSystem;
    lightSystem: LightSystem;

    selection: SelectionGroup;

    isMovingSelection: boolean = false;
    movingStart = new PIXI.Point(0, 0);
    lastMove = new PIXI.Point(0, 0);

    constructor(name: string, isHost: boolean) {
        super(name, isHost);
        this.isHost = isHost;

        this.selection = new SelectionGroup(this.ecs);
    }

    setupEcs() {
        this.setupNetworkManager();

        super.setupEcs();

        this.interactionSystem = new InteractionSystem(this.ecs, this);
        this.backgroundSystem = new BackgroundSystem(this.ecs, this);
        this.textSystem = new TextSystem(this.ecs);
        this.wallSystem = new WallSystem(this.ecs, this);
        this.visibilitySystem = new VisibilitySystem(this.ecs, this);
        this.visibilityAwareSystem = new VisibilityAwareSystem(this.ecs, this);
        this.pinSystem = new PinSystem(this.ecs, this);
        this.playerSystem = new PlayerSystem(this.ecs, this);
        this.lightSystem = new LightSystem(this.ecs, this);

        this.ecs.events.on('selection_update', (group: SelectionGroup) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
            this.vue.selectedAddable = group.getAddableComponents();
        })
    }

    setupBoard() {
        app.stage.sortableChildren = true;

        app.stage.addChild(this.board);
    }

    setupNetworkManager() {
        this.networkManager = new NetworkManager(this.isHost);
        this.networkManager.on("ready", this.onNetworkReady, this);
        this.networkManager.on("error", this.onNetworkError, this);

        let connUpdate = () => {
            this.vue.connectionCount = this.networkManager.channel.connections.length;
        };
        let chEvents = this.networkManager.channel.eventEmitter;
        chEvents.on('_device_join', connUpdate)
        chEvents.on('_device_left', connUpdate)
        chEvents.on('_buffering_update', () => {
            this.vue.connectionBuffering = this.networkManager.channel.bufferingChannels > 0;
        });
    }

    changeTool(tool: Tool) {
        let oldTool = this.tool;

        if (oldTool === Tool.CREATE_WALL) {
            this.wallSystem.endCreation();
        } else if (oldTool === Tool.CREATE_PIN) {
            this.pinSystem.cancelCreation();
        }

        if (tool !== Tool.MOVE && tool !== Tool.INSPECT) {
            this.selection.clear();
        }
        if (tool === Tool.CREATE_WALL) {
            this.wallSystem.initCreation();
        } else if (tool === Tool.CREATE_PIN) {
            this.pinSystem.initCreation();
        }

        this.tool = tool;

        console.log("Changing tool from " + oldTool + " to " + tool);

        this.uiEventEmitter.emit('changeTool', this.tool);
    }

    // overrides

    getMapPointFromMouseInteraction(event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
        let point = event.data.getLocalPosition(this.board, orig);

        let nearest = this.interactionSystem.snapDb.findNearest([point.x, point.y]);
        if (nearest !== undefined && nearest[1] < 100) {
            point.set(nearest[0][0], nearest[0][1]);
        } else {
            let onWallLoc = this.wallSystem.findLocationOnWall(point, 50);
            if (onWallLoc !== undefined) {
                point.copyFrom(onWallLoc);
            }
        }
        return point;
    }



    onPointerDown(event: PIXI.InteractionEvent) {
        super.onPointerDown(event);

        if (this.tool === Tool.MOVE && !(event.data.button === 1 && event.data.pointerType === 'mouse')) {
            this.isDraggingBoard = false;
            this.isMovingSelection = true;

            let point = this.getMapPointFromMouseInteraction(event);
            this.movingStart.copyFrom(point);
            this.lastMove.set(0, 0);
            this.ecs.events.emit('tool_move_begin');
        }
    }

    onPointerMove(event: PIXI.InteractionEvent) {
        super.onPointerMove(event);
        if (this.tool === Tool.CREATE_WALL) {
            let point = this.getMapPointFromMouseInteraction(event);

            this.wallSystem.redrawCreationLastLine(point);
        } else if (this.isMovingSelection) {
            let point = this.getMapPointFromMouseInteraction(event);

            let diffX = point.x - this.movingStart.x;
            let diffY = point.y - this.movingStart.y;

            let moveX = diffX - this.lastMove.x;
            let moveY = diffY - this.lastMove.y;
            this.lastMove.set(diffX, diffY);
            this.selection.moveAll(moveX, moveY);
        } else if (this.tool === Tool.CREATE_PIN) {
            let point = this.getMapPointFromMouseInteraction(event);

            this.pinSystem.redrawCreation(point);
        }
    }

    onPointerUp(event: PIXI.InteractionEvent) {
        super.onPointerUp(event);
        if (this.isMovingSelection) {
            this.isMovingSelection = false;

            this.ecs.events.emit('tool_move_end');
        }
    }

    onPointerUpOutside(event: PIXI.InteractionEvent) {
        super.onPointerUpOutside(event);
    }

    findEntitiesAt(point: PIXI.Point, multi: boolean): number[] {
        let event = QueryHitEvent.queryPoint(point, multi);

        this.ecs.events.emit('query_hit', event);
        return [...event.hits];
    }

    onPointerClick(event: PIXI.InteractionEvent) {
        super.onPointerClick(event);
        let point = this.getMapPointFromMouseInteraction(event);
        if (this.tool === Tool.CREATE_WALL) {
           this.wallSystem.addVertex(point);
           return;
        }
        if (this.tool === Tool.CREATE_PIN) {
            this.pinSystem.confirmCreation(point);
            return;
        }
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = this.findEntitiesAt(point, ctrlPressed);

        if (this.tool === Tool.INSPECT) {
            if (!ctrlPressed) {
                if (entities.length !== 0) {
                    this.selection.setOnlyEntity(entities[0]);
                } else {
                    this.selection.clear();
                }
            } else {
                for (let id of entities) {
                    this.selection.toggleEntity(id);
                }
            }
        }
    }

    private onNetworkReady() {
        console.log("Network is ready! " + this.networkManager.isHost)
        if (this.networkManager.isHost) {
            history.replaceState(null, null, '#p' + this.networkManager.peer.id)
        }
    }

    private onNetworkError(err: any) {
        // TODO: open modal or something
        console.error("Error from peerjs: ", err.type);
        if (err.type === 'server-error') {
            alert("Error connecting to peerjs instance, you're offline now");

            if (!this.isHost) {
                stage.setPhase(new HostEditMapPhase(new GameMap()));
            }
        } else if (err.type === 'peer-unavailable') {
            console.log("Invalid invite link");

            alert("Invalid invite link");

            history.replaceState(null, null, ' ');
            if (!this.isHost) {
                stage.setPhase(new HostEditMapPhase(new GameMap()));
            }
        } else if (err.ty === 'network') {
            alert("Connection lost");
        } else {
            alert(err);
        }
    }

    onPointerRightDown(event: PIXI.InteractionEvent) {
        super.onPointerRightDown(event);
        if (this.tool === Tool.CREATE_WALL) {
            let point = this.getMapPointFromMouseInteraction(event);
            this.wallSystem.undoVertex(point);
        }
    }



    ui() {
        let ui = new EditMapComponent();
        (ui as any).phase = this;
        (ui as any).isAdmin = this.isHost;
        return ui;
    }

    enable() {
        super.enable();

        this.setupBoard();

        this.interactionSystem.enable();
        this.backgroundSystem.enable();
        this.textSystem.enable();
        this.wallSystem.enable();
        this.visibilitySystem.enable();
        this.visibilityAwareSystem.enable();
        this.pinSystem.enable();
        this.playerSystem.enable();
        this.lightSystem.enable();
    }

    disable() {
        this.lightSystem.destroy();
        this.playerSystem.destroy();
        this.pinSystem.destroy();
        this.visibilityAwareSystem.destroy();
        this.visibilitySystem.destroy();
        this.wallSystem.destroy();
        this.textSystem.destroy();
        this.backgroundSystem.destroy();
        this.interactionSystem.destroy();

        super.disable();
    }
}

export enum Tool {
    INSPECT= 'inspect',
    MOVE = 'move',
    CREATE_WALL = 'create_wall',
    CREATE_PIN = 'create_pin',
    GRID = 'grid',
    LIGHT = 'light',
}


