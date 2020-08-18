import EditMapComponent from "../../ui/edit/editMap.vue";
import {BirdEyePhase} from "../birdEyePhase";
import * as PIXI from "pixi.js";
import {app, stage} from "../../index";
import {BackgroundSystem} from "../../ecs/systems/backgroundSystem";
import {PointDB} from "../../game/pointDB";
import {RoomSystem} from "../../ecs/systems/roomSystem";
import {SelectionGroup} from "../../game/selectionGroup";
import {NetworkManager} from "../../network/networkManager";
import {HostEditMapPhase} from "./hostEditMapPhase";
import {GameMap} from "../../map/gameMap";


export class EditMapPhase extends BirdEyePhase {
    isHost: boolean;
    networkManager: NetworkManager;

    tool: Tool = Tool.INSPECT;

    backgroundSystem: BackgroundSystem;
    roomSystem: RoomSystem;

    pointDb: PointDB;
    selection: SelectionGroup;

    isMovingSelection: boolean = false;
    movingStart = new PIXI.Point(0, 0);
    lastMove = new PIXI.Point(0, 0);

    constructor(name: string, isHost: boolean) {
        super(name);
        this.isHost = isHost;

        this.pointDb = new PointDB(this.gridSystem);
        this.selection = new SelectionGroup(this.ecs);
    }

    setupEcs() {
        this.setupNetworkManager();

        super.setupEcs();

        this.backgroundSystem = new BackgroundSystem(this.ecs, this);
        this.roomSystem = new RoomSystem(this.ecs, this);

        this.ecs.events.on('selection_update', (group: SelectionGroup) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
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

        if (oldTool === Tool.CREATE_ROOM) {
            this.roomSystem.endRoomCreation(false);
        }
        if (tool !== Tool.MOVE && tool !== Tool.INSPECT) {
            this.selection.clear();
        }
        if (tool === Tool.CREATE_ROOM) {
            this.roomSystem.initRoomCreation();
        }

        this.tool = tool;

        console.log("Changing tool from " + oldTool + " to " + tool);

        this.uiEventEmitter.emit('changeTool', this.tool);
    }

    // overrides

    getMapPointFromMouseInteraction(event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
        let point = event.data.getLocalPosition(this.board, orig);

        let nearest = this.pointDb.findNearest([point.x, point.y]);
        if (nearest !== undefined && nearest[1] < 100) {
            point.set(nearest[0][0], nearest[0][1]);
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
        if (this.tool === Tool.CREATE_ROOM) {
            let point = this.getMapPointFromMouseInteraction(event);

            this.roomSystem.redrawLastLine(this.roomSystem.currentRoom, point);
        } else if (this.isMovingSelection) {
            let point = this.getMapPointFromMouseInteraction(event);

            let diffX = point.x - this.movingStart.x;
            let diffY = point.y - this.movingStart.y;

            let moveX = diffX - this.lastMove.x;
            let moveY = diffY - this.lastMove.y;
            this.lastMove.set(diffX, diffY);
            this.selection.moveAll(moveX, moveY);
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

    findEntityAt(point: PIXI.Point): number | undefined {
        let entity = this.roomSystem.findRoomAt(point);
        if (entity !== undefined) return entity;
        return this.backgroundSystem.findBackgroundAt(point);
    }

    onPointerClick(event: PIXI.InteractionEvent) {
        super.onPointerClick(event);
        let point = this.getMapPointFromMouseInteraction(event);
        if (this.tool === Tool.CREATE_ROOM) {
           this.roomSystem.addVertex(point);
           return;
        }

        let entity = this.findEntityAt(point);
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        if (this.tool === Tool.INSPECT) {
            if (!ctrlPressed) {
                if (entity !== undefined) {
                    this.selection.setOnlyEntity(entity);
                } else {
                    this.selection.clear();
                }
            } else if (entity !== undefined) {
                this.selection.toggleEntity(entity);
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
        if (this.tool === Tool.CREATE_ROOM) {
            let point = this.getMapPointFromMouseInteraction(event);
            this.roomSystem.undoVertex(point);
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

        this.backgroundSystem.enable();
        this.roomSystem.enable();
    }

    disable() {
        this.roomSystem.destroy();
        this.backgroundSystem.destroy();

        super.disable();
    }
}

export enum Tool {
    INSPECT= 'inspect',
    MOVE = 'move',
    CREATE_ROOM = 'create_room',
    GRID = 'grid',
}


