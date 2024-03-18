// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL WebGLContext Definition
var GLContext = null;
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL WebGLContext Definition END

// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Canvas Definition
var Canvas = null;
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Canvas Definition END

var womanTexturePath = "Woman1.png";
	


var main = function(args){
	//get the main CANVAS ATTRIBUTE
	Canvas = document.getElementById("main-canvas");
	//set the canvas width and height by the browsers window width and height
	Canvas.width = window.innerWidth;
	Canvas.height = window.innerHeight;
	//CANVAS.style.backgroundColor = "tomato"; //set the color to see that it works
	Canvas.style.position = "absolute";
	Canvas.style.left = 0;
	Canvas.style.top = 0;
	Canvas.style.zIndex = -1;
	
	var deltaTime = 0.05;

	/*================= GET THE WEBGL CONTEXT =================*/
	try{
		GLContext = Canvas.getContext("webgl", {depth: true, antialias:true});
		/*
			Here is a nice documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
			>> canvas.getContext(contexType. contextAttribute);
			>>>> contextType: 2d, experimental-webgl/webgl, experimental-webgl2/webgl2
			>>>> contextAttribute: 
			>>>>>> 2d: alpha: boolean, willReadFrequently: boolean(?); storage: string (?)
			>>>>>> webgl: alpha: boolen, depth: boolean, stencil: boolean, antialias: boolean, premultipliedAlpha boolean, preserveDrawingBuffer: boolean
		*/
	}catch(ex){
		alert("This browser doesn't support webgl!");
		return false;
	}
	var camera = new Camera();
	camera.setPosition(0.0, 0.0, 1.5);
	/*================= Init Shaders =================*/
	//link the shader program
	var textureShader = new Shader(textureVertexShaderSource, textureFragmentShaderSource);
	/*================= Init Models =================*/
	//prepare the vertices buffer
	var womanModel = new Model(womanJson);
	/*================= Init Texture =================*/
	var womanTexture = new Texture(womanTexturePath);


	var woman = new Object(textureShader, womanModel, womanTexture, camera);
	var woman2 = new Object(textureShader, womanModel, womanTexture, camera);
	woman.setRotationDeg(0.0, 0.0, 0.0);
	woman2.setRotation(0.0, 0.0, 0.0);
	woman.setPosition(0.5, 0.0, 0.0);
	woman2.setPosition(-0.5, 0.0, 0.0);

	/*================= Draw =================*/
	GLContext.clearColor(0.0, 0.0, 0.0, 0.0);
	//GLContext.enable(GLContext.CULL_FACE);
	GLContext.enable(GLContext.DEPTH_TEST);
  	GLContext.depthFunc(GLContext.LEQUAL);
  	GLContext.clearDepth(1.0);
	

	this.key = function(evt, type){
		
		if(type.toLowerCase() === "keydown"){
			//console.log("keydown:"  + evt.charCode + "("+ evt.keyCode+")");
			switch(evt.keyCode){
				case 65 : // 'a'
					camera.move("left", deltaTime);
					break;
				case 83 : // 's'
					camera.move("backward", deltaTime);
					break;
				case 87 : // 'w'
					camera.move("forward", deltaTime);
					break;
				case 68 : // 'd'
					camera.move("right", deltaTime);
					break;

				case 37 : // 'left'
					camera.rotate("left", deltaTime);
					break;
				case 38 : // 'up'
					camera.rotate("up", deltaTime);
					break;
				case 39 : // 'right'
					camera.rotate("right", deltaTime);
					break;
				case 40 : // 'down'
					camera.rotate("down", deltaTime);
					break;


			}
		}

		if(type.toLowerCase() === "keyup"){
			//console.log("keyup:" + evt.charCode + "("+ evt.keyCode+")");
			switch(evt.keyCode){
				case 65 : // 'a'
					camera.stopMove("left");
					break;
				case 83 : // 's'
					camera.stopMove("backward");
					break;
				case 87 : // 'w'
					camera.stopMove("forward");
					break;
				case 68 : // 'd'
					camera.stopMove("right");
					break;

				case 37 : // 'left'
					camera.stopRotate("left");
					break;
				case 38 : // 'up'
					camera.stopRotate("up");
					break;
				case 39 : // 'right'
					camera.stopRotate("right");
					break;
				case 40 : // 'down'
					camera.stopRotate("down");
					break;
			}
		}

	}

	this.mouse = function(evt){

	}

	var loop = function(){
		render();
		update();
	};

	var render = function(){
		GLContext.viewport(0.0, 0.0, Canvas.width, Canvas.height);
		GLContext.clear(GLContext.COLOR_BUFFER_BIT);
		//draw stuff starts here		
		woman.draw();
		woman2.draw();
		//draw stuff ends here
		GLContext.flush(); //show the render
		window.requestAnimationFrame(loop); //redraws when ready
	};

	var update = function(){
		camera.update();
	};

	loop();

};


/*>>>>>>>>>>>>>>>> Shader Class START*/
function Shader(vertexShaderSource, fragmentShaderSource){
	this.vertexShader = 0;
	this.fragmentShader = 0;
	this.program = 0;
	
	this.init = function(VSSource, FSSource){
		this.vertexShader  = GLContext.createShader(GLContext.VERTEX_SHADER);
		GLContext.shaderSource(this.vertexShader, VSSource);
		GLContext.compileShader(this.vertexShader);
		var success = GLContext.getShaderParameter(this.vertexShader, GLContext.COMPILE_STATUS);
		if(!success){
			alert("Error in " + "VERTEX" + " shader: " + GLContext.getShaderInfoLog(this.vertexShader));
		}

		this.fragmentShader  = GLContext.createShader(GLContext.FRAGMENT_SHADER);
		GLContext.shaderSource(this.fragmentShader, FSSource);
		GLContext.compileShader(this.fragmentShader);
		success = GLContext.getShaderParameter(this.fragmentShader, GLContext.COMPILE_STATUS);
		if(!success){
			alert("Error in " + "FRAGMENT" + " shader: " + GLContext.getShaderInfoLog(this.fragmentShader));
		}

		this.program = GLContext.createProgram();
		GLContext.attachShader(this.program, this.vertexShader);
		GLContext.attachShader(this.program, this.fragmentShader);
	};

	this.init(vertexShaderSource, fragmentShaderSource);
}
/*>>>>>>>>>>>>>>>> Shader Class END*/

/*>>>>>>>>>>>>>>>> Model Class START*/
function Model(jsonData){
	this.verticesBuffer = 0;
	this.indicesBuffer = 0;
	this.verticesCount = jsonData.verticesCount;
	this.indicesCount = jsonData.indicesCount;
	this.vertexSize = jsonData.vertexSize;
	this.init = function(jsonData){
		var vertices = jsonData.verticesData;
		var float32Array = new Float32Array(vertices);
		this.verticesBuffer = GLContext.createBuffer();
		GLContext.bindBuffer(GLContext.ARRAY_BUFFER, this.verticesBuffer);
		GLContext.bufferData(
			GLContext.ARRAY_BUFFER,
			float32Array,
			GLContext.STATIC_DRAW
			);
		GLContext.bindBuffer(GLContext.ARRAY_BUFFER, null);

		var indices = jsonData.indicesData;
		var uint16array = new Uint16Array(indices);
		this.indicesBuffer = GLContext.createBuffer();
		GLContext.bindBuffer(GLContext.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
		GLContext.bufferData(
			GLContext.ELEMENT_ARRAY_BUFFER,
			uint16array,
			GLContext.STATIC_DRAW
			);
		GLContext.bindBuffer(GLContext.ELEMENT_ARRAY_BUFFER, null);
	};

	this.getVBOId = function(){return this.verticesBuffer;};
	this.getIBOId = function(){return this.indicesBuffer;};
	this.getVerticesCount = function(){return this.verticesCount;};
	this.getIndicesCount = function(){return this.indicesCount;};
	this.getVertexSize = function(){return this.vertexSize;};
	this.init(jsonData);
}
/*>>>>>>>>>>>>>>>> Model Class END*/

/*>>>>>>>>>>>>>>>> Model Class START*/
function Texture(filename){
	this.texture = 0;
	this.texType = GLContext.TEXTURE_2D;
	this.imageLoaded = false;
	this.init = function(filename){
		var image = document.getElementById(filename);
		var texture = GLContext.createTexture();
		GLContext.pixelStorei(GLContext.UNPACK_FLIP_Y_WEBGL, true);
		GLContext.bindTexture(GLContext.TEXTURE_2D, texture);
		GLContext.texImage2D(GLContext.TEXTURE_2D, 0, GLContext.RGBA, GLContext.RGBA, GLContext.UNSIGNED_BYTE, image);
		GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_MAG_FILTER, GLContext.LINEAR);
		GLContext.texParameteri(GLContext.TEXTURE_2D, GLContext.TEXTURE_MIN_FILTER, GLContext.LINEAR);
		GLContext.bindTexture(GLContext.TEXTURE_2D, null);
		this.texture = texture;		
	};

	this.getTEXId = function(){return this.texture;};
	this.getTextureType = function(){return this.textType;};
	this.init(filename);
	
}
/*>>>>>>>>>>>>>>>> Model Class END*/


/*>>>>>>>>>>>>>>>> Object Class START*/
function Object(shader, model, texture, camera){
	// >>>>> Attributes :: private
	var model = model;
	var shader = shader;
	var texture = texture;
	var cam = camera;
	var pos = [0.0, 0.0, 0.0];
	var rot = [0.0, 0.0, 0.0];
	var v = [0.0, 0.0, 0.0];
	var vRot = [0.0, 0.0, 0.0];
	var scale = [1.0, 1.0, 1.0];
	var WVP = mat4.create();
	// >>>>> Functions :: Initializers
	this.init = function(){
	}
	// >>>>> Functions :: Initializers END


	// >>>>> Functions :: Setters
	this.setPosition = function(x, y, z){
		if(typeof x !== 'undefined'){
			pos[0] = parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			pos[1] = parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			pos[2] = parseFloat(z);	
		}
	};

	this.setRotation = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] = parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			rot[1] = parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			rot[2] = parseFloat(z);	
		}
	};

	this.setRotationDeg = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] = (parseFloat(x) / 180.0) * Math.PI; 
		}
		if(typeof y !== 'undefined'){
			rot[1] = (parseFloat(y) / 180.0) * Math.PI; 
		}
		if(typeof z !== 'undefined'){
			rot[2] = (parseFloat(z) / 180.0) * Math.PI;	
		}
	};

	this.setScale = function(scale){
		this.scale = parseFloat(scale);
	};
	// >>>>> Functions :: Setters END

	// >>>>> Functions :: Calculations	
	this.incPosition = function(x, y, z){
		if(typeof x !== 'undefined'){
			pos[0] += parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			pos[1] += parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			pos[2] += parseFloat(z);	
		}
	};

	this.incRotation = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] += parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			rot[1] += parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			rot[2] += parseFloat(z);	
		}
	};
	this.calculateWorldMatrix = function(mat){
		var scaleMat = mat4.create(); mat4.identity(scaleMat); mat4.scale(scaleMat, scale);
		var rotZ = mat4.create(); mat4.identity(rotZ); mat4.rotateZ(rotZ, rot[2]);
		var rotX = mat4.create(); mat4.identity(rotX); mat4.rotateX(rotX, rot[0]);
		var rotY = mat4.create(); mat4.identity(rotY); mat4.rotateY(rotY, rot[1]);
		var tran = mat4.create(); mat4.identity(tran); mat4.translate(tran, pos);
		var result = mat4.create();
		mat4.multiply(tran, rotY, result);
		mat4.multiply(result, rotX, result);
		mat4.multiply(result, rotZ, result);
		mat4.multiply(result, scaleMat, result);
		return result;
	};
	// >>>>> Functions :: Calculations END

	// >>>>> Functions :: Renderers
	this.update = function(){
		var world = this.calculateWorldMatrix(); 
		var view = cam.getViewMatrix();
		var projection = cam.getProjectionMatrix();
		var result = mat4.create();
		mat4.multiply(projection, view, result);
		mat4.multiply(result, world, result);
		WVP = result;
	}

	this.draw = function(){
		this.update();
		GLContext.linkProgram(shader.program);
		var a_position = GLContext.getAttribLocation(shader.program, "a_position");
		var a_uv = GLContext.getAttribLocation(shader.program, "a_uv");
		var a_color = GLContext.getAttribLocation(shader.program, "a_color");
		var u_wvp = GLContext.getUniformLocation(shader.program, "u_wvp");
		var u_sampler = GLContext.getUniformLocation(shader.program, "u_sampler");
		GLContext.useProgram(shader.program);

		GLContext.bindBuffer(GLContext.ARRAY_BUFFER, model.getVBOId());
		GLContext.bindBuffer(GLContext.ELEMENT_ARRAY_BUFFER, model.getIBOId());
		
		if(texture.getTEXId()){
			GLContext.activeTexture(GLContext.TEXTURE0);
			GLContext.bindTexture(GLContext.TEXTURE_2D, texture.getTEXId());
			GLContext.uniform1i(u_sampler, 0);
		}
		
		if(u_wvp != -1){
			GLContext.uniformMatrix4fv(u_wvp, false, WVP);
		}

		/*void glVertexAttribPointer(GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride,const GLvoid * pointer);*/
		if(a_position != -1){
			GLContext.enableVertexAttribArray(a_position);
			GLContext.vertexAttribPointer(a_position, 3, GLContext.FLOAT, false, model.getVertexSize(), 0);
		}

		if(a_uv != -1){
			GLContext.enableVertexAttribArray(a_uv);
			GLContext.vertexAttribPointer(a_uv, 2, GLContext.FLOAT, false, model.getVertexSize(), 12 * 4);
		}

		if(a_color != -1){
			GLContext.enableVertexAttribArray(a_color);
			GLContext.vertexAttribPointer(a_color, 3, GLContext.FLOAT, false, model.getVertexSize(), 14 * 4);
		}

		GLContext.drawElements(GLContext.TRIANGLES, model.getIndicesCount(), GLContext.UNSIGNED_SHORT, 0);
	};
	// >>>>> Functions :: Renderers END

	this.init(); //call init as constructor
}
/*>>>>>>>>>>>>>>>> Object Class END*/


/*>>>>>>>>>>>>>>>> Camera Class START*/
function Camera(){
	var pos = [0.0, 0.0, 0.0];
	var rot = [0.0, 0.0, 0.0];
	var projMatrix = mat4.create();
	var viewMatrix = mat4.create();
	var v = [0.0, 0.0, 0.0];
	var vRot = [0.0, 0.0, 0.0];
	// Functions :: Initializers
	this.init = function(){
		projMatrix = this.calculateProjectionMatrix();
		viewMatrix = this.calculateViewMatrix();
	};

	// Functions :: Setters
	this.setPosition = function(x, y, z){
		if(typeof x !== 'undefined'){
			pos[0] = parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			pos[1] = parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			pos[2] = parseFloat(z);	
		}
	};

	this.setRotation = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] = parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			rot[1] = parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			rot[2] = parseFloat(z);	
		}
	};
	// Functions :: Setters END

	// Functions :: Calculations
	this.incPosition = function(x, y, z){
		if(typeof x !== 'undefined'){
			pos[0] += parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			pos[1] += parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			pos[2] += parseFloat(z);	
		}
	};

	this.incRotation = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] += parseFloat(x); 
		}
		if(typeof y !== 'undefined'){
			rot[1] += parseFloat(y); 
		}
		if(typeof z !== 'undefined'){
			rot[2] += parseFloat(z);	
		}
	};

	this.calculateWorldMatrix = function(mat){
		//var scaleMat = mat4.create(); mat4.identity(scaleMat); mat4.scale(scaleMat, scale);
		var rotZ = mat4.create(); mat4.identity(rotZ); mat4.rotateZ(rotZ, rot[2]);
		var rotX = mat4.create(); mat4.identity(rotX); mat4.rotateX(rotX, rot[0]);
		var rotY = mat4.create(); mat4.identity(rotY); mat4.rotateY(rotY, rot[1]);
		var tran = mat4.create(); mat4.identity(tran); mat4.translate(tran, pos);
		var result = mat4.create();
		mat4.multiply(tran, rotY, result);
		mat4.multiply(result, rotX, result);
		mat4.multiply(result, rotZ, result);
		//mat4.multiply(result, scaleMat, result);
		return result;
	}
	this.calculateProjectionMatrix = function(){
		var fovy = 1.0;
		var aspect = parseFloat(Canvas.width) / parseFloat(Canvas.height);
		var near = 0.1;
		var far = 500.0; 
		var projection = mat4.create(); mat4.identity(projection);
		projection = mat4.setPerspective(fovy, aspect, near, far);
		return projection;
		//return [1.830488, 0.0, 0.0, 0.0 , /**/ 0.0, 1.830488, 0.0, 0.0, /**/ 0.0, 0.0, -1.000400, -1.0, /**/ 0.0, 0.0, -0.200040, 0.0];
	};

	this.calculateViewMatrix = function(){
		var minPos = [(-1.0 * pos[0]), (-1.0 * pos[1]), (-1.0 * pos[2])];
		var tran = mat4.create(); mat4.identity(tran); mat4.translate(tran, minPos);
		var rotY = mat4.create(); mat4.identity(rotY); mat4.rotateY(rotY, (-1.0 * rot[1]));
		var rotX = mat4.create(); mat4.identity(rotX); mat4.rotateX(rotX, (-1.0 * rot[0]));
		var rotZ = mat4.create(); mat4.identity(rotZ); mat4.rotateZ(rotZ, (-1.0 * rot[2]));
		var result = mat4.create(); mat4.identity(result);
		mat4.multiply(rotZ, rotX, result);
		mat4.multiply(result, rotY, result);
		mat4.multiply(result, tran, result);
		return result;
	};

	this.move = function(direction, speed){
		switch(direction.toLowerCase()){
			case "forward" :
				v[2] = (speed * -1.0);
				break;
			case "backward" :
				v[2] = (speed);
				break;
			case "left" :
				v[0] = (speed * -1.0);
				break;
			case "right" :
				v[0] = (speed);
				break;
		}
	};

	this.stopMove = function(direction){
		switch(direction.toLowerCase()){
			case "forward" :
			case "backward" :
				v[2] = 0.0;
				break;
			case "left" :
			case "right" :
				v[0] = 0.0;
				break;
		}
	};

	this.updateMovement = function(){
		var world = this.calculateWorldMatrix();
		mat4.multiplyVec3(world, v, pos);
	}

	this.rotate = function(direction, speed){
		switch(direction.toLowerCase()){
			case "up" :
				vRot[0] = speed;
				break;
			case "down" :
				vRot[0] = -1.0 * speed;
				break;
			case "left" :
				vRot[1] = speed;
				break;
			case "right" :
				vRot[1] = -1.0 * speed;
				break;
		}
	};

	this.stopRotate = function(direction){
		switch(direction.toLowerCase()){
			case "up" :
			case "down" :
				vRot[0] = 0.0;
				break;
			case "left" :
			case "right" :
				vRot[1] = 0.0;
				break;
		}
	};
	// Functions :: Calculations END
	
	// Functions :: Getters
	this.getProjectionMatrix = function(){
		return projMatrix;
	};
	this.getViewMatrix = function(){
		return viewMatrix;
	};
	// Functions :: Getters END

	// Functions :: Renderers
	this.update = function(){	
		this.incRotation(vRot[0], vRot[1], vRot[2]);
		this.updateMovement();
		viewMatrix = this.calculateViewMatrix();
	};
	// Functions :: Renderers END

	this.init();
}
/*>>>>>>>>>>>>>>>> Camera Class END*/

/*>>>>>>>>>>>>>>>> CameraAction Class START*/
function CameraAction(camera, type, deltaTime){
	var max = 3;
	var cam = camera;
	var action = Array();
	this.init = function(){
		for(var i = 0; i<max; i++){
			action[i] = "NOTHING";
		}
	}

};
/*>>>>>>>>>>>>>>>> CameraAction Class END*/