#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif
uniform sampler2D light; //растровое изображение с освещенностью
uniform sampler2D mask; //растровое изображение с тенями
uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

varying vec4 vertColor;

void main() {
	//получим цвет пикселя из слоя с тенями
	// vec4 maskPix = texture2D(mask, gl_FragCoord.xy / 400.0);
	vec4 maskPix = texture2D(mask, vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y));// / u_resolution.xy);
	//получим цвет пикселя из слоя с освещенностью
	// vec4 lightPix = texture2D(light, gl_FragCoord.xy / 400.0);
	vec4 lightPix = texture2D(light, vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y));// / u_resolution.xy);
	//вычисление результирующего цвета
	vec4 resultColor = lightPix * maskPix; //смешивание по типу MULTIPLY
	//назначение вычисленного цвета текущему пикселю
	//gl_FragColor – стандартная переменная, так же, как gl_FragCoord
	gl_FragColor = resultColor;
	// gl_FragColor = vec4(0, 0,  1, 1);
}