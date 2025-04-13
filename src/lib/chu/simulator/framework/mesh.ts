export interface MeshInformation {
    position?: number[];
    normal?: number[];
    uv?: number[];
    indices?: number[];
}
export interface Mesh {
    vao: WebGLVertexArrayObject;
    vertexCount: number
}

function parseWavefront(w: string) : MeshInformation {
    const positions: number[][] = [];
    const uv: number[][] = [];
    const normals: number[][] = [];

    const file = w.split("\n")
    .map(d => d.split(" "));
    file.forEach(d => {
        switch (d[0]) {
            // TODO: cleanup (several redundant statements)
            case "v":
                // Blender's exported format is slightly different than what we'd expect.
                // This swaps Y and Z directions to work for OpenGL, this statement is really ugly though
                positions.push([
                    parseFloat(d[1]),
                    parseFloat(d[3]),
                    parseFloat(d[2])
                ]);
                break;
            case "vt":
                uv.push(d.splice(1).map(f => parseFloat(f)))
                break;
            case "vn":
                normals.push(d.splice(1).map(f => parseFloat(f)))
                break;
        }
    });
    let mesh: MeshInformation = {
        position: [],
        uv: [],
        normal: [],
        indices: []
    }
    file.filter(d => d[0] == "f")
    .forEach(d => {
        d.splice(1).map(d => d.split("/")).forEach(d => {
            if (d[0])
                mesh.position = [...mesh.position ?? [], ...positions[parseInt(d[0]) - 1]]
            if (d[1])
                mesh.uv = [...mesh.uv ?? [], ...uv[parseInt(d[1]) - 1]];
            if (d[2])
                mesh.normal = [...mesh.normal ?? [], ...normals[parseInt(d[2]) - 1]];
            mesh.indices?.push(mesh.indices.length);
        });
    });
    return mesh;
};

export class MeshManager {
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    };
    async get(name: string) : Promise<MeshInformation | undefined> {
        // TODO: replace with a more efficient mesh parser & cache
        let data = await fetch(`/chu/meshes/${name}.obj`).then(r => r.text());
        return parseWavefront(data);
    };
    async getMeshArray(name: string, program: WebGLProgram): Promise<Mesh | undefined> {
        let meshInformation = await this.get(name);
        if (!meshInformation) return;

        let vao = this.gl?.createVertexArray();
        if (!vao) return;
        this.gl?.bindVertexArray(vao);
        this.gl?.useProgram(program);

        (["position", "uv", "normal"]).forEach(bufferType => {
            const buffer = this.gl?.createBuffer();
            const bufferAttribName = `a_${bufferType.toLowerCase()}`;
            if (!buffer || (this.gl?.getAttribLocation(program, bufferAttribName) ?? -1) < 0) return;

            this.gl?.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl?.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(meshInformation[bufferType as keyof MeshInformation] ?? []), this.gl.STATIC_DRAW);
            this.gl?.vertexAttribPointer(
                this.gl.getAttribLocation(program, bufferAttribName),
                bufferType == "uv" ? 2 : 3,
                this.gl.FLOAT, false, 0, 0
            );
            this.gl?.enableVertexAttribArray(this.gl.getAttribLocation(program, bufferAttribName));
        });

        const indexBuffer = this.gl?.createBuffer();
        if (!indexBuffer) return;
        this.gl?.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl?.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(meshInformation.indices ?? []), this.gl.STATIC_DRAW);

        this.gl?.bindVertexArray(null);
        return {
            vao,
            vertexCount: (meshInformation.position ?? []).length / 3
        };
    }
    private gl: WebGL2RenderingContext | null = null;
};