import type { ShaderManager } from "../framework/shader";
import type { TextureManager } from "../framework/texture";
import type { Mesh, MeshManager } from "../framework/mesh";

import type { Handler } from "../framework/renderer";
import type { ChartPlayback } from "../playback";

export class GroundHandler implements Handler {
    async init(gl: WebGL2RenderingContext, shaderManager: ShaderManager, meshManager: MeshManager, textureManager: TextureManager) {
        this.shader = await shaderManager.get("ground");
        if (!this.shader) return;

        this.mesh = await meshManager.getMeshArray("Ground", this.shader);
        this.texture = await textureManager.get("ground");
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

        gl.bindVertexArray(this.mesh.vao);
        gl.drawElements(gl.TRIANGLES, this.mesh.vertexCount, gl.UNSIGNED_SHORT, 0);
    };

    private mesh: Mesh | undefined;
    private texture: WebGLTexture | undefined;
    private shader: WebGLProgram | undefined;
};