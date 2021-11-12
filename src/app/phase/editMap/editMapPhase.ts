import EditMapComponent from "../../ui/edit/editMap.vue";
import {BackgroundImageSystem} from "../../ecs/systems/backgroundImageSystem";
import {SelectionSystem} from "../../ecs/systems/back/selectionSystem";
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
import {BigStorageSystem} from "../../ecs/systems/back/bigStorageSystem";
import {MouseTrailSystem} from "../../ecs/systems/mouseTrailSystem";
import {CopyPasteSystem} from "../../ecs/systems/copyPasteSystem";
import { LinkRelocationSystem } from "../../ecs/systems/back/linkRelocationSystem";
import { NameAsLabelSystem } from "../../ecs/systems/back/nameAsLabelSystem";
import { WTChannel } from "../../network/webtorrent/WTChannel";


export class EditMapPhase extends EcsPhase {
    channel!: WTChannel;
    private readonly gameId: string | undefined;

    constructor(name: string, gameId?: string) {
        super(name, gameId === undefined);
        this.gameId = gameId;
    }

    ecsSetup() {
        this.setupNetworkManager();

        super.ecsSetup();
    }

    registerSystems() {
        super.registerSystems();
        let w = this.world;
        w.addSystem(new CommonNetworkSystem(w, this.channel));

        w.addSystem(new CommandSystem(w));
        if (w.isMaster) {
            w.addSystem(new CommandHistorySystem(w));
        }
        w.addSystem(new WebKeyboardSystem(w));
        w.addSystem(new BigStorageSystem(w));
        w.addSystem(new LinkRelocationSystem(w));
        w.addSystem(new LayerSystem(w));
        w.addSystem(new PixiBoardSystem(w));
        w.addSystem(new SelectionSystem(w));
        if (w.isMaster) {
            w.addSystem(new CopyPasteSystem(w));
        }
        w.addSystem(new PixiRectSelectionSystem(w));
        w.addSystem(new PixiMeasureSystem(w));
        w.addSystem(new ToolSystem(w));
        w.addSystem(new MouseTrailSystem(w));
        w.addSystem(new GridSystem(w));
        w.addSystem(new InteractionSystem(w));
        w.addSystem(new TextSystem(w));
        w.addSystem(new PixiGraphicSystem(w));
        w.addSystem(new PixiLayerSystem(w));
        w.addSystem(new NameAsLabelSystem(w));

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
        this.channel = new WTChannel();
        if (this.world.isMaster) {
            this.channel.startMaster();
            history.replaceState(null, "", '#t' + this.channel.getConnectSecret());
        } else {
            this.channel.startClient(this.gameId!!);
        }
    }

    // overrides

    ui() {
        return new EditMapComponent({
            propsData: {
                world: this.world,
            }
        });
    }

    disable() {
        super.disable();

        this.channel.destroy();
    }
}
