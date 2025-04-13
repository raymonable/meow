export class ShaderManager {
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    };
    get(name: string) : Promise<WebGLProgram | undefined> {
        // Using custom Promise callbacks to have "safer" returns.
        return new Promise((finish, fail) => {
            if (this.cache[name])
                return finish(this.cache[name]);
            this.access(name)
                .then(finish)
                .catch(fail);
        });
    };

    private async access(name: string) : Promise<WebGLProgram | undefined> {
        if (!this.gl) return;

        const vertSource = await fetch(`/chu/shaders/${name}/vert.glsl`).then(r => r.text());
        const fragSource = await fetch(`/chu/shaders/${name}/frag.glsl`).then(r => r.text());

        const vertShader = compileShader(this.gl, vertSource, this.gl.VERTEX_SHADER);
        const fragShader = compileShader(this.gl, fragSource, this.gl.FRAGMENT_SHADER);
        const program = this.gl.createProgram();
        
        if (!vertShader || !fragShader || !program) return;

        this.gl.attachShader(program, vertShader);
        this.gl.attachShader(program, fragShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
            throw new Error(this.gl.getProgramInfoLog(program) ?? "?");

        this.cache[name] = program;
        this.gl.deleteShader(vertShader);
        this.gl.deleteShader(fragShader);
        this.gl.useProgram(program);

        return program;
    };

    private cache: Record<string, WebGLProgram> = {};
    private gl: WebGL2RenderingContext | null = null;
};

function compileShader(gl: WebGL2RenderingContext, source: string, type: number) : WebGLShader | undefined {
    const shader = gl.createShader(type);
    if (!shader) return;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(`${type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT"} SHADER:\n${gl.getShaderInfoLog(shader)}`);
    return shader;
}