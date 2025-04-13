import { type ChartNote, Chart } from "../chart";
import { Howl } from "howler";

const NOTE_ADDIN = 5000; // How soon before notes should be added to the group (ms) TODO: use bpm and sim speed as a factor
const NOTE_EXPIRATION = 1000; // How long to wait past the line to remove notes from the group (ms)
const NOTE_SPEED = 1.0; // TODO: Make this dynamic

export class ChartPlayback {
    constructor(chart: Chart) {
        this.referenceChart = chart;
    }
    update() {
        if (this.dirty) {
            // Re-read data from chart (and compute positions).
            this.referenceChart.data = this.referenceChart.data.map<ChartNote>(note => {
                note.computedPosition = (this.referenceChart.bpm / 120) * note.position;
                return note;
            });
            this.referenceChart.data.sort((a, b) => a.position - b.position);
            this.dirty = false;
        };
        if (!this.audio) return;

        const position = this.getCurrentPosition();

        this.accessNotes = [];
        for (let idx = 0; this.referenceChart.data.length > idx; idx++) {
            let note = this.referenceChart.data[idx];
            const installation = (note.computedPosition ?? 0) - (NOTE_ADDIN / 1000);
            const expiration = (note.computedPosition ?? 0) + (NOTE_EXPIRATION / 1000);
            if (installation <= position && expiration > position)
                this.accessNotes.push(note);
        };
    };
    get(type: string, max?: number): ChartNote[] {
        return this.accessNotes.filter(n => n.type == type)
            .slice(0, max ?? 1e9);
    }
    getCurrentPosition(): number {
        return (this.audio?.seek() ?? 0) - this.referenceChart.offset;
    }
    getChartVisualOffset(computedPosition?: number): number {
        return ((computedPosition ?? 0) - this.getCurrentPosition()) * 20.0 * NOTE_SPEED
    }

    dirty: boolean = true;
    accessNotes: ChartNote[] = [];

    audio: Howl | null = null;
    private referenceChart: Chart = new Chart;
};