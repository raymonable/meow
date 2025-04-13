#version 300 es
precision highp float;

in float v_time;
in vec2 v_uv;
out vec4 o_color;

void main() {
    o_color = vec4(
        vec3(0.95), abs(sin(v_time * 2.0)) / 2.0
    );
}