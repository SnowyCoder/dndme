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

    /**
     * Merges two commands together if possible, consuming the second one if the process succeded
     * When strict=true the command will provide extra care to check that no information is lost in the merging process.
     * Ex: when two edit commands will be merged with strict=true, the kind will only merge them if they edit the same fields.
     * The system will use strict=false for PARTIAL changes, and strict=true for commands that happen at close time intervals (but they might not be related!)
     * 
     * @param to The command to merge into
     * @param from The command to be merged, will be consumed if the operation returns true
     * @param strict If true the commands should be merged only if no information is lost.
     */
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
