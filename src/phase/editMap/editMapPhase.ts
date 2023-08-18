import EditMapComponent from "../../ui/edit/EditMap.vue";
import {BackgroundImageSystem} from "../../ecs/systems/backgroundImageSystem";
import {SelectionSystem} from "../../ecs/systems/back/SelectionSystem";
import {SelectionUiSystem} from "../../ecs/systems/back/SelectionUiSystem";
import {PinSystem} from "../../ecs/systems/pinSystem";
import {WallSystem} from "../../ecs/systems/wallSystem";
import {LightSystem} from "../../ecs/systems/lightSystem";
import {TextSystem} from "../../ecs/systems/back/TextSystem";
import {VisibilitySystem} from "../../ecs/systems/back/VisibilitySystem";
import {InteractionSystem} from "../../ecs/systems/back/InteractionSystem";
import {PlayerSystem} from "../../ecs/systems/playerSystem";
import {VisibilityAwareSystem} from "../../ecs/systems/back/VisibilityAwareSystem";
import {DoorConflictDetector, DoorSystem} from "../../ecs/systems/doorSystem";
import {PropSystem} from "../../ecs/systems/propSystem";
import {PixiGraphicSystem} from "../../ecs/systems/back/pixi/pixiGraphicSystem";
import {ToolSystem} from "../../ecs/systems/back/ToolSystem";
import {GridSystem} from "../../ecs/systems/gridSystem";
import {EcsPhase} from "../ecsPhase";
import {PixiBoardSystem} from "../../ecs/systems/back/pixi/pixiBoardSystem";
import {CommandSystem} from "../../ecs/systems/command/commandSystem";
import {CommandHistorySystem} from "../../ecs/systems/command/commandHistorySystem";
import {LayerSystem} from "../../ecs/systems/back/LayerSystem";
import {PixiRectSelectionSystem} from "../../ecs/systems/back/pixi/pixiRectSelectionSystem";
import {WebKeyboardSystem} from "../../ecs/systems/back/KeyboardSystem";
import {CommonNetworkSystem} from "../../ecs/systems/back/NetworkSystem";
import {PixiMeasureSystem} from "../../ecs/systems/back/pixi/pixiMeasureSystem";
import {PixiLayerSystem} from "../../ecs/systems/back/pixi/pixiLayerSystem";
import {BigStorageSystem} from "../../ecs/systems/back/files/bigStorageSystem";
import {MouseTrailSystem} from "../../ecs/systems/mouseTrailSystem";
import {CopyPasteSystem} from "../../ecs/systems/copyPasteSystem";
import { LinkRelocationSystem } from "../../ecs/systems/back/linkRelocationSystem";
import { NameAsLabelSystem } from "../../ecs/systems/back/NameAsLabelSystem";
import { PlayerLocatorSystem } from "../../ecs/systems/playerLocator";
import { App, createApp, shallowRef } from "vue";
import { ToolbarSystem } from "@/ecs/systems/toolbarSystem";
import { BattleSystem } from "../../ecs/systems/BattleSystem";
import { ImageMetaSyncSystem } from "@/ecs/systems/back/ImageMetaSystem";
import { DeclarativeListenerSystem } from "@/ecs/systems/back/DeclarativeListenerSystem";
import { LogSystem } from "@/ecs/systems/back/log/LogSystem";
import { NetworkHistorySystem } from "@/ecs/systems/back/NetworkHistorySystem";


export class EditMapPhase extends EcsPhase {
    private readonly gameId: string | undefined;

    constructor(name: string, gameId?: string) {
        super(name, gameId === undefined);
        this.gameId = gameId;
        // TODO: use import.meta.hot 'vite:beforeFullReload' to listen for reloads and export the current map.
    }

    registerSystems() {
        super.registerSystems();
        let w = this.world;
        w.addSystem(new LogSystem(w));
        w.addSystem(new DeclarativeListenerSystem(w));
        w.addSystem(new CommonNetworkSystem(w, this.gameId));
        w.addSystem(new NetworkHistorySystem(w));
        w.addSystem(new WebKeyboardSystem(w));
        w.addSystem(new BigStorageSystem(w));

        w.addSystem(new CommandSystem(w));
        if (w.isMaster) {
            w.addSystem(new CommandHistorySystem(w));
        }
        w.addSystem(new LinkRelocationSystem(w));
        w.addSystem(new ToolbarSystem(w));
        w.addSystem(new LayerSystem(w));
        w.addSystem(new PixiBoardSystem(w));
        w.addSystem(new SelectionSystem(w));
        w.addSystem(new SelectionUiSystem(w));
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
        w.addSystem(new ImageMetaSyncSystem(w));
        w.addSystem(new PixiGraphicSystem(w));
        w.addSystem(new PixiLayerSystem(w));
        w.addSystem(new NameAsLabelSystem(w));

        w.addSystem(new BackgroundImageSystem(w));
        w.addSystem(new WallSystem(w));
        w.addSystem(new DoorSystem(w));
        if (w.isMaster) w.addSystem(new DoorConflictDetector(w));
        w.addSystem(new VisibilitySystem(w));
        w.addSystem(new VisibilityAwareSystem(w));
        w.addSystem(new PinSystem(w));
        w.addSystem(new PropSystem(w));
        w.addSystem(new PlayerSystem(w));
        w.addSystem(new PlayerLocatorSystem(w));
        w.addSystem(new LightSystem(w));
        if (w.isMaster) {
            w.addSystem(new BattleSystem(w));
        }
    }

    // overrides

    ui(): App {
        return createApp(EditMapComponent, {
            world: shallowRef(this.world),
        });
    }
}
