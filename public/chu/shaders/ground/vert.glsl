#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_uv;

uniform mat4 u_camera;

out vec2 v_uv;

void main() {
    gl_Position = u_camera * vec4(a_position, 1.0);
    v_uv = a_uv;
}