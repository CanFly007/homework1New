attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLightMVP;

varying highp vec3 vNormal;
varying highp vec2 vTextureCoord;

void main(void) {

  vNormal = aNormalPosition;
  vTextureCoord = aTextureCoord;

  //shadowmap的坐标计算，只会把他变到裁剪空间中（正交摄像机的裁剪空间等于NDC，透视则不等)。
  //而透视除法变成NDC这步，以及再从[-1,1]变成[0,width]视口变换这步，是幕后完成的
  //所以shadowmap计算中的gl_Position变到裁剪空间即可
  gl_Position = uLightMVP * vec4(aVertexPosition, 1.0);
}