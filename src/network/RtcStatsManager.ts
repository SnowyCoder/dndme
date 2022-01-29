export type ConnectionStatsSummary = {
    local: string;
    remote: string;
};

/*
export class RtcStatsManager {
    private readonly conn: RTCPeerConnection;
    onSummary?: (stats: ConnectionStatsSummary) => void;

    enabled = false;
    lastSummary?: ConnectionStatsSummary;
    private isPending = false;

    constructor(conn: RTCPeerConnection) {
        this.conn = conn;
    }

    private process(report: RTCStatsReport): ConnectionStatsSummary {
        let usedPair = undefined as RTCIceCandidatePairStats | undefined;
        for (let x of report.values()) {
            const s = x as RTCStats;
            if (s.type !== 'candidate-pair') continue;
            let pair = s as RTCIceCandidatePairStats;
            if (pair.state === 'succeeded') {
                usedPair = pair;
                break;
            }
        }

        let summary = {
            local: 'unknown',
            remote: 'unknown',
        } as ConnectionStatsSummary;

        if (usedPair === undefined) {
            return summary;
        }

        let remote = undefined as RTCIceCandidateAttributes | undefined;
        if (usedPair.remoteCandidateId !== undefined) {
            remote = report.get(usedPair.remoteCandidateId);
        }

        let local = undefined as RTCIceCandidateAttributes |  undefined;
        if (usedPair.localCandidateId !== undefined) {
            local = report.get(usedPair.localCandidateId);
        }

        if (local !== undefined && local.candidateType !== undefined) {
            summary.local = local.candidateType;
            (summary as any).localDetail = local;
        }

        if (remote !== undefined && remote.candidateType !== undefined) {
            summary.remote = remote.candidateType;
            (summary as any).remoteDetail = remote;
        }

        return summary;
    }

    private onRtcReport(report: RTCStatsReport): void {
        this.isPending = false;
        if (!this.enabled) return;

        let proc = this.process(report);
        this.lastSummary = proc;
        if (this.onSummary !== undefined) {
            this.onSummary(proc);
        }

        this.schedule(10000);
    }

    private schedule(delay: number): void {
        if (!this.enabled || this.isPending) return;

        this.isPending = true;
        setTimeout(() => {
            if (['disconnected', 'closed'].indexOf(this.conn.iceConnectionState) > -1) {
                this.isPending = false;
                this.stop();
                return;
            }
            console.log(this.conn.connectionState, this.conn.iceConnectionState);
            this.conn.getStats().then(this.onRtcReport.bind(this))
        }, delay);
    }

    start(): void {
        if (this.enabled) return;
        this.enabled = true;

        this.schedule(0);
    }

    stop(): void {
        this.enabled = false;
    }
}

*/