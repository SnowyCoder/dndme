import {System} from "../../System";
import {World} from "../../World";
import {Command, CommandKind} from "./command";
import {SpawnCommandKind} from "./spawnCommand";
import {DeSpawnCommandKind} from "./despawnCommand";
import {ComponentEditCommandKind} from "./componentEdit";
import {ResourceEditCommandKind} from "./resourceEditCommand";
import {EventCommandKind} from "./eventCommand";
import {NoneCommandKind} from "./noneCommand";
import {NETWORK_TYPE, NetworkSystem} from "../back/NetworkSystem";
import { LogLevel, Logger } from "../back/log/Logger";
import { getLogger } from "../back/log/LogSystem";
import { objectClone } from "@/util/jsobj";

export interface CommandResult {
    inverted: Command | undefined;
}

interface PendingCommand {
    command: Command,
    callback?: (res: CommandResult) => void,
    share: boolean,
    isLogging: boolean,
}

export const EVENT_COMMAND_EMIT = 'command_emit';
export const EVENT_COMMAND_LOG = 'command_log';
export const EVENT_COMMAND_HISTORY_LOG = 'command_hisyory_log';
export const EVENT_COMMAND_PARTIAL_END = 'command_partial_end';
export const EVENT_COMMAND_ADD_PRE_CONSEQUENCE = 'command_add_precons';
export const EVENT_COMMAND_ADD_POST_CONSEQUENCE = 'command_add_poscons';

export const COMMAND_TYPE = 'command';
export type COMMAND_TYPE = typeof COMMAND_TYPE;
export class CommandSystem implements System {
    readonly world: World;
    readonly name = COMMAND_TYPE;
    readonly dependencies = [];
    readonly optionalDependencies = [NETWORK_TYPE]

    private readonly logger: Logger;

    private commands = new Map<string, CommandKind>();
    private networkSys: NetworkSystem | undefined;

    private isExecutingCommand: boolean = false;
    private pending: Array<PendingCommand> = [];

    public constructor(world: World) {
        this.world = world;
        this.logger = getLogger(world, "command");
        this.registerDefaultCommands();
        this.world.events.on(EVENT_COMMAND_EMIT, (cmd, res, share) => this.onEmit(cmd, res, share));
        this.world.events.on(EVENT_COMMAND_LOG, this.onLog, this);
        this.world.events.on(EVENT_COMMAND_PARTIAL_END, this.onPartialEnd, this);

        this.networkSys = world.getSystem(NETWORK_TYPE);
    }

    registerCommandKind(kind: CommandKind) {
        this.logger.debug('register', kind.kind);
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

    onEmit(command: Command, callback?: (res: CommandResult) => void, share?: boolean, isLogging: boolean=false) {
        if (this.isExecutingCommand) {
            this.pending.push({
                command,
                callback,
                share: !!share,
                isLogging
            });
            return;
        }

        this.isExecutingCommand = true;
        const res = this.emit(command, share, isLogging);
        this.isExecutingCommand = false;
        if (callback) callback(res);

        while (this.pending.length > 0) {
            const cmd = this.pending.shift()!;
            this.isExecutingCommand = true;
            const res = this.emit(cmd.command, cmd.share, cmd.isLogging);
            this.isExecutingCommand = false;
            if (cmd.callback) cmd.callback(res);
        }
    }

    private emit(command: Command, share: boolean=false, isLogging: boolean=false): CommandResult {
        if (this.logger.isEnabled(LogLevel.DEBUG)) {
            this.logger.debug('emit', objectClone(command), 'share: ', share, 'log: ', isLogging);
        }

        let kind = this.commands.get(command.kind);
        if (kind === undefined) {
            console.warn("Error executing command: unknown kind " + kind);
            return {
                inverted: command,
            };
        }
        if (kind.isNull(command)) {
            return {
                inverted: command,
            };
        }

        if (this.networkSys?.isOnline() === true && share) {
            let stripped = kind.stripClient(command);
            if (stripped.length !== 0) {
                this.world.events.emit("command_share", stripped);
            }
        }
        this.world.events.emit('command_pre_execute', isLogging);
        let inv = undefined;
        try {
            if (this.world.isMaster) {
                inv = kind.applyInvert(command);
            } else {
                kind.apply(command);
            }
        } catch (e) {
            console.warn("Cannot apply command", command, e);
            inv = undefined;
        }
        this.world.events.emit('command_post_execute', inv);
        return {
            inverted: inv,
        };
    }

    private logCommit(cmd: Command | undefined, partial: boolean) {
        this.world.events.emit(EVENT_COMMAND_HISTORY_LOG, cmd, partial);
    }

    private onLog(command: Command, callback?: (res: CommandResult) => void, partial: boolean = false) {
        const cb = (result: CommandResult) => {
            let inv = result.inverted;
            if (inv === undefined) return;
            let kind = this.commands.get(inv.kind);
            if (kind === undefined) {
                console.warn("Invalid inverted command! " + kind);
                return;
            }
            if (!kind.isNull(inv)) {
                this.logCommit(result.inverted, partial);
            } else {
                this.logCommit(undefined, partial);
            }
            if (callback) callback(result);
        }

        this.onEmit(command, cb, true, true);
    }

    private onPartialEnd() {
        this.logCommit(undefined, false);
    }

    getKind(kind: string): CommandKind | undefined {
        return this.commands.get(kind)
    }

    enable(): void {
    }

    destroy(): void {
    }
}
