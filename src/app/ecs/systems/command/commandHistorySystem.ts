import {System} from "../../system";
import {World} from "../../world";
import {Command} from "./command";
import {COMMAND_TYPE, CommandResult, CommandSystem, EVENT_COMMAND_EMIT, LogHook} from "./commandSystem";
import {NoneCommand} from "./noneCommand";

const HISTORY_LIMIT = 128;

interface HistoryEntry {
    cmd: Command,
    // Manages dependencies and relations
    //pre: Command[],
    //post: Command[],
}

export const COMMAND_HISTORY_TYPE = 'command_history';
export type COMMAND_HISTORY_TYPE = typeof COMMAND_HISTORY_TYPE;
export class CommandHistorySystem implements System, LogHook {
    readonly world: World;
    readonly name = COMMAND_HISTORY_TYPE;
    readonly dependencies = [COMMAND_TYPE];

    //private prepared?: HistoryEntry;
    commandSys: CommandSystem;
    history: Array<HistoryEntry>;
    isLastPartial: boolean = false;
    index: number = 0;

    constructor(world: World) {
        this.world = world;

        this.history = new Array<HistoryEntry>();

        this.commandSys = this.world.systems.get(COMMAND_TYPE) as CommandSystem;
        this.commandSys.logger = this;

        this.world.events.on("command_undo", this.onUndo, this);
        this.world.events.on("command_redo", this.onRedo, this);
    }

    private historyPush(cmd: HistoryEntry) {
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

    private historyReplacePrev(cmd: HistoryEntry) {
        this.history[this.index - 1] = cmd;
    }

    private historyUndo(replace: HistoryEntry) {
        this.historyReplacePrev(replace);
        this.index--;
    }

    private historyRedo(replace: HistoryEntry) {
        this.index++;
        this.historyReplacePrev(replace);
    }

    private historyPeekPrev(): HistoryEntry | undefined {
        if (this.index <= 0) return undefined;
        return this.history[this.index - 1];
    }

    private historyPeekNext(): HistoryEntry | undefined {
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
        if (cmd.kind !== lastCmd.cmd.kind) {
            console.warn("Warning: processing a partial with a wrong last kind, did you forget to log the last partial command");
            return false;
        }

        let kind = this.commandSys.getKind(cmd.kind)!;
        kind.merge(cmd, lastCmd.cmd);
        this.historyReplacePrev({
            cmd,
        });

        return true;
    }

    logPrepare(partial: boolean): void {
        // TODO
        /*this.prepared = {
            cmd: { kind: 'none'} as NoneCommand,
            post: [], pre: [],
        };*/
    }


    logCommit(cmd: Command | undefined, partial: boolean): void {
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
        this.historyPush({ cmd });
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

        this.historyUndo({ cmd: this.executeEmit(cmd.cmd)});
        this.notifyHistoryChange();
    }

    private onRedo() {
        let cmd = this.historyPeekNext();
        if (cmd === undefined) {
            console.log("Nothing to redo");
            return;
        }

        this.historyRedo({ cmd: this.executeEmit(cmd.cmd) });
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
