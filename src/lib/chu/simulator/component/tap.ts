import type { ShaderManager } from "../framework/shader";
import type { TextureManager } from "../framework/texture";
import type { Mesh, MeshManager } from "../framework/mesh";

import type { Handler } from "../framework/renderer";
import type { ChartPlayback } from "../playback";

export class TapHandler implements Handler {
    async init(gl: WebGL2RenderingContext, shaderManager: ShaderManager, meshManager: MeshManager, textureManager: TextureManager) {
        this.shader = await shaderManager.get("tap");
        if (!this.shader) return;

        this.mesh = await meshManager.getMeshArray("Tap", this.shader);
        this.texture = await textureManager.get("tap");

        this.exShader = await shaderManager.get("extap");
        if (!this.exShader) return;
        this.exMesh = await meshManager.getMeshArray("TapFX", this.exShader);
    }
    draw(gl: WebGL2RenderingContext, playbackChart: ChartPlayback, cameraMatrix: number[]) {
        if (!this.shader || !this.mesh || !this.texture) return;
        gl.useProgram(this.shader);

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shader, "u_camera"), 
            false, cameraMatrix
        );
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shader, "u_tex"), 0)
        
        let notes = playbackChart.get("tap", 100);
        if (notes.length > 0) {
            const uniformNoteData = new Float32Array(notes.length * 4);
            notes.forEach((note, idx) => {
                uniformNoteData[(idx * 4) + 0] = (note.offset * 2.0) - 16.0 + note.width;
                uniformNoteData[(idx * 4) + 1] = playbackChart.getChartVisualOffset(note.computedPosition);
                uniformNoteData[(idx * 4) + 2] = note.width
                uniformNoteData[(idx * 4) + 3] = note.subtype ?? 0; // Regular note or ExNote?
            });
            gl.uniform4fv(
                gl.getUniformLocation(this.shader, "g_note"),
                uniformNoteData
            );

            gl.bindVertexArray(this.mesh.vao);
            gl.drawElementsInstanced(gl.TRIANGLES, this.mesh.vertexCount, gl.UNSIGNED_SHORT, 0, notes.length);
        }

        if (!this.exMesh || !this.exShader) return;

        gl.useProgram(this.exShader);

        gl.uniform1f(
            gl.getUniformLocation(this.exShader, "u_time"),
            playbackChart.getCurrentPosition()
        )
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.exShader, "u_camera"), 
            false, cameraMatrix
        );

        notes = notes.filter(note => note.subtype == 1);
        if (notes.length > 0) {
            const uniformNoteData = new Float32Array(notes.length * 3);
            notes.forEach((note, idx) => {
                uniformNoteData[(idx * 3) + 0] = (note.offset * 2.0) - 16.0 + note.width;
                uniformNoteData[(idx * 3) + 1] = playbackChart.getChartVisualOffset(note.computedPosition);
                uniformNoteData[(idx * 3) + 2] = note.width
            });
            gl.uniform3fv(
                gl.getUniformLocation(this.exShader, "g_note"),
                uniformNoteData
            );

            gl.bindVertexArray(this.exMesh.vao);
            gl.drawElementsInstanced(gl.TRIANGLES, this.exMesh.vertexCount, gl.UNSIGNED_SHORT, 0, notes.length);
        }
    };

    private mesh: Mesh | undefined;
    private exMesh: Mesh | undefined;

    private shader: WebGLProgram | undefined;
    private exShader: WebGLProgram | undefined;

    private texture: WebGLTexture | undefined;
};