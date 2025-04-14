#version 300 es
precision highp float;

uniform sampler2D u_tex;

in vec2 v_uv;
in vec3 v_note;
out vec4 o_color;

void main() {
    vec3 channels = texture(u_tex, v_uv).xyz;
    


    o_color = vec4(
        mix(vec3((channels.r / 2.0) + 0.5), v_note, channels.b), 1.0
    );
}