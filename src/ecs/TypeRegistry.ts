import { DEFAULT_COMPONENTS } from "./component";
import { DeclarativeListenerSystem } from "./systems/back/DeclarativeListenerSystem";
import { ImageMetaSyncSystem } from "./systems/back/ImageMetaSystem";
import { InteractionSystem } from "./systems/back/InteractionSystem";
import { WebKeyboardSystem } from "./systems/back/KeyboardSystem";
import { LayerSystem } from "./systems/back/LayerSystem";
import { NameAsLabelSystem } from "./systems/back/NameAsLabelSystem";
import { NetworkHistorySystem } from "./systems/back/NetworkHistorySystem";
import { ClientNetworkSystem, CommonNetworkSystem, HostNetworkSystem } from "./systems/back/NetworkSystem";
import { SelectionSystem } from "./systems/back/SelectionSystem";
import { SelectionUiSystem } from "./systems/back/SelectionUiSystem";
import { TextSystem } from "./systems/back/TextSystem";
import { ToolSystem } from "./systems/back/ToolSystem";
import { VisibilityAwareSystem } from "./systems/back/VisibilityAwareSystem";
import { VisibilitySystem } from "./systems/back/VisibilitySystem";
import { BigStorageSystem } from "./systems/back/files/bigStorageSystem";
import { LinkRelocationSystem } from "./systems/back/linkRelocationSystem";
import { LogSystem } from "./systems/back/log/LogSystem";
import { PixiBoardSystem } from "./systems/back/pixi/pixiBoardSystem";
import { PixiGraphicSystem } from "./systems/back/pixi/pixiGraphicSystem";
import { PixiLayerSystem } from "./systems/back/pixi/pixiLayerSystem";
import { PixiMeasureSystem } from "./systems/back/pixi/pixiMeasureSystem";
import { PixiRectSelectionSystem } from "./systems/back/pixi/pixiRectSelectionSystem";
import { BackgroundImageSystem } from "./systems/backgroundImageSystem";
import { BattleSystem } from "./systems/BattleSystem";
import { CommandHistorySystem } from "./systems/command/commandHistorySystem";
import { CommandSystem } from "./systems/command/commandSystem";
import { CopyPasteSystem } from "./systems/copyPasteSystem";
import { DoorConflictDetector, DoorSystem } from "./systems/doorSystem";
import { GridSystem } from "./systems/gridSystem";
import { LightSystem } from "./systems/lightSystem";
import { MouseTrailSystem } from "./systems/mouseTrailSystem";
import { PinSystem } from "./systems/pinSystem";
import { PlayerLocatorSystem } from "./systems/playerLocator";
import { PlayerSystem } from "./systems/playerSystem";
import { PropSystem } from "./systems/propSystem";
import { ToolbarSystem } from "./systems/toolbarSystem";
import { WallSystem } from "./systems/wallSystem";
import { DEFAULT_RESOURCES } from "./resource";

const SystemList = [
    BigStorageSystem,
    LogSystem,
    PixiBoardSystem,
    PixiGraphicSystem,
    PixiLayerSystem,
    PixiMeasureSystem,
    PixiRectSelectionSystem,
    DeclarativeListenerSystem,
    ImageMetaSyncSystem,
    InteractionSystem,
    WebKeyboardSystem,
    LayerSystem,
    LinkRelocationSystem,
    NameAsLabelSystem,
    NetworkHistorySystem,
    CommonNetworkSystem,
    HostNetworkSystem,
    ClientNetworkSystem,
    SelectionSystem,
    SelectionUiSystem,
    TextSystem,
    ToolSystem,
    VisibilityAwareSystem,
    VisibilitySystem,
    CommandSystem,
    CommandHistorySystem,
    BackgroundImageSystem,
    BattleSystem,
    CopyPasteSystem,
    DoorSystem,
    DoorConflictDetector,
    GridSystem,
    LightSystem,
    MouseTrailSystem,
    PinSystem,
    PlayerLocatorSystem,
    PlayerSystem,
    PropSystem,
    ToolbarSystem,
    WallSystem,
    ToolSystem,
] as const;

export type RegisteredSystem = InstanceType<typeof SystemList[number]>;
export type SystemName = RegisteredSystem['name'];
export type SystemRegistry = {[name in SystemName]: Extract<RegisteredSystem, {name: name}>}
export type SystemForName<Name extends SystemName> = SystemRegistry[Name];


type GetComponents<X> = X extends { components?: unknown } ? X['components'] : typeof undefined;


export type RegisteredComponent = DEFAULT_COMPONENTS | NonNullable<GetComponents<RegisteredSystem>>[number];
export type ComponentType = RegisteredComponent['type'];
export type ComponentRegistry = {[type in ComponentType]: Extract<RegisteredComponent, {type: type}>}
export type ComponentForType<Type extends ComponentType> = ComponentRegistry[Type];


type GetResources<X> = X extends { resources?: unknown } ? X['resources'] : typeof undefined;

export type RegisteredResource = DEFAULT_RESOURCES | NonNullable<GetResources<RegisteredSystem>>[number];
export type ResourceType = RegisteredResource['type'];
export type ResourceRegistry = {[type in ResourceType]: Extract<RegisteredResource, {type: type}>}
export type ResourceForType<Type extends ResourceType> = ResourceRegistry[Type];

type CheckTypeTooGeneral<X> = X extends {type: unknown} ? IfEquals<X['type'], string, X, undefined> : undefined;

type GeneralTypes = NonNullable<CheckTypeTooGeneral<RegisteredResource | RegisteredComponent>>;
type TooGeneralError = 'Warning: some types are too general! (missing type definition?), this will break all of our beautiful typescript magic';
const _TYPES_ARE_TOO_GENERAL1: IfEquals<GeneralTypes, never, "", TooGeneralError> = "";
const _TYPES_ARE_TOO_GENERAL2: IfEquals<GeneralTypes, never, 0, GeneralTypes> = 0;


// Problem: if even ONE type does not define the property "name" as readonly, SystemName becomes `string`
// and every type checking becomes `any` throwing up all this beautiful machinery.
// The following black magic returns an error when one type does not use a readonly "name" property.
// TODO: more black magic to check WHICH system has violated us.
type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

type ReadonlyError = "Warning: some System types don't have their 'name' property readonly, this WILL completely mess with the type system!"
type ShouldBeNever = IfEquals<Extract<WritableKeys<RegisteredSystem>, "name">, "name", ReadonlyError, "">;
const _COMPTIME_CHECK: ShouldBeNever = "";
