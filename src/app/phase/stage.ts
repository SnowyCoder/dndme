import {Phase} from "./phase";

export class Stage extends Phase {
    phase: Phase | null;

    constructor(name: string) {
        super(name);
    }

    setPhase(phase: Phase | null) {
        if (this.phase)
            this.phase.disable();
        this.phase = phase;
        if (this.phase)
            this.phase.enable();
    }

    disable() {
        super.disable();
        this.setPhase(null);
    }
}
