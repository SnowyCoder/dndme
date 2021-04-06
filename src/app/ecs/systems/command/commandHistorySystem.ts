import {System} from "../../system";
import {World} from "../../world";
import {Command} from "./command";
import {COMMAND_TYPE, CommandResult, CommandSystem, EVENT_COMMAND_EMIT} from "./commandSystem";

export const COMMAND_HISTORY_TYPE = 'command_history';
export type COMMAND_HISTORY_TYPE = typeof COMMAND_HISTORY_TYPE;
export class CommandHistorySystem implements System {
    readonly world: World;
    readonly name = COMMAND_HISTORY_TYPE;
    readonly dependencies = [COMMAND_TYPE];

    commandSys: CommandSystem;
    history: Command[] = [];
    isLastPartial: boolean = false;
    index: number = 0;

    constructor(world: World) {
        this.world = world;

        this.commandSys = this.world.systems.get(COMMAND_TYPE) as CommandSystem;
        this.commandSys.logger = this.addLog.bind(this);

        this.world.events.on("command_undo", this.onUndo, this);
        this.world.events.on("command_redo", this.onRedo, this);
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
        let lastCmd = this.history[this.index - 1];
        if (cmd.kind !== lastCmd.kind) {
            console.warn("Warning: processing a partial with a wrong last kind, did you forget to log the last partial command");
            return false;
        }

        let kind = this.commandSys.getKind(cmd.kind)!;
        kind.merge(cmd, lastCmd);
        this.history[this.index - 1] = cmd;

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
        if (this.history.length !== this.index) {
            this.history.length = this.index;// Clear redo commands
        }
        this.history.push(cmd);
        this.index += 1;
        this.notifyHistoryChange();
    }

    private executeEmit(cmd: Command): Command {
        let res = {} as CommandResult;
        this.world.events.emit(EVENT_COMMAND_EMIT, cmd, res);
        return res.inverted || { kind: 'none' };
    }

    private onUndo() {
        if (this.index === 0) {
            console.log("Nothing to undo");
            return;
        }

        let i = this.index - 1;
        let cmd = this.history[i];
        //console.log("PRE_UNDO", JSON.stringify(this.history[i]));
        this.history[i] = this.executeEmit(cmd);
        //console.log("POST_UNDO", JSON.stringify(this.history[i]));
        this.index = i;
        this.notifyHistoryChange();
    }

    private onRedo() {
        if (this.index === this.history.length) {
            console.log("Nothing to redo");
            return;
        }

        let i = this.index;
        let cmd = this.history[i];
        //console.log("PRE_REDO", JSON.stringify(this.history[i]));
        this.history[i] = this.executeEmit(cmd);
        //console.log("POST_REDO", JSON.stringify(this.history[i]));
        this.index = i + 1;
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