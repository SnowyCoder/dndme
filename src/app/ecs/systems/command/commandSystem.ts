import {System} from "../../system";
import {World} from "../../world";
import {Command, CommandKind} from "./command";
import {SpawnCommandKind} from "./spawnCommand";
import {DeSpawnCommandKind} from "./despawnCommand";
import {ComponentEditCommandKind} from "./componentEdit";
import {ResourceEditCommandKind} from "./resourceEditCommand";
import {EventCommandKind} from "./eventCommand";
import {NoneCommandKind} from "./noneCommand";
import {NETWORK_TYPE, NetworkSystem} from "../back/networkSystem";

export interface CommandResult {
    inverted?: Command;
}

export const EVENT_COMMAND_EMIT = 'command_emit';
export const EVENT_COMMAND_LOG = 'command_log';
export const EVENT_COMMAND_PARTIAL_END = 'command_partial_end';
export const EVENT_COMMAND_ADD_PRE_CONSEQUENCE = 'command_add_precons';
export const EVENT_COMMAND_ADD_POST_CONSEQUENCE = 'command_add_poscons';

export interface LogHook {
    logPrepare(partial: boolean): void;

    logCommit(cmd: Command | undefined, partial: boolean): void;
}


export const COMMAND_TYPE = 'command';
export type COMMAND_TYPE = typeof COMMAND_TYPE;
export class CommandSystem implements System {
    readonly world: World;
    readonly name = COMMAND_TYPE;
    readonly dependencies = [];
    readonly optionalDependencies = [NETWORK_TYPE]

    logger?: LogHook;

    private commands = new Map<string, CommandKind>();
    private networkSys: NetworkSystem | undefined;

    public constructor(world: World) {
        this.world = world;
        this.registerDefaultCommands();
        this.world.events.on(EVENT_COMMAND_EMIT, this.onEmit, this);
        this.world.events.on(EVENT_COMMAND_LOG, this.onLog, this);
        this.world.events.on(EVENT_COMMAND_PARTIAL_END, this.onPartialEnd, this);

        this.networkSys = world.systems.get(NETWORK_TYPE) as NetworkSystem | undefined;
    }

    registerCommandKind(kind: CommandKind) {
        this.commands.set(kind.kind, kind);
    }

    private registerDefaultCommands() {
        this.registerCommandKind(new SpawnCommandKind(this.world));
        this.registerCommandKind(new DeSpawnCommandKind(this.world));
        this.registerCommandKind(new ComponentEditCommandKind(this.world));
        this.registerCommandKind(new ResourceEditCommandKind(this.world));
        this.registerCommandKind(new EventCommandKind(this.world));
        this.registerCommandKind(new NoneCommandKind());
    }

    onEmit(command: Command, res?: CommandResult, share?: boolean) {
        let kind = this.commands.get(command.kind);
        if (kind === undefined) {
            console.warn("Error executing command: unknown kind " + kind);
            return undefined;
        }
        if (kind.isNull(command)) return;

        //console.log("EMIT", JSON.stringify(command));

        if (this.networkSys?.isOnline() === true && (this.world.isMaster || share)) {
            let stripped = kind.stripClient(command);
            if (stripped.length !== 0) {
                this.world.events.emit("command_share", stripped);
            }
        }
        this.world.events.emit('command_pre_execute');
        let inv;
        try {
            inv = kind.applyInvert(command);
        } catch (e) {
            console.warn("Cannot apply command", command, e);
            inv = undefined;
        }
        if (res !== undefined) {
            res.inverted = inv;
        }
        this.world.events.emit('command_post_execute', inv);
    }

    private onLog(command: Command, res?: CommandResult, partial: boolean = false) {
        let result = res || {};
        this.onEmit(command, result);

        if (result.inverted !== undefined) {
            let inv = result.inverted;
            let kind = this.commands.get(inv.kind);
            if (kind === undefined) {
                console.warn("Invalid inverted command! " + kind);
                return;
            }
            if (!kind.isNull(inv)) {
                this.logger?.logCommit(result.inverted, partial);
            } else {
                this.logger?.logCommit(undefined, partial);
            }
        }
    }

    private onPartialEnd() {
        this.logger?.logCommit(undefined, false);
    }

    getKind(kind: string): CommandKind | undefined {
        return this.commands.get(kind)
    }

    enable(): void {
    }

    destroy(): void {
    }
}

