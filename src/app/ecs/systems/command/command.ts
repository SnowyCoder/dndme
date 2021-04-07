import {World} from "../../world";
import {CommandResult, EVENT_COMMAND_EMIT, EVENT_COMMAND_LOG} from "./commandSystem";

export interface Command {
    kind: string;
}

export interface CommandKind {
    readonly kind: string;

    /**
     * CALLING THIS CONSUMES THE ARGUMENT!
     */
    applyInvert(command: Command): Command;

    stripClient(command: Command): Command[];

    merge(to: Command, from: Command): boolean;

    isNull(command: Command): boolean;
}


export function executeAndLogCommand(world: World, command: Command): Command | undefined {
    let res = {} as CommandResult;
    world.events.emit(EVENT_COMMAND_LOG, command, res);
    return res.inverted;
}

export function emitCommand(world: World, command: Command, share: boolean = false): Command | undefined {
    let res = {} as CommandResult;
    world.events.emit(EVENT_COMMAND_EMIT, command, res, share);
    return res.inverted;
}

