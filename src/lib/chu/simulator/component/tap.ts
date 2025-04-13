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
        //this.texture = await textureManager.get("ground");
    }
    draw(gl: WebGL2RenderingContext, playbackChart: ChartPlayback, cameraMatrix: number[]) {
        if (!this.shader || !this.mesh) return; //|| !this.texture) return;
        gl.useProgram(this.shader);

        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.shader, "u_camera"), 
            false, cameraMatrix
        );
        /*gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.shader, "u_tex"), 0)
        */

        const notes = playbackChart.get("tap", 100);
        console.log(notes);
        if (notes.length > 0) {
            const uniformNoteData = new Float32Array(notes.length * 4); // TODO: maximum of 100
            notes.forEach((note, idx) => {
                // TODO: move to note position calculation functions so we can do projection for editor
                uniformNoteData[(idx * 4) + 0] = (note.offset * 2.0) - 16.0 + note.width;
                uniformNoteData[(idx * 4) + 1] = ((note.computedPosition ?? 0) - playbackChart.getCurrentPosition()) * 20.0 * 11.50 // TODO: speed multipliers
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