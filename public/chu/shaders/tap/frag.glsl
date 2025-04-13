#version 300 es
precision highp float;

uniform sampler2D u_tex;

in vec2 v_uv;
out vec4 o_color;

void main() {
    o_color = vec4(1.0, 1.0, 1.0, 1.0);
}