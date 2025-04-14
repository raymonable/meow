import { Chart } from "../chart";
import { Renderer, RendererType } from "./framework/renderer";

import { ShaderManager } from "./framework/shader";
import { TextureManager } from "./framework/texture";
import { ChartPlayback } from "./playback";

export class Simulator {
    constructor(chart: Chart, gl: WebGL2RenderingContext) {
        this.chart = chart;
        this.playbackChart = new ChartPlayback(this.chart);
        this.renderer = new Renderer(gl, this.playbackChart, RendererType.Simulator);
    };
    async init() {
        if (!this.playbackChart) return;
        this.playbackChart?.update();

        // TODO: maybe pass through a URL in init
        this.playbackChart.audio = new Howl({
            src: ['/chu/samples/k.mp3'],
            html5: true
        });
        await this.renderer?.init();
        this.playbackChart.audio.play(); // temporary

        this.renderer?.draw();
    }

    private renderer: Renderer | null = null;

    playbackChart: ChartPlayback | null = null;
    private chart: Chart = new Chart;
};