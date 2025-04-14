#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_uv;

uniform mat4 u_camera;
uniform vec4 g_note[100];

out vec2 v_uv;
out vec3 v_note;

float height = 0.01; // Prevents z-fighting

void main() {
    vec4 note = g_note[gl_InstanceID];
    float width = note.z;

    float push = a_position.x > 0.125 ? a_position.x > 0.0 ? 1.0 : 0.0 : a_position.x < -0.125 ? -1.0 : 0.0;
    vec3 position = (a_position + vec3(push * (width - 1.0), 0.0, 0.0)) + vec3(note.xy, height);
    
    gl_Position = u_camera * vec4(position, 1.0);
    
    switch (int(note.a)) {
        case 0:
            v_note = vec3(1.0, 0.0, 0.0); break;
        case 1:
            v_note = vec3(1.0, 1.0, 0.0); break;
        case 2:
            v_note = vec3(0.0, 1.0, 0.0); break;
    }

    v_uv = a_uv;
}