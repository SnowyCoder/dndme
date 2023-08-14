import {World} from "../../World";
import {
    CommandResult,
    EVENT_COMMAND_ADD_POST_CONSEQUENCE,
    EVENT_COMMAND_ADD_PRE_CONSEQUENCE,
    EVENT_COMMAND_EMIT,
    EVENT_COMMAND_LOG
} from "./commandSystem";

export interface Command {
    kind: string;
}

export interface CommandKind {
    readonly kind: string;

    /**
     * CALLING THIS CONSUMES THE ARGUMENT!
     */
    applyInvert(command: Command): Command;

    /**
    * Applies the command without inversion (used in non-master worlds where the command does not need history log)
    */
    apply(command: Command): void;

    stripClient(command: Command): Command[];

    merge(to: Command, from: Command, strict: boolean): boolean;

    isNull(command: Command): boolean;
}


export function executeAndLogCommand(world: World, command: Command, callback?: (res: CommandResult) => void): void {
    world.events.emit(EVENT_COMMAND_LOG, command, callback);
}

export function emitCommand(world: World, command: Command, share: boolean, callback?: (res: CommandResult) => void): void {
    world.events.emit(EVENT_COMMAND_EMIT, command, callback, share);
}

export function commandRegisterPreConsequence(world: World, command: Command): void {
    world.events.emit(EVENT_COMMAND_ADD_PRE_CONSEQUENCE, command);
}

export function commandRegisterPostConsequence(world: World, command: Command): void {
    world.events.emit(EVENT_COMMAND_ADD_POST_CONSEQUENCE, command);
}
