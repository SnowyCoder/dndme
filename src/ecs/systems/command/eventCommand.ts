import {World} from "../../World";
import {Command, CommandKind} from "./command";

export interface EventCall {
    name: string;
    args: any[];
}

export interface EventCommand extends Command {
    kind: 'event';
    do: EventCall;
    undo: EventCall;
}

export class EventCommandKind implements CommandKind {
    readonly kind = 'event';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: EventCommand): EventCommand {
        this.apply(cmd);

        return {
            kind: 'event',
            do: cmd.undo,
            undo: cmd.do,
        } as EventCommand;
    }

    apply(cmd: EventCommand): void {
        this.world.events.emit(cmd.do.name, ...cmd.do.args);
    }

    stripClient(command: EventCommand): Command[] {
        return [command];
    }

    merge(to: EventCommand, from: EventCommand): boolean {
        return false;
    }

    isNull(command: EventCommand): boolean {
        return false;
    }
}
