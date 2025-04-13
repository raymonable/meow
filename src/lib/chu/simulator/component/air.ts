import type { ShaderManager } from "../framework/shader";
import type { TextureManager } from "../framework/texture";
import type { Mesh, MeshManager } from "../framework/mesh";

import type { Handler } from "../framework/renderer";
import type { ChartPlayback } from "../playback";

export class AirHandler implements Handler {
    async init(gl: WebGL2RenderingContext, shaderManager: ShaderManager, meshManager: MeshManager, textureManager: TextureManager) {
        this.shader = await shaderManager.get("air");
        if (!this.shader) return;

        this.mesh = await meshManager.getMeshArray("Air", this.shader);
        this.texture = await textureManager.get("air", gl.REPEAT, gl.REPEAT);
    }
    draw(gl: WebGL2RenderingContext, playbackChart: ChartPlayback, cameraMatrix: number[]) {
        if (!this.shader || !this.mesh) return; //|| !this.texture) return;
        gl.useProgram(this.shader);

        gl.uniform1f(
            gl.getUniformLocation(this.shader, "u_time"),
            playbackChart.getCurrentPosition()
        )
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shader, "u_camera"), 
            false, cameraMatrix
        );
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shader, "u_tex"), 0)
        
        const notes = playbackChart.get("air", 100);
        
        if (notes.length > 0) {
            const uniformNoteData = new Float32Array(notes.length * 4); // TODO: maximum of 100
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
        }

        gl.bindVertexArray(this.mesh.vao);
        gl.drawElementsInstanced(gl.TRIANGLES, this.mesh.vertexCount, gl.UNSIGNED_SHORT, 0, notes.length);
    };

    private mesh: Mesh | undefined;
    private texture: WebGLTexture | undefined;
    private shader: WebGLProgram | undefined;
};