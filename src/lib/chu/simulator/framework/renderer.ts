import { ShaderManager } from "./shader";
import { TextureManager } from "./texture";
import { MeshManager } from "./mesh";

import { ChartPlayback } from "../playback";

import { mat4, glMatrix } from "gl-matrix";

export interface Handler {
    draw: (gl: WebGL2RenderingContext, playbackChart: ChartPlayback, cameraMatrix: number[]) => void
    init: (gl: WebGL2RenderingContext, shaderManager: ShaderManager, meshManager: MeshManager, textureManager: TextureManager) => Promise<void>
};

export enum RendererType {
    Simulator,
    Editor
}

// Import handlers
import { GroundHandler } from "../component/ground";
import { TapHandler } from "../component/tap";
import { AirHandler } from "../component/air";

export class Renderer {
    constructor(gl: WebGL2RenderingContext, playbackChart: ChartPlayback, type: RendererType) {
        this.gl = gl;
        this.playbackChart = playbackChart;
        this.type = type;

        this.shaderManager = new ShaderManager(gl);
        this.meshManager = new MeshManager(gl);
        this.textureManager = new TextureManager(gl);

        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.cullFace(gl.FRONT)

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);  
    };
    async init() {
        // Initialize handlers
        this.addHandler(new GroundHandler);
        this.addHandler(new TapHandler);
        this.addHandler(new AirHandler);
    }
    async addHandler(handler: Handler) {
        if (!this.gl || !this.shaderManager || !this.meshManager || !this.textureManager) return;

        this.handlers.push(handler);
        await handler.init(this.gl, this.shaderManager, this.meshManager, this.textureManager);
    };
    draw() {
        this.gl?.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl?.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        let cameraMatrix = mat4.create();
        switch (this.type) {
            case RendererType.Simulator:
                // TODO: compile into a matrix that doesn't require glMatrix
                mat4.perspective(cameraMatrix, 70, 1920 / 1080, 0.1, 1000);
                mat4.translate(cameraMatrix, cameraMatrix, [0.0, 0.0, -54]);
                mat4.rotateX(cameraMatrix, cameraMatrix, glMatrix.toRadian(-61.25));
                mat4.translate(cameraMatrix, cameraMatrix, [0.0, -26.25, 0.0])
                break;
            case RendererType.Editor:
                // TODO
        }

        this.handlers.forEach(handler => {
            if (this.gl && this.playbackChart)
                handler.draw(this.gl, this.playbackChart, cameraMatrix as number[])
        });

        this.playbackChart?.update();
        requestAnimationFrame(this.draw.bind(this));
    }

    private shaderManager: ShaderManager | null = null;
    private meshManager: MeshManager | null = null;
    private textureManager: TextureManager | null = null;

    private gl: WebGL2RenderingContext | null = null;
    private playbackChart: ChartPlayback | null = null;
    private type: RendererType = RendererType.Simulator;

    handlers: Handler[] = [];
};