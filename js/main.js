// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Project Config Start
var Project = function(){
	this.authors = ["flo sebastian"];
	this.version = "0.0.1a";
	this.status = 0;
	this.statusToStr = function(){
		switch(this.status){
			case 0: return "development";
			case 1: return "debug";
			case 2: return "production";
		}
	}
};
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Project Config End


// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL WebGLContext Definition
var gl = null;
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL WebGLContext Definition END

// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Canvas Definition
var Canvas = null;
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Canvas Definition END

// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Modes Definition
var DrawMode = null;
// >>>>>>>>>>>>>>>>>>>>>>>> GLOBAL Modes Definition END
var totalDeltaTime = 0;
var Gen = new Generator();
var Lighting = new Light();

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MAIN START*/
var main = function(args){
	var isRunning = false;
	var deltaTime = 0.05;
	var objects = null;
	var camera = null;
	var timer  = new Timer();
	var fpsContainer = null;
	var isShowingFPS = true;
	
  	this.init = function(){
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

		/*================= GET THE WEBGL CONTEXT =================*/
		try{
			gl = Canvas.getContext("webgl", {alpha: true, depth: true, antialias:true});
			/*
				Here is a nice documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
				>> canvas.getContext(contexType. contextAttribute);
				>>>> contextType: 2d, experimental-webgl/webgl, experimental-webgl2/webgl2
				>>>> contextAttribute: 
				>>>>>> 2d >> alpha: boolean, willReadFrequently: boolean(?); storage: string (?)
				>>>>>> webgl >> alpha:boolean, depth:boolean, stencil:boolean, antialias:boolean, premultipliedAlpha:boolean, preserveDrawingBuffer:boolean
			*/
		}catch(ex){
			alert("This browser doesn't support webgl!");
			return false;
		}
		
		/*================= Init Shaders =================*/
		//link the shader program
		var textureShader = new Shader(textureVertexShaderSource, textureFragmentShaderSource);
		//var textureLightingShader = new Shader(textureLightingVertexShaderSource, textureLightingFragmentShaderSource);
		var cubeShader = new Shader(cubeVertexShaderSource, cubeFragmentShaderSource);
		var reflectShader = new Shader(reflectionVertexShaderSource, reflectionFragmentShaderSource);
		var uvDisplacementShader = new Shader(uvDisplacementVertexShaderSource, uvDisplacementFragmentShaderSource);
		var terrainShader = new Shader(simpleTerrainVertexShaderSource, simpleTerrainFragmentShaderSource);
		/*================= Init Models =================*/
		//prepare the vertices buffer
		var womanModel = new Model(womanJson);
		var woman2Model = new Model(woman2Json);
		var skyboxModel = new Model(skyboxJson);
		var ballModel = new Model(ballJson); 
		var fireModel = new Model(fireJson);
		var terrainData = Gen.generateTerrainModel(64, 64);
		var terrainModel = new Model(terrainData);
		/*================= Init Textures =================*/
		var womanTexture = new Texture("Woman1.png");
		var woman2Texture = new Texture("Woman2.png");
		var skyboxFilenames = [
								"skybox_right.png", "skybox_left.png", 
								"skybox_top.png", "skybox_bottom.png",
								"skybox_front.png", "skybox_back.png" 
								];
		var skyboxTexture = new Texture(skyboxFilenames);
		var fireTextures = Array();
		fireTextures.push(new Texture("fire.png", "u_sampler"));
		fireTextures.push(new Texture("fire_displacement_map.png", "u_dispMap"));
		fireTextures.push(new Texture("fire_alpha_mask.png", "u_alphaMask"));
		var terrainTextures = Array();
		var skyTexture = new Texture("skybox_top.png");
		terrainTextures.push(new Texture("skybox_top.png", "u_sampler"));
		terrainTextures.push(new Texture("terrain.png", "u_heightmap"));
		
		/*================= Init Cameras =================*/
		camera = new Camera();
		camera.setPosition(0.0, -17.0, 0.0);

		/*================= Init Objects =================*/
		var woman = new Object(textureShader, womanModel, womanTexture, camera);
		var woman2 = new Object(textureShader, woman2Model, woman2Texture, camera);
		var skybox = new Object(cubeShader, skyboxModel, skyboxTexture, camera);
		var ball = new Object(reflectShader, ballModel, skyboxTexture,camera);
		var fire = new Object(uvDisplacementShader, fireModel, fireTextures, camera);
		var fire2 = new Object(uvDisplacementShader, fireModel, fireTextures, camera);
		var terrain = new Object(terrainShader, terrainModel, terrainTextures, camera);

		skybox.setScale(20.0);
		ball.setScale(0.01);
		ball.setPosition(2.0, -19.0, 0.0);
		woman.setPosition(1.0, -20.0, 0.0);
		woman2.setPosition(-1.0, -20.0, 0.0);
		fire.setScale(0.05);
		fire.setPosition(0.0, -20, 0.0);
		fire.enableBlending();
		fire2.setScale(0.05);
		fire2.setPosition(0.0, -20, 0.0);
		fire2.enableBlending();
		fire2.setRotationDeg(0.0, 180.0, 0.0);
		var target = fire.getPosition();
		woman.lookAtXZ(target[0], target[2]);
		woman2.lookAtXZ(target[0], target[2]);
		terrain.enableBlending();
		terrain.setScale(2);
		terrain.setPosition(0.0, -19, -5.0);
		terrain.setRotationDeg(90.0, 0.0, 0.0);
		objects = new ObjectPool();
		objects.add("skybox", skybox);
		objects.add("woman_1", woman);
		objects.add("woman_2", woman2);
		objects.add("reflection_ball", ball);
		objects.add("fire", fire);
		objects.add("fire_2", fire2);

		/*================= Adding Terrain =================*/	
		objects.add("terrain", terrain);
		/*================= Draw Preparation =================*/
		DrawMode = gl.TRIANGLES;
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.enable(gl.CULL_FACE);
		//gl.enable(gl.ALPHA_TEST);
		gl.enable(gl.DEPTH_TEST);
	  	gl.depthFunc(gl.LEQUAL);//or LESS
	  	gl.clearDepth(1.0);


	  	isRunning = true;
	  	loop();
  	};

/*>>>>>>>>>>>>>>>> Events START*/
	this.moveCamera = function(dir){
		camera.move(dir.toLowerCase(), deltaTime);
	};

	this.rotateCamera = function(dir){
		camera.rotate(dir.toLowerCase(), deltaTime);
	};

	this.stopMoveCamera = function(dir){
		camera.stopMove(dir.toLowerCase());
	};

	this.stopRotateCamera = function(dir){
		camera.stopRotate(dir.toLowerCase());
	};

	this.key = function(evt, type){
		if(type.toLowerCase() === "keydown"){
			//console.log("keydown:"  + evt.charCode + "("+ evt.keyCode+")");
			switch(evt.keyCode){
				case 65 : // 'A'
					camera.move("left", deltaTime);
					break;
				case 83 : // 'S'
					camera.move("backward", deltaTime);
					break;
				case 87 : // 'W'
					camera.move("forward", deltaTime);
					break;
				case 68 : // 'D'
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

				case 81 : // 'Q'
					if(DrawMode == gl.TRIANGLES){
						DrawMode = gl.LINE_STRIP;
					}else{
						DrawMode = gl.TRIANGLES
					}
					break;

				case 70 : // 'Q'
					isShowingFPS = !isShowingFPS;
					fpsContainer.innerHTML = "";
					break;
				case 72 : // 'H'
					var camPos = camera.getPosition();
					var wmn = objects.get("woman_1");
					var wmn2 = objects.get("woman_2");
					
					wmn.lookAtXZ(camPos[0], camPos[2]);
					wmn2.lookAtXZ(camPos[0], camPos[2]);

					var wmnPos = wmn.getPosition();
					var wmn2Pos = wmn2.getPosition();

					setTimeout(wmn.lookAtXZ, 2000, wmn2Pos[0], wmn2Pos[2]);
					setTimeout(wmn2.lookAtXZ, 2000, wmnPos[0], wmnPos[2]);

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

	this.mouse = function(evt, type){
		if(type.toLowerCase() === "mousewheel"){
			var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
			camera.move("forward", delta * deltaTime);
			setTimeout(camera.stopMove, 1000, "forward");
		}
	}
/*>>>>>>>>>>>>>>>> Events END*/

/*>>>>>>>>>>>>>>>> Loops and Renderer START*/
	var loop = function(){
		if(isRunning){
			timer.update();
			render();
			update();
			if(isShowingFPS){
				showFPS("fps-cont");
			}
		}
	};

	var render = function(){
		gl.viewport(0.0, 0.0, Canvas.width, Canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		//draw stuff starts here		
		objects.drawAll();
		//draw stuff ends here
		gl.flush(); //show the render
		window.requestAnimationFrame(loop); //redraws when ready
	};

	var update = function(){
		camera.update();
		deltaTime = timer.getDeltaTime();
		totalDeltaTime += deltaTime;
		if(totalDeltaTime > 2){
			totalDeltaTime = 0.0;
		}
	};
/*>>>>>>>>>>>>>>>> Loops and Renderer END*/

/*>>>>>>>>>>>>>>>> Miscs START*/
	var showFPS = function(containerId){
		if(fpsContainer === null){
			fpsContainer =  document.getElementById(containerId);
		}
		FPS = timer.calculateFPS();
		fpsContainer.innerHTML = "FPS: " + FPS + "; DT: " + deltaTime;
	};
/*>>>>>>>>>>>>>>>> Miscs End*/

/*>>>>>>>>>>>>>>>> Constructor Trigger START*/
	this.init();
/*>>>>>>>>>>>>>>>> Constructor Trigger END*/
};
/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MAIN END*/

/*>>>>>>>>>>>>>>>> Shader Class START*/
function Shader(vertexShaderSource, fragmentShaderSource){
	this.vertexShader = 0;
	this.fragmentShader = 0;
	this.program = 0;
	
	this.init = function(VSSource, FSSource){
		this.vertexShader  = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(this.vertexShader, VSSource);
		gl.compileShader(this.vertexShader);
		var success = gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS);
		if(!success){
			alert("Error in " + "VERTEX" + " shader: " + gl.getShaderInfoLog(this.vertexShader));
		}
		this.fragmentShader  = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(this.fragmentShader, FSSource);
		gl.compileShader(this.fragmentShader);
		success = gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS);
		if(!success){
			alert("Error in " + "FRAGMENT" + " shader: " + gl.getShaderInfoLog(this.fragmentShader));
		}

		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vertexShader);
		gl.attachShader(this.program, this.fragmentShader);
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
	this.attribPos = jsonData.attribPos;
	this.attribSize = jsonData.attribSize;
	
	this.init = function(jsonData){
		var vertices = jsonData.verticesData;
		var float32Array = new Float32Array(vertices);
		this.verticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			float32Array,
			gl.STATIC_DRAW
			);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		var indices = jsonData.indicesData;
		var uint16array = new Uint16Array(indices);
		this.indicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			uint16array,
			gl.STATIC_DRAW
			);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};

	this.getVBOId = function(){return this.verticesBuffer;};
	this.getIBOId = function(){return this.indicesBuffer;};
	this.getVerticesCount = function(){return this.verticesCount;};
	this.getIndicesCount = function(){return this.indicesCount;};
	this.getVertexSize = function(){return this.vertexSize;};
	
	this.getAttribStrideStart = function(attribName){ 
		switch(attribName.toLowerCase()){
			case "position":
			case "pos":
				if(this.attribPos == undefined){
					return 0;
				}else{
					return this.attribPos.pos;
				}
				break;
			case "normal":
			case "norm":
				if(this.attribPos == undefined){
					return 3 * 4;
				}else{
					return this.attribPos.norm;
				}
				break;
			case "binormal":
			case "bnorm":
			case "binorm":
				if(this.attribPos == undefined){
					return 6 * 4;
				}else{
					return this.attribPos.binorm;
				}
				break;
			case "tangent":
			case "tgt":
			case "tan":
				if(this.attribPos == undefined){
					return 9 * 4;
				}else{
					return this.attribPos.tgt;
				}
				break;
			case "uv":
			case "texcoord":
				if(this.attribPos == undefined){
					return 12 * 4;
				}else{
					return this.attribPos.uv;
				}
				break;
			case "col":
			case "color":
			case "clr":
				if(this.attribPos == undefined){
					return 14 * 4;
				}else{
					return this.attribPos.col;
				}
				break;
			}
		}

		this.getAttribStrideSize = function(attribName){ 
		switch(attribName.toLowerCase()){
			case "position":
			case "pos":
				if(this.attribSize == undefined){
					return 3;
				}else{
					return this.attribSize.pos;
				}
				break;
			case "normal":
			case "norm":
				if(this.attribSize == undefined){
					return 3;
				}else{
					return this.attribSize.norm;
				}
				break;
			case "binormal":
			case "bnorm":
			case "binorm":
				if(this.attribSize == undefined){
					return 3;
				}else{
					return this.attribSize.binorm;
				}
				break;
			case "tangent":
			case "tgt":
			case "tan":
				if(this.attribSize == undefined){
					return 3;
				}else{
					return this.attribSize.tgt;
				}
				break;
			case "uv":
			case "texcoord":
				if(this.attribSize == undefined){
					return 2;
				}else{
					return this.attribSize.uv;
				}
				break;
			case "col":
			case "color":
			case "clr":
				if(this.attribSize == undefined){
					return 4;
				}else{
					return this.attribSize.col;
				}
				break;
		}
	}

	this.init(jsonData);
}

/*>>>>>>>>>>>>>>>> Model Class END*/

/*>>>>>>>>>>>>>>>> Texture Class START*/
function Texture(filenames, shaderUniformName){

	var uniform = "u_sampler";
	if(shaderUniformName !== undefined){
		uniform = shaderUniformName;
	}

	var texture = 0;
	var textType = 0; 
	this.init = function(filenames){
		if(Array.isArray(filenames)){
			if(filenames.length == 6){
				this.initCubeTexture(filenames);
			}else{
				this.init2DTexture(filenames[0]);	
			}
		}else{
			this.init2DTexture(filenames);
		}
		gl.texParameteri(textType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(textType, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(textType);
		gl.bindTexture(textType, null);
	};

	this.init2DTexture =function(filename){
		console.log(filename);
		textType = gl.TEXTURE_2D;
		var image = document.getElementById(filenames);
		texture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // ( ? )
		gl.bindTexture(textType, texture);
		gl.texImage2D(textType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	};

	this.initCubeTexture = function(filenames){
		textType = gl.TEXTURE_CUBE_MAP;
		texture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(textType, texture);
		for(var i = 0; i < 6; i++){
			var image = document.getElementById(filenames[i]);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}
	};

	this.getTEXId = function(){return texture;};
	this.getTextureType = function(){return textType;};
	this.getUniformName = function(){return uniform;};
	this.init(filenames);
}
/*>>>>>>>>>>>>>>>> Texture Class END*/



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
	var isBlending = false;
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

	this.setScale = function(newScale){
		scale[0] = parseFloat(newScale);
		scale[1] = parseFloat(newScale);
		scale[2] = parseFloat(newScale);
	};

	this.enableBlending = function(){
		isBlending = true;
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

	this.incRotationDeg = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] += (parseFloat(x) / 180.0) * Math.PI; 
		}
		if(typeof y !== 'undefined'){
			rot[1] += (parseFloat(y) / 180.0) * Math.PI; 
		}
		if(typeof z !== 'undefined'){
			rot[2] += (parseFloat(z) / 180.0) * Math.PI;	
		}
	};

	this.lookAtXZ = function(targetX, targetZ){
		var deltaX = targetX - pos[0];
		var deltaZ = targetZ - pos[2];
		rot[1] = Math.atan2(deltaX, deltaZ);
	}

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

	// >>>>> Functions :: Getters START
	this.getPosition = function(){
		return [pos[0], pos[1], pos[2]];
	}
	// >>>>> Functions :: Getters END

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
		gl.linkProgram(shader.program);
		var a_position = gl.getAttribLocation(shader.program, "a_position");
		var a_uv = gl.getAttribLocation(shader.program, "a_uv");
		var a_color = gl.getAttribLocation(shader.program, "a_color");
		var a_norm = gl.getAttribLocation(shader.program, "a_normal");
		
		var u_wvp = gl.getUniformLocation(shader.program, "u_wvp");
		var u_w = gl.getUniformLocation(shader.program, "u_w");
		var u_camPos = gl.getUniformLocation(shader.program, "u_camPosition");
		var u_time = gl.getUniformLocation(shader.program, "u_time");
		
		//lighting
		var u_norm = gl.getUniformLocation(shader.program, "u_norm");
		var u_ambientColor = gl.getUniformLocation(shader.program, "u_ambientColor"); 		
		var u_lightingDirection = gl.getUniformLocation(shader.program, "u_lightingDirection");	
		var u_directionalColor = gl.getUniformLocation(shader.program, "u_directionalColor");	
		var u_useLighting = gl.getUniformLocation(shader.program, "u_useLighting");			

		gl.useProgram(shader.program);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.getVBOId());
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.getIBOId());
		if(Array.isArray(texture)){ //giving grant to multitexture object
			//console.log("multitex");
			for(var i = 0; i < texture.length; i++){
				var u_name = gl.getUniformLocation(shader.program, texture[i].getUniformName());
				if(u_name != -1){
					if(texture[i].getTEXId()){
						//console.log(texture[i].getUniformName() + ":" + texture[i].getTEXId());
						gl.activeTexture(gl.TEXTURE0 + i);
						gl.bindTexture(texture[i].getTextureType(), texture[i].getTEXId());
						gl.uniform1i(u_name, i);
					}
				}
			}
		}else{
			//console.log("singletex");
			var u_name = gl.getUniformLocation(shader.program, texture.getUniformName());
			if(u_name != -1){
				if(texture.getTEXId()){

					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(texture.getTextureType(), texture.getTEXId());
					gl.uniform1i(u_name, 0);
				}
			}
		}
		
		
		if(u_wvp != -1){
			gl.uniformMatrix4fv(u_wvp, false, WVP);
		}

		if(u_w != -1){
			var w = this.calculateWorldMatrix();
			gl.uniformMatrix4fv(u_w, false, w);
		}

		if(u_camPos != -1){
			var camPos = cam.getPosition();
			gl.uniform3f(u_camPos, camPos[0], camPos[1], camPos[2]);
		}

		if(u_time != -1){
			gl.uniform1f(u_time, totalDeltaTime);
		}

		//Lighting Uniforms
		if(u_norm != -1){
			var nMatrix;
			var unorm;
			var w = this.calculateWorldMatrix();
			var v = cam.calculateViewMatrix();
			var wv = mat4.multiply(v, w);
			nMatrix = mat4.inverse(WVP);
			unorm = mat4.toMat3(nMatrix);
			gl.uniformMatrix3fv(u_norm, false, unorm);
		}

		if(u_ambientColor != -1){
			gl.uniform3fv(u_ambientColor, Lighting.getAmbientColor());
		}

		if(u_lightingDirection != -1){
			var adjustedLD = vec3.create();
			vec3.normalize(Lighting.getDirection(), adjustedLD);
			adjustedLD[0] = adjustedLD[0] * -1;
			adjustedLD[1] = adjustedLD[1] * -1;
			adjustedLD[2] = adjustedLD[2] * -1;
			gl.uniform3fv(u_lightingDirection, adjustedLD);
		}

		if(u_directionalColor != -1){
			gl.uniform3fv(u_directionalColor, Lighting.getDirectionalColor());
		}
		if(u_useLighting != -1){
			gl.uniform1f(u_useLighting, Lighting.isEnable());
		}


		/*void glVertexAttribPointer(GLuint index, GLint size, GLenum type, GLboolean normalized, GLsizei stride,const GLvoid * pointer);*/
		if(a_position != -1){
			gl.enableVertexAttribArray(a_position);
			gl.vertexAttribPointer(a_position, model.getAttribStrideSize("POSITION"), gl.FLOAT, false, model.getVertexSize(), model.getAttribStrideStart("POSITION"));
		}

		if(a_uv != -1){
			gl.enableVertexAttribArray(a_uv);
			gl.vertexAttribPointer(a_uv, model.getAttribStrideSize("UV"), gl.FLOAT, false, model.getVertexSize(), model.getAttribStrideStart("UV"));
		}

		if(a_color != -1){
			gl.enableVertexAttribArray(a_color);
			gl.vertexAttribPointer(a_color, model.getAttribStrideSize("COLOR"), gl.FLOAT, false, model.getVertexSize(), model.getAttribStrideStart("COLOR"));
		}

		if(a_norm != -1){
			gl.enableVertexAttribArray(a_norm);
			gl.vertexAttribPointer(a_norm, model.getAttribStrideSize("NORMAL"), gl.FLOAT, false, model.getVertexSize(), model.getAttribStrideStart("NORMAL"));
		}

		if(isBlending){
			gl.enable(gl.BLEND);
			//gl.disable(gl.DEPTH_TEST);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);	
		}
		
		gl.drawElements(DrawMode, model.getIndicesCount(), gl.UNSIGNED_SHORT, 0);

		if(isBlending){
			gl.disable(gl.BLEND);
			//gl.enable(gl.DEPTH_TEST);
		}

	};
	// >>>>> Functions :: Renderers END

	this.init(); //call init as constructor
}
/*>>>>>>>>>>>>>>>> Object Class END*/

/*>>>>>>>>>>>>>>>> ObjectPool Class START*/
function ObjectPool(){
	var objects = Array();
	var names = Array();
	var count = 0;
	this.add = function(name, object){
		console.log("Object: " + name + " successfully added to the ObjectPool!");
		names.push(name);
		objects[name] = object;
		count++;
	};

	this.remove =  function(name){
		var selected  = objects[name];
		objects[name] = null;
		names.splice(names.indexOf(name), 1);
		count--;
	}

	this.drawAll = function(){
		for(var i = 0; i < count; i++){
			var selected = objects[names[i]];
			if(selected !== undefined && selected !== null){
				objects[names[i]].draw();	
			}
		}
	};

	this.loadFromJson = function(jsonData){

	};

	this.get = function(name){
		return objects[name];
	}
}
/*>>>>>>>>>>>>>>>> ObjectPool Class END*/


/*>>>>>>>>>>>>>>>> Camera Class START*/
function Camera(){
	var pos = [0.0, 0.0, 0.0];
	var rot = [0.0, 0.0, 0.0];
	var projMatrix = mat4.create();
	var viewMatrix = mat4.create();
	var moveV = 2.5;
	var rotV = 1.5;
	var v = [0.0, 0.0, 0.0];
	var vRot = [0.0, 0.0, 0.0];
	var isLookAt = false;
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

	this.incRotationDeg = function(x, y, z){
		if(typeof x !== 'undefined'){
			rot[0] += (parseFloat(x) / 180.0) * Math.PI; 
		}
		if(typeof y !== 'undefined'){
			rot[1] += (parseFloat(y) / 180.0) * Math.PI; 
		}
		if(typeof z !== 'undefined'){
			rot[2] += (parseFloat(z) / 180.0) * Math.PI;	
		}
	};

	this.lookAtXZ = function(targetX, targetZ){
		var deltaX = targetX - pos[0];
		var deltaZ = targetZ - pos[2];
		rot[1] = Math.atan2(deltaX, deltaZ);
		this.incRotationDeg(0.0, 180.0, 0.0);
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

	this.move = function(direction, deltaTime){
		speed = deltaTime * moveV;
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

	this.rotate = function(direction, deltaTime){
		speed = deltaTime * rotV;
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

	this.updateRotation = function(){
		if(isLookAt){

		}else{
			this.incRotation(vRot[0], vRot[1], vRot[2]);
		}
			
	}
	// Functions :: Calculations END
	
	// Functions :: Getters
	this.getProjectionMatrix = function(){
		return projMatrix;
	};
	this.getViewMatrix = function(){
		return viewMatrix;
	};
	this.getPosition = function(){
		return [pos[0], pos[1], pos[2]];
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

/*>>>>>>>>>>>>>>>> Timer Class START*/
function Timer(){
	var first = Date.now();
	var frameCounter = 0;
	var dynamic;
	this.calculateFPS = function(){
		var elapsed = (parseFloat(Date.now()) - parseFloat(first)) / 1000;
		var FPS =  parseInt(parseFloat(frameCounter) / elapsed);//frameCounter +  " / " + elapsed + " = "  + parseInt(parseFloat(frameCounter) / elapsed);
		return FPS;
	}

	//This function will update the timer.
	//Please put this function BEFORE Draw/Render call
	this.update = function(){
		frameCounter++;
		dynamic = Date.now();
		if(frameCounter > 1000){
			first = Date.now();
			frameCounter = 0;
		}
	}

	//This function will get the delta time
	//The normal way to call this function is AFTER Draw/Render call
	this.getDeltaTime = function() {
		return parseFloat(Date.now() - dynamic) / 1000;
	}
};
/*>>>>>>>>>>>>>>>> Timer Class END*/

/*>>>>>>>>>>>>>>>> FogFX Class START*/
function Fog(){
	var fogStart = [];
	var fogDistance;
	var enabled = false;
	this.isEnable = function(){
		return enabled;
	}
	this.enable = function(){
		enabled = true;
	}
	this.disable = function(){
		enabled = false();
	}
	this.toggle = function(){
		enabled = !enabled;
	}
}
/*>>>>>>>>>>>>>>>> FogFX Class END*/

/*>>>>>>>>>>>>>>>> Lighting Class START*/
function Light(){
	var ambientColor 		= [0.5, 0.5, 0.5];
	var directionalColor 	= [0.8, 0.8, 0.8];
	var direction 			= [-0.25, -0.25, -1.0];
	var enabled 			= 1;
	var pos 				= [1.0, 1.0, 1.0];
	this.isEnable = function(){
		return enabled;
	}
	
	this.enable = function(){
		enabled = 1;
	}
	
	this.disable = function(){
		enabled = 0;
	}
	
	this.toggle = function(){
		enabled = !enabled;
	}
	
	this.setAmbientColor = function(r, g, b){
		ambientColor = [r, g, b];
	}
	
	this.setDirectionalColor = function(r, g, b){
		directionalColor = [r, g, b];
	}

	this.setDirection = function(x, y ,z){
		direction = [x, y, z];
	}

	this.getAmbientColor = function(){
		return ambientColor;
	}

	this.getDirectionalColor = function(){
		return directionalColor;
	}

	this.getDirection = function(){
		return direction;
	}

}
/*>>>>>>>>>>>>>>>> Lighting Class END*/

/*>>>>>>>>>>>>>>>> Generator Class START*/
function Generator(){
	this.generateTerrainModel = function(terrainMapWidth, terrainMapHeight){
		var pivotX = 0;
		var pivotZ = 0;
		var startX = pivotX - 1;
		var startZ = pivotZ - 1;
		var startU = 0.0;
		var startV = 1.0;
		var distX = parseFloat( 2.0 / parseFloat(terrainMapWidth-1));
		var distZ = parseFloat( 2.0 / parseFloat(terrainMapHeight-1));
		var distU = parseFloat( 1.0 / parseFloat(terrainMapWidth-1));
		var distV = parseFloat( 1.0 / parseFloat(terrainMapHeight-1));
		var jsonData = [];
		jsonData.attribPos = {"pos": 0, "uv" : 12};
		jsonData.attribSize = {"pos" : 3, "uv" : 2};
		jsonData.vertexSize = 20;
		jsonData.verticesCount = terrainMapWidth * terrainMapHeight;
		jsonData.verticesData = [];
		jsonData.indicesData = [];
		jsonData.indicesCount = 0;
		var xcum = 0;
		var zcum = 0;
		var ucum = 0;
		var vcum = 0;
		for(var xz = 0; xz < jsonData.verticesCount; xz++){
			//Generating Vertices START
			if((xz % terrainMapWidth) == 0 && xz != 0){
				xcum = 0;
				ucum = 0
				zcum += distZ;
				vcum += distV;
			}
			jsonData.verticesData.push(startX + xcum);
			jsonData.verticesData.push(0.0);
			jsonData.verticesData.push(startZ + zcum);
			jsonData.verticesData.push(startU + ucum);
			jsonData.verticesData.push(startV - vcum);
			
			//Generating Vertices END
			//console.log(xz + ":" + parseFloat(startX + xcum) + ", " + parseFloat(startZ + zcum));
			xcum += distX;
			ucum += distU;
			if(((xz + 1) % terrainMapWidth) == 0 || xz > ((jsonData.verticesCount - terrainMapWidth) - 1)){
				//
			}else{
				jsonData.indicesData.push(xz);
				jsonData.indicesData.push(xz + 1);
				jsonData.indicesData.push(xz + 1 + terrainMapWidth);
				//console.log(xz + ", " + (xz + 1) + ", " + (xz + 1 + terrainMapWidth));
				jsonData.indicesData.push(xz + 1 + terrainMapWidth);
				jsonData.indicesData.push(xz + terrainMapWidth);
				jsonData.indicesData.push(xz);
				//console.log((xz + 1 + terrainMapWidth) + ", " + (xz + terrainMapWidth) + ", " + xz);
				jsonData.indicesCount+= 6;
			}
			
		}
		return jsonData;
	};
};
/*>>>>>>>>>>>>>>>> Generator Class END*/

