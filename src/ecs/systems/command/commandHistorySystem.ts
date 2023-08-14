import {System} from "../../System";
import {World} from "../../World";
import { GAME_CLOCK_TYPE, GameClockResource } from "@/ecs/systems/back/pixi/pixiBoardSystem";
import {Command} from "./command";
import {COMMAND_TYPE, CommandResult, CommandSystem, EVENT_COMMAND_EMIT, EVENT_COMMAND_HISTORY_LOG} from "./commandSystem";
import { BigStorageSystem, BIG_STORAGE_TYPE } from "../back/files/bigStorageSystem";
import { FileDb, FileIndex } from "@/map/FileDb";

const HISTORY_LIMIT = 128;

interface HistoryEntry {
    cmd: Command,
    timestamp: number,
    files: string[],
}

export const COMMAND_HISTORY_TYPE = 'command_history';
export type COMMAND_HISTORY_TYPE = typeof COMMAND_HISTORY_TYPE;
export class CommandHistorySystem implements System {
    readonly world: World;
    readonly name = COMMAND_HISTORY_TYPE;
    readonly dependencies = [COMMAND_TYPE, BIG_STORAGE_TYPE];

    commandSys: CommandSystem;
    fileSys: BigStorageSystem;

    history: Array<HistoryEntry>;
    isLastPartial: boolean = false;
    index: number = 0;

    registeredFiles: string[] | undefined;
    fileKeeper: number = -1;// entity
    forceFileLogging: boolean = false;

    constructor(world: World) {
        this.world = world;

        this.history = new Array<HistoryEntry>();

        this.commandSys = this.world.requireSystem(COMMAND_TYPE);
        this.fileSys = this.world.requireSystem(BIG_STORAGE_TYPE);

        this.world.events.on("command_undo", this.onUndo, this);
        this.world.events.on("command_redo", this.onRedo, this);
        this.world.events.on("command_pre_execute", this.onCommandPreExecute, this);
        this.world.events.on(EVENT_COMMAND_HISTORY_LOG, this.logCommit, this);
        this.world.events.on("populate", this.onPopulate, this);
        this.world.events.on("file_usage_dec", this.onFileDrop, this);
    }

    private onPopulate(): void {
        this.fileKeeper = this.world.spawnEntity();
    }

    private onCommandPreExecute(isLogging: boolean): void {
        if (this.registeredFiles !== undefined) {
            console.error("unfinished command!");
        }
        this.registeredFiles = (isLogging || this.forceFileLogging) ? [] : undefined;
    }

    private onFileDrop(owner: number, file: FileIndex): void {
        if (owner === this.fileKeeper) return;
        if (this.registeredFiles && !this.registeredFiles.includes(file)) {
            this.registeredFiles.push(file);
            this.fileSys.newUse(this.fileKeeper, file);
        }
    }

    private destroyEntry(entry: HistoryEntry): void {
        setTimeout(() => {
            for (const file of entry.files) {
                this.fileSys.dropUse(this.fileKeeper, file);
            }
        }, 10);
    }

    private trimHistory(): void {
        for (let i = this.index; i < this.history.length; i++) {
            this.destroyEntry(this.history[i]);
        }
        this.history.length = this.index;
    }

    private historyPush(cmd: HistoryEntry) {
        this.trimHistory();

        if (this.history.length !== 0) {
            const lastCmd = this.history[this.history.length - 1];
            if (this.tryMerge(lastCmd, cmd)) {
                return;
            }
        }

        this.history.push(cmd);
        this.index++;
        if (this.index > HISTORY_LIMIT) {
            this.index--;
            // TODO: use some kind of random-access splice-able deque?
            this.destroyEntry(this.history.shift()!);
        }
    }

    private historyReplacePrev(cmd: HistoryEntry) {
        this.destroyEntry(this.history[this.index - 1]);
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

    private tryMerge(a: HistoryEntry, b: HistoryEntry): boolean {
        if (a.cmd.kind !== b.cmd.kind) return false;
        if (Math.abs(b.timestamp - a.timestamp) > 5000) return false;
        let kind = this.commandSys.getKind(a.cmd.kind)!;
        // commands are inverted!
        return kind.merge(b.cmd, a.cmd, true);
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
        kind.merge(cmd, lastCmd.cmd, false);
        this.historyReplacePrev({
            cmd,
            timestamp: this.world.getResource(GAME_CLOCK_TYPE)?.timestampMs ?? 0,
            files: [],
        });

        return true;
    }

    logCommit(cmd: Command | undefined, partial: boolean): void {
        // console.log("LOG", JSON.stringify(cmd));
        if (cmd === undefined) {
            if (!partial) {
                this.closePartial();
            }
            return;
        }
        let files = new Array<FileIndex>();
        if (this.registeredFiles !== undefined) {
            // File registering enabled!
            files = this.registeredFiles;
            this.registeredFiles = undefined;
        }

        if (this.processPartial(cmd, partial)) {
            return;
        }
        this.historyPush({
            cmd,
            timestamp: this.world.getResource(GAME_CLOCK_TYPE)?.timestampMs ?? 0,
            files,
        });
        this.notifyHistoryChange();
    }

    private executeEmit(cmd: Command, logFiles: boolean): Command {
        let res = {} as CommandResult;
        if (logFiles) {
            if (this.forceFileLogging) console.warn("Reentrant command emit!");
            this.forceFileLogging = true;
        }
        this.world.events.emit(EVENT_COMMAND_EMIT, cmd, (r: CommandResult) => res = r, true);
        this.forceFileLogging = false;
        return res.inverted || { kind: 'none' };
    }

    private onUndo() {
        let cmd = this.historyPeekPrev();

        if (cmd === undefined) {
            console.log("Nothing to undo");
            return;
        }
        const initialTs = cmd.timestamp;

        while (true) {
            this.historyUndo({
                cmd: this.executeEmit(cmd.cmd, true),
                timestamp: cmd.timestamp,
                files: this.registeredFiles!,
            });
            this.registeredFiles = undefined;
            this.notifyHistoryChange();
            cmd = this.historyPeekPrev();
            if (cmd === undefined || initialTs !== cmd.timestamp) break;
        }
    }

    private onRedo() {
        let cmd = this.historyPeekNext();
        if (cmd === undefined) {
            console.log("Nothing to redo");
            return;
        }
        const initialTs = cmd.timestamp;

        while (true) {
            this.historyRedo({
                cmd: this.executeEmit(cmd.cmd, true),
                timestamp: cmd.timestamp,
                files: this.registeredFiles!,
            });
            this.registeredFiles = undefined;
            this.notifyHistoryChange();

            cmd = this.historyPeekNext();
            if (cmd === undefined || initialTs !== cmd.timestamp) break;
        }
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
