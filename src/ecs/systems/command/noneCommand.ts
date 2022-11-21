import {Command, CommandKind} from "./command";

export interface NoneCommand extends Command {
    kind: 'none';
}

export class NoneCommandKind implements CommandKind {
    readonly kind = 'none';

    applyInvert(cmd: NoneCommand): NoneCommand {
        return cmd;
    }

    apply(cmd: NoneCommand): void {
    }

    stripClient(command: NoneCommand): Command[] {
        return [];
    }

    merge(to: NoneCommand, from: NoneCommand): boolean {
        return true;
    }

    isNull(command: Command): boolean {
        return true;
    }
}
