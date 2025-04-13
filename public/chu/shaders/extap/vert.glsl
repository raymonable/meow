#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_uv;

uniform float u_time;
uniform mat4 u_camera;
uniform vec3 g_note[100];

out vec2 v_uv;
out float v_time;

void main() {
    vec3 note = g_note[gl_InstanceID];
    float width = note.z;

    float push = a_position.x > 0.125 ? a_position.x > 0.0 ? 1.0 : 0.0 : a_position.x < -0.125 ? -1.0 : 0.0;
    vec3 position = (a_position + vec3(push * (width - 1.0), 0.0, 0.0)) + vec3(note.xy, 0.0);
    
    gl_Position = u_camera * vec4(position, 1.0);
    
    v_uv = a_uv;
    v_time = u_time;
}