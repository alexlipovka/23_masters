#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif
uniform vec3 lightColor; //переменная для передачи цвета источника
uniform vec2 light_pos; //переменная для передачи положения источника
uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file
varying vec4 vertColor;

varying vec2 vTexCoord;

void main() {
	vec2 pix = gl_FragCoord.xy;
	vec2 lit = light_pos.xy;
	float dist = sqrt((pix.x - lit.x)*(pix.x - lit.x) + (pix.y - lit.y)*(pix.y - lit.y));
	float attenuation = 10.0 / dist;
	// vec3 col = lightColor / 255.0;
	gl_FragColor = vec4(attenuation, attenuation, attenuation, pow(attenuation, 3.0));
	// vec4(col, 1);
	// vec2 st = gl_FragCoord.xy/u_resolution.xy; 
	// vec2 uv = vTexCoord;
	// gl_FragColor = vec4(uv,1.0,1.0);
}