import EditMapComponent from "../../ui/edit/editMap.vue";
import {stage} from "../../index";
import {BackgroundSystem} from "../../ecs/systems/backgroundSystem";
import {SelectionSystem} from "../../ecs/systems/selectionSystem";
import {NetworkManager} from "../../network/networkManager";
import {HostEditMapPhase} from "./hostEditMapPhase";
import {GameMap} from "../../map/gameMap";
import {PinSystem} from "../../ecs/systems/pinSystem";
import {WallSystem} from "../../ecs/systems/wallSystem";
import {LightSystem} from "../../ecs/systems/lightSystem";
import {TextSystem} from "../../ecs/systems/textSystem";
import {VisibilitySystem} from "../../ecs/systems/visibilitySystem";
import {InteractionSystem} from "../../ecs/systems/interactionSystem";
import {PlayerSystem} from "../../ecs/systems/playerSystem";
import {VisibilityAwareSystem} from "../../ecs/systems/visibilityAwareSystem";
import {DoorSystem} from "../../ecs/systems/doorSystem";
import {PropSystem} from "../../ecs/systems/propSystem";
import {PixiGraphicSystem} from "../../ecs/systems/pixiGraphicSystem";
import {ToolSystem} from "../../ecs/systems/toolSystem";
import {GridSystem} from "../../ecs/systems/gridSystem";
import {EcsPhase} from "../ecsPhase";
import {PixiBoardSystem} from "../../ecs/systems/pixiBoardSystem";


export class EditMapPhase extends EcsPhase {
    networkManager!: NetworkManager;

    constructor(name: string, isHost: boolean) {
        super(name, isHost);
    }

    ecsSetup() {
        this.setupNetworkManager();

        super.ecsSetup();

        this.world.events.on('selection_update', (group: SelectionSystem) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
            this.vue.selectedAddable = group.getAddableComponents();
        })
    }

    registerSystems() {
        super.registerSystems();
        let w = this.world;
        w.addSystem(new PixiBoardSystem(w));
        w.addSystem(new SelectionSystem(w));
        w.addSystem(new ToolSystem(w));
        w.addSystem(new GridSystem(w));
        w.addSystem(new InteractionSystem(w));
        w.addSystem(new TextSystem());
        w.addSystem(new PixiGraphicSystem(w));
        w.addSystem(new LightSystem(w));

        w.addSystem(new BackgroundSystem(w));
        w.addSystem(new WallSystem(w));
        w.addSystem(new DoorSystem(w));
        w.addSystem(new VisibilitySystem(w));
        w.addSystem(new VisibilityAwareSystem(w));
        w.addSystem(new PinSystem(w));
        w.addSystem(new PropSystem(w));
        w.addSystem(new PlayerSystem(w));
    }

    setupNetworkManager() {
        this.networkManager = new NetworkManager(this.world.isMaster);
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

    // overrides

    private onNetworkReady() {
        console.log("Network is ready! side: " + (this.networkManager.isHost ? "master" : "player"));
        if (this.networkManager.isHost) {
            history.replaceState(null, "", '#p' + this.networkManager.peer.id);
        }
    }

    private onNetworkError(err: any) {
        // TODO: open modal or something
        console.error("Error from peerjs: ", err.type);
        if (err.type === 'server-error') {
            alert("Error connecting to peerjs instance, you're offline now");

            if (!this.world.isMaster) {
                stage.setPhase(new HostEditMapPhase(new GameMap()));
            }
        } else if (err.type === 'peer-unavailable') {
            console.log("Invalid invite link");

            alert("Invalid invite link");

            history.replaceState(null, "", ' ');
            if (!this.world.isMaster) {
                stage.setPhase(new HostEditMapPhase(new GameMap()));
            }
        } else if (err.ty === 'network') {
            alert("Connection lost");
        } else {
            alert(err);
        }
    }


    ui() {
        let ui = new EditMapComponent();
        (ui as any).phase = this;
        (ui as any).isAdmin = this.world.isMaster;
        return ui;
    }

    disable() {
        super.disable();

        this.networkManager.disconnect();
    }
}


