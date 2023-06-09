#define PROCESSING_COLOR_SHADER
uniform mat4 transform;
attribute vec4 vertex;
attribute vec4 color;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec4 vertColor;
varying vec2 vTexCoord;

void main() {
	vTexCoord = aTexCoord;
	vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0;
  gl_Position = positionVec4;
}