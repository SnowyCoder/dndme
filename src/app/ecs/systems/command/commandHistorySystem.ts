import {System} from "../../system";
import {World} from "../../world";
import {Command} from "./command";
import {COMMAND_TYPE, CommandResult, CommandSystem, EVENT_COMMAND_EMIT} from "./commandSystem";

const HISTORY_LIMIT = 128;

export const COMMAND_HISTORY_TYPE = 'command_history';
export type COMMAND_HISTORY_TYPE = typeof COMMAND_HISTORY_TYPE;
export class CommandHistorySystem implements System {
    readonly world: World;
    readonly name = COMMAND_HISTORY_TYPE;
    readonly dependencies = [COMMAND_TYPE];

    commandSys: CommandSystem;
    history: Array<Command>;
    isLastPartial: boolean = false;
    index: number = 0;

    constructor(world: World) {
        this.world = world;

        this.history = new Array<Command>();

        this.commandSys = this.world.systems.get(COMMAND_TYPE) as CommandSystem;
        this.commandSys.logger = this.addLog.bind(this);

        this.world.events.on("command_undo", this.onUndo, this);
        this.world.events.on("command_redo", this.onRedo, this);
    }

    private historyPush(cmd: Command) {
        if (this.history.length !== this.index) {
            this.history.length = this.index;
        }
        this.history.push(cmd);
        this.index++;
        if (this.index > HISTORY_LIMIT) {
            this.index--;
            // TODO: use some kind of random-access splice-able deque?
            this.history.shift();
        }
    }

    private historyReplacePrev(cmd: Command) {
        this.history[this.index - 1] = cmd;
    }

    private historyUndo(replace: Command) {
        this.historyReplacePrev(replace);
        this.index--;
    }

    private historyRedo(replace: Command) {
        this.index++;
        this.historyReplacePrev(replace);
    }

    private historyPeekPrev(): Command | undefined {
        if (this.index <= 0) return undefined;
        return this.history[this.index - 1];
    }

    private historyPeekNext(): Command | undefined {
        if (this.index >= this.history.length) return undefined;
        return this.history[this.index];
    }

    notifyHistoryChange() {
        this.world.events.emit("command_history_change", this.canUndo(), this.canRedo());
    }

    closePartial() {
        this.isLastPartial = false;
    }

    processPartial(cmd: Command, partial: boolean): boolean {
        if (this.isLastPartial && !partial) {
            this.isLastPartial = false;
            // continue, this is the last partial round
        } else {
            // it's not partial (but also the last one was also not a partial)
            if (!partial) return false;

            // the last one was not partial but this one is,
            // add the command to the queue and wait for the next
            if (!this.isLastPartial && partial) {
                this.isLastPartial = true;
                return false;
            }
        }
        let lastCmd = this.historyPeekPrev()!;
        if (cmd.kind !== lastCmd.kind) {
            console.warn("Warning: processing a partial with a wrong last kind, did you forget to log the last partial command");
            return false;
        }

        let kind = this.commandSys.getKind(cmd.kind)!;
        kind.merge(cmd, lastCmd);
        this.historyReplacePrev(cmd);

        return true;
    }

    addLog(cmd: Command | undefined, partial: boolean) {
        //console.log("LOG", JSON.stringify(cmd));
        if (cmd === undefined) {
            if (!partial) {
                this.closePartial();
            }
            return;
        }

        if (this.processPartial(cmd, partial)) {
            return;
        }
        this.historyPush(cmd);
        this.notifyHistoryChange();
    }

    private executeEmit(cmd: Command): Command {
        let res = {} as CommandResult;
        this.world.events.emit(EVENT_COMMAND_EMIT, cmd, res);
        return res.inverted || { kind: 'none' };
    }

    private onUndo() {
        let cmd = this.historyPeekPrev();

        if (cmd === undefined) {
            console.log("Nothing to undo");
            return;
        }

        this.historyUndo(this.executeEmit(cmd));
        this.notifyHistoryChange();
    }

    private onRedo() {
        let cmd = this.historyPeekNext();
        if (cmd === undefined) {
            console.log("Nothing to redo");
            return;
        }

        this.historyRedo(this.executeEmit(cmd));
        this.notifyHistoryChange();
    }

    canRedo(): boolean {
        return this.history.length > this.index;
    }

    canUndo(): boolean {
        return this.index > 0;
    }

    enable(): void {
    }

    destroy(): void {
    }

}
