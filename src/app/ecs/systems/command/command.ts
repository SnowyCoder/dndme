import {World} from "../../world";
import {CommandResult, EVENT_COMMAND_LOG} from "./commandSystem";

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
