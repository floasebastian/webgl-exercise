//SHADER Sources START
var simpleVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec3 a_color; 	//color of the point\n\
varying vec3 v_color; 		//vColor of the point tob sent to the fragment shader\n\
void main(void){\n\
	v_color = a_color;\n\
	gl_Position = vec4(a_position, 2.0);\n\
}";

var simpleFragmentShaderSource = "\n\
precision mediump float;\n\
varying vec3 v_color;\n\
void main(void){\n\
	gl_FragColor = vec4(v_color, 1.0);\n\
}";

var textureVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec2 a_uv;		//uv texel coordinate\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
varying vec2 v_uv; 			//vUv to be sent to the fragment shader\n\
void main(void){\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;\n\
}";

var textureFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_sampler;\n\
varying vec2 v_uv;\n\
void main(void){\n\
	gl_FragColor = texture2D(u_sampler, v_uv);\n\
}";

var cubeVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
varying vec3 v_pos; 		//vPos to be sent to the fragment shader\n\
void main(void){\n\
	v_pos = a_position;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;\n\
}";

var cubeFragmentShaderSource = "\n\
precision mediump float;\n\
uniform samplerCube u_sampler;\n\
varying vec3 v_pos;\n\
void main(void){\n\
	gl_FragColor = textureCube(u_sampler, v_pos);\n\
}";

var reflectionVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec3 a_normal; 	//normal of the point\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
uniform mat4 u_w; 			//Object world Matrix \n\
varying vec4 v_posW; 		//vPosW to be sent to the fragment shader\n\
varying vec4 v_normW; 		//vNormW to be sent to the fragment shader\n\
void main(void){\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	vec4 norm = vec4(a_normal, 0.0);\n\
	gl_Position = u_wvp * pos;\n\
	v_normW = u_w * norm;\n\
	v_posW = u_w * pos;\n\
}";

var reflectionFragmentShaderSource = "\n\
precision mediump float;\n\
uniform samplerCube u_sampler;\n\
uniform vec3 u_camPosition;\n\
varying vec4 v_posW;\n\
varying vec4 v_normW;\n\
void main(void){\n\
	vec3 toEye = u_camPosition - v_posW.xyz;\n\
	vec3 reflectDir = reflect(normalize(-toEye), normalize(v_normW.xyz));\n\
	gl_FragColor = textureCube(u_sampler, reflectDir);\n\
}";

var bloomVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec2 a_uv;		//uv texel coordinate\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
varying vec3 v_color; 		//vColor of the point to be sent to the fragment shader\n\
varying vec2 v_uv; 			//vUv to be sent to the fragment shader\n\
void main(void){\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;\n\
}";

var bloomFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_sampler;\n\
varying vec2 v_uv;\n\
void main(void){\n\
	gl_FragColor = texture2D(u_sampler, v_uv);\n\
}";

var uvDisplacementVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec2 a_uv;		//uv texel coordinate\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
varying vec3 v_color; 		//vColor of the point to be sent to the fragment shader\n\
varying vec2 v_uv; 			//vUv to be sent to the fragment shader\n\
void main(void){\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;\n\
}";

var uvDisplacementFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_sampler;\n\
uniform sampler2D u_dispMap;\n\
uniform sampler2D u_alphaMask;\n\
uniform float u_time;\n\
varying vec2 v_uv;\n\
void main(void){\n\
	vec2 disp = texture2D(u_dispMap, vec2(v_uv.x, v_uv.y + u_time)).rg;\n\
	float dMax = 2.0;\n\
	vec2 offset = (2.0 * disp - 1.0) * dMax;\n\
	vec2 dispUV = v_uv + offset;\n\
	\n\
	//sample the fire texture\n\
	vec4 fire = texture2D(u_sampler, dispUV);\n\
	\n\
	//alpha mask\n\
	vec4 alpha = texture2D(u_alphaMask, v_uv);\n\
	\n\
	vec4 finalColor = fire * (1.0, 1.0, 1.0, alpha.r);\n\
	gl_FragColor = finalColor;\n\
}";

var simpleTerrainVertexShaderSource = "\n\
attribute vec3 a_position; 	//position of the point\n\
attribute vec2 a_uv;		//uv texel coordinate\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
uniform sampler2D u_heightmap;\n\
varying vec2 v_uv; 			//vUv to be sent to the fragment shader\n\
void main(void){\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	vec4 height = texture2D(u_heightmap, a_uv);\n\
	pos.y += (height.r * 0.2);\n\
	gl_Position = u_wvp * pos;\n\
}";

var simpleTerrainFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_heightmap;\n\
uniform sampler2D u_sampler;\n\
varying vec2 v_uv;\n\
void main(void){\n\
	vec4 finalColor = texture2D(u_sampler, v_uv);\n\
	vec4 height = texture2D(u_heightmap, v_uv);\n\
	finalColor = finalColor * (1.0, 1.0, 1.0, height.r);\n\
	gl_FragColor = finalColor;\n\
}";

var textureLightingVertexShaderSource = "\n\
attribute vec3 a_position; 			//position of the point\n\
attribute vec2 a_uv;				//uv texel coordinate\n\
attribute vec3 a_norm; 				//normal\n\
uniform mat4 u_wvp; 				//WorldViewProjection Matrix \n\
uniform mat3 u_norm; 				//Normal Matrix \n\
uniform vec3 u_ambientColor; 		// \n\
uniform vec3 u_lightingDirection;	// \n\
uniform vec3 u_directionalColor;	// \n\
uniform bool u_useLighting;			// \n\
varying vec2 v_uv; 					//vUv to be sent to the fragment shader\n\
varying vec3 v_lightWeighting; 		// \n\
void main(void){\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;\n\
	if(!u_useLighting){\n\
		v_lightWeighting = vec3(1.0, 1.0, 1.0);\n\
	}else{\n\
		vec3 transformedNormal = u_norm * a_norm;\n\
      	float directionalLightWeighting = max(dot(transformedNormal, u_lightingDirection), 0.0);\n\
      	v_lightWeighting = u_ambientColor + u_directionalColor * directionalLightWeighting;\n\
	}\n\
}";

var textureLightingFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_sampler;\n\
uniform vec3 u_lightPos;\n\
uniform float u_lightRadius;\n\
varying vec2 v_uv;\n\
varying vec3 v_lightWeighting;\n\
void main(void){\n\
	vec4 textureColor = texture2D(u_sampler, v_uv);\n\
	gl_FragColor = vec4(textureColor.rgb * v_lightWeighting, textureColor.a);\n\
}";
//SHADER Sources End START