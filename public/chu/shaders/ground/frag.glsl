#version 300 es
precision highp float;

uniform sampler2D u_tex;

in vec2 v_uv;
out vec4 o_color;

void main() {
    vec3 channels = texture(u_tex, v_uv * vec2(2.0, 1.0)).xyz;
    /*o_color = vec4(
        vec3(0.0, 0.0, 0.0),
        channels.r
    );*/

    vec3 stageColor = vec3(0.375, 0.375, 0.875);

    o_color = vec4(
        mix(vec3(0.05 / channels.r), mix(stageColor, vec3(1.0), channels.b), min(channels.g + channels.b, 1.0)),
        0.875
    );
}