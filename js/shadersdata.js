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
attribute vec3 a_color; 	//color of the point\n\
attribute vec2 a_uv;		//uv texel coordinate\n\
uniform mat4 u_wvp; 		//WorldViewProjection Matrix \n\
varying vec3 v_color; 		//vColor of the point to be sent to the fragment shader\n\
varying vec2 v_uv; 			//vUv to be sent to the fragment shader\n\
void main(void){\n\
	v_color = a_color;\n\
	v_uv = a_uv;\n\
	vec4 pos = vec4(a_position, 1.0);\n\
	gl_Position = u_wvp * pos;//pos;\n\
}";

var textureFragmentShaderSource = "\n\
precision mediump float;\n\
uniform sampler2D u_sampler;\n\
varying vec3 v_color;\n\
varying vec2 v_uv;\n\
void main(void){\n\
	gl_FragColor = texture2D(u_sampler, v_uv);\n\
}";
//SHADER Sources End START