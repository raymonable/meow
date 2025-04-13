#version 300 es
precision highp float;

uniform sampler2D u_tex;

in vec2 v_uv;
in float v_time;
out vec4 o_color;

void main() {
    vec4 channels = texture(u_tex, v_uv - vec2(0.0, v_time * 2.0));      
    vec3 airColor = vec3(0.2, 0.9, 0.215); // TODO: should this be swapped out with a better solution?

    float alpha = channels.a - (abs(sin(v_time * 2.0)) * channels.b);

    o_color = vec4(
        mix(vec3(1.0), airColor, channels.x), alpha
    );
}