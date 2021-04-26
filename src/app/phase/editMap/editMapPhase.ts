import EditMapComponent from "../../ui/edit/editMap.vue";
import {stage} from "../../index";
import {BackgroundImageSystem} from "../../ecs/systems/backgroundImageSystem";
import {SelectionSystem} from "../../ecs/systems/back/selectionSystem";
import {NetworkManager} from "../../network/networkManager";
import {HostEditMapPhase} from "./hostEditMapPhase";
import {GameMap} from "../../map/gameMap";
import {PinSystem} from "../../ecs/systems/pinSystem";
import {WallSystem} from "../../ecs/systems/wallSystem";
import {LightSystem} from "../../ecs/systems/lightSystem";
import {TextSystem} from "../../ecs/systems/back/textSystem";
import {VisibilitySystem} from "../../ecs/systems/back/visibilitySystem";
import {InteractionSystem} from "../../ecs/systems/back/interactionSystem";
import {PlayerSystem} from "../../ecs/systems/playerSystem";
import {VisibilityAwareSystem} from "../../ecs/systems/back/visibilityAwareSystem";
import {DoorSystem} from "../../ecs/systems/doorSystem";
import {PropSystem} from "../../ecs/systems/propSystem";
import {PixiGraphicSystem} from "../../ecs/systems/back/pixiGraphicSystem";
import {ToolSystem} from "../../ecs/systems/back/toolSystem";
import {GridSystem} from "../../ecs/systems/gridSystem";
import {EcsPhase} from "../ecsPhase";
import {PixiBoardSystem} from "../../ecs/systems/back/pixiBoardSystem";
import {CommandSystem} from "../../ecs/systems/command/commandSystem";
import {CommandHistorySystem} from "../../ecs/systems/command/commandHistorySystem";
import {LayerSystem} from "../../ecs/systems/back/layerSystem";
import {PixiRectSelectionSystem} from "../../ecs/systems/back/pixiRectSelectionSystem";
import {WebKeyboardSystem} from "../../ecs/systems/back/keyboardSystem";
import {CommonNetworkSystem} from "../../ecs/systems/back/networkSystem";
import {PixiMeasureSystem} from "../../ecs/systems/back/pixiMeasureSystem";
import {PixiLayerSystem} from "../../ecs/systems/back/pixiLayerSystem";


export class EditMapPhase extends EcsPhase {
    networkManager!: NetworkManager;

    constructor(name: string, isHost: boolean) {
        super(name, isHost);
    }

    ecsSetup() {
        this.setupNetworkManager();

        super.ecsSetup();
    }

    registerSystems() {
        super.registerSystems();
        let w = this.world;
        w.addSystem(new CommonNetworkSystem(w, this.networkManager.channel));

        w.addSystem(new CommandSystem(w));
        if (w.isMaster) {
            w.addSystem(new CommandHistorySystem(w));
        }
        w.addSystem(new WebKeyboardSystem(w));
        w.addSystem(new LayerSystem(w));
        w.addSystem(new PixiBoardSystem(w));
        w.addSystem(new SelectionSystem(w));
        w.addSystem(new PixiRectSelectionSystem(w));
        w.addSystem(new PixiMeasureSystem(w));
        w.addSystem(new ToolSystem(w));
        w.addSystem(new GridSystem(w));
        w.addSystem(new InteractionSystem(w));
        w.addSystem(new TextSystem(w));
        w.addSystem(new PixiGraphicSystem(w));
        w.addSystem(new PixiLayerSystem(w));

        w.addSystem(new BackgroundImageSystem(w));
        w.addSystem(new WallSystem(w));
        w.addSystem(new DoorSystem(w));
        w.addSystem(new VisibilitySystem(w));
        w.addSystem(new VisibilityAwareSystem(w));
        w.addSystem(new PinSystem(w));
        w.addSystem(new PropSystem(w));
        w.addSystem(new PlayerSystem(w));
        w.addSystem(new LightSystem(w));
    }

    setupNetworkManager() {
        this.networkManager = new NetworkManager(this.world.isMaster);
        this.networkManager.on("ready", this.onNetworkReady, this);
        this.networkManager.on("error", this.onNetworkError, this);
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
        return new EditMapComponent({
            propsData: {
                world: this.world,
            }
        });
    }

    disable() {
        super.disable();

        this.networkManager.disconnect();
    }
}


