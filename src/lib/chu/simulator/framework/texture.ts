export class TextureManager {
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    };
    get(name: string) : Promise<WebGLTexture | undefined> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                if (!this.gl) return;
                const texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    image,
                );
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                resolve(texture);
            };
            image.onerror = reject;
            image.src = `/chu/tex/${name}.png`;
        })
    }
    private gl: WebGL2RenderingContext | null = null;
};