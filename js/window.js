
var fileInput = document.getElementById("input-file");
var start = document.getElementById("start-btn");
var display = document.getElementById("display");
var welcome = document.getElementById("welcome-screen");
var controlDesc = document.getElementById("help-desc");
var mainControl = document.getElementById("main-control");
var textureRegister = new imagesRegister();
var loadingTexturesProgress = 0;
var loadingTexturesCount = 0;
var validTextureCount = 0;

var isMobile = false;

//-init control button START
var btnMovL = document.getElementById("btn-mov-left");
var btnMovR = document.getElementById("btn-mov-right");
var btnMovU = document.getElementById("btn-mov-up");
var btnMovD = document.getElementById("btn-mov-down");

var btnRotL = document.getElementById("btn-rot-left");
var btnRotR = document.getElementById("btn-rot-right");
var btnRotU = document.getElementById("btn-rot-up");
var btnRotD = document.getElementById("btn-rot-down");
//-init control button END

var mainC = null;

onLoaded();

function handleFileSelect(evt){
	welcome.parentNode.removeChild(welcome);
	start.style.visibility = "visible";
	/*
	welcome.parentNode.removeChild(welcome);
	display.innerHTML = "";
	for(var i = 0, file; file = fileInput.files[i]; i++){
		var imageType = 'image.*';
		if(file.type.match(imageType)){
			validTextureCount++;		 	
		}
	}

	for(var i = 0, file; file = fileInput.files[i]; i++){
		var imageType = 'image.*';
		if(file.type.match(imageType)){
		 	var reader = new FileReader();
		 	reader.onload = (function(theFile){
		 		return function(e){
		 			var img = new Image();
		 			img.src = e.target.result;
		 			img.id = theFile.name;
		 			contents.push(theFile.name);
		 			img.style.visibility="hidden";
		 			display.appendChild(img);
		 			loadingTexturesProgress += parseFloat(100.0/parseFloat(validTextureCount));
		 			loadingTexturesCount++;
		 			console.log("Texture::"+theFile.name + "::Ready ("+loadingTexturesProgress+"%)\n");
		 			if(loadingTexturesCount == validTextureCount){
		 				start.style.visibility = "visible";
		 			}
		 		};
		 	})(file);
		 	reader.readAsDataURL(file);
		}
	}
	*/
}

function runMain(){
	isMobile = true;//window.mobileAndTabletcheck();
	start.style.visibility = "hidden";
	controlDesc.style.visibility = "visible";
	if(isMobile)
		mainControl.style.visibility = "visible";
	mainC = new main();
	textureRegister.cleanUpImages();
	textureRegister.cleanUpData();
}

function onLoaded(){
	
	/*
	//still failed with Cross Image problem
	textureRegister.add("Woman1.png", "https://lh3.googleusercontent.com/46wjMHVbGd_POMElH1mPdJmv93ZJxqnXHnFUV_35m7o=s512-no");
	textureRegister.add("Woman2.png", "https://lh3.googleusercontent.com/z2X2KYuiIiuaio8Met_7HcTwS5ZEp10iBCY2-54p_DQ=s512-no");
	textureRegister.add("fire.png", "https://lh3.googleusercontent.com/PJFFrO6v9rclSPwltVoy6X9q6gYq4HOPPk35s7P-YSk=w512-h256-no");
	textureRegister.add("skybox_top.png", "https://lh3.googleusercontent.com/fWl7rwRsF25havsGSYJWJ4Nx5-m4EMUdGUV2jmpW13s=s855-no");
	textureRegister.add("skybox_bottom.png", "https://lh3.googleusercontent.com/Ggxrv0ONpRsKaREGv1pmGh4GasvmYMGyLwvW3IID2Hs=s855-no");
	textureRegister.add("skybox_right.png", "https://lh3.googleusercontent.com/DTBQTKYeczITh5y8-agg9MOyeXwjfrqQSztOr4ns9-A=s855-no");
	textureRegister.add("skybox_left.png", "https://lh3.googleusercontent.com/rvhVvKkKN6QUWJnu6EouaC_50aBT5RVvy42rzKxQAXQ=s855-no");
	textureRegister.add("skybox_front.png", "https://lh3.googleusercontent.com/GAwBwB-KWGc3_hFgSzVejbZBZipthmb317AA8hhdOE0=s855-no");
	textureRegister.add("skybox_back.png", "https://lh3.googleusercontent.com/5fLjD81jIsRKvx_y2RSCXqzclvAYjnN_0eozLc0a4y4=s855-no");
	*/

	///*
	textureRegister.add("Woman1.png", "Resources/Textures/Woman1.png");
	textureRegister.add("Woman2.png", "Resources/Textures/Woman2.png");
	textureRegister.add("fire.png", "Resources/Textures/fire.png");
	textureRegister.add("fire_alpha_mask.png", "Resources/Textures/fire_alpha_mask.png");
	textureRegister.add("fire_displacement_map.png", "Resources/Textures/fire_displacement_map.png");
	textureRegister.add("skybox_top.png", "Resources/Textures/skybox_top.png");
	textureRegister.add("skybox_bottom.png", "Resources/Textures/skybox_bottom.png");
	textureRegister.add("skybox_right.png", "Resources/Textures/skybox_right.png");
	textureRegister.add("skybox_left.png", "Resources/Textures/skybox_left.png");
	textureRegister.add("skybox_front.png", "Resources/Textures/skybox_front.png");
	textureRegister.add("skybox_back.png", "Resources/Textures/skybox_back.png");
	textureRegister.add("terrain.png", "Resources/Textures/terrain.png");

	//*/
	textureRegister.loadInto("display");
}

function onKeyUp(evt){
	if(mainC !== null){
		mainC.key(evt, "keyup");
	}
}

function onKeyDown(evt){
	if(mainC !== null){
		mainC.key(evt, "keydown");	
	}
}

function onKeyPress(evt){
	if(mainC !== null){
		mainC.key(evt, "keypress");	
	}
}

function onMouseWheel(evt){
	if(mainC !== null){
		mainC.mouse(evt, "mousewheel")
	}
}

function cleanUp(){
 	for(var i =0; i< contents.length; i++){
 		var target = document.getElementById(contents[i]);
 		target.parentNode.removeChild(target);
	}

}
window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);
window.addEventListener("keypress", onKeyPress, false);
window.addEventListener("mousewheel", onMouseWheel, false);
window.addEventListener("DOMMouseScroll", onMouseWheel, false);
//fileInput.addEventListener("change", handleFileSelect, false);
start.addEventListener("click", runMain, false);

function imagesRegister(){
	var imgUrls = [];
	var ids = []; 
	var count = 0;
	var containers = [];

	this.add = function(id, url){
		imgUrls[id] = url;
		ids[count] = id;
		count++;
	};

	this.loadInto = function(id){
		var target = document.getElementById(id);
		for(var i =0; i < count; i++){
			var img = new Image();
			img.src = imgUrls[ids[i]];
			img.id = ids[i];
			img.style.visibility="hidden";
			target.appendChild(img);
		}
	};

	this.cleanUpImages = function(){
		for(var i = 0; i < count; i++){
			var target = document.getElementById(ids[i]);
			target.parentNode.removeChild(target);
		}
	};

	this.cleanUpData = function(){
		count = 0;
		imgUrls = [];
		ids = [];
	};
}

//control Button Event Listeners START

//MOUSE

//Move
btnMovL.addEventListener("mousedown", function(){
							mainC.moveCamera("left")
						}, false);
btnMovL.addEventListener("mouseup", function(){
							mainC.stopMoveCamera("left")
						}, false);

btnMovR.addEventListener("mousedown", function(){
							mainC.moveCamera("right")
						}, false);
btnMovR.addEventListener("mouseup", function(){
							mainC.stopMoveCamera("right")
						}, false);


btnMovU.addEventListener("mousedown", function(){
							mainC.moveCamera("forward")
						}, false);
btnMovU.addEventListener("mouseup", function(){
							mainC.stopMoveCamera("forward")
						}, false);

btnMovD.addEventListener("mousedown", function(){
							mainC.moveCamera("backward")
						}, false);
btnMovD.addEventListener("mouseup", function(){
							mainC.stopMoveCamera("backward")
						}, false);

//Rotation
btnRotL.addEventListener("mousedown", function(){
							mainC.rotateCamera("left")
						}, false);
btnRotL.addEventListener("mouseup", function(){
							mainC.stopRotateCamera("left")
						}, false);
btnRotR.addEventListener("mousedown", function(){
							mainC.rotateCamera("right")
						}, false);
btnRotR.addEventListener("mouseup", function(){
							mainC.stopRotateCamera("right")
						}, false);
btnRotU.addEventListener("mousedown", function(){
							mainC.rotateCamera("up")
						}, false);
btnRotU.addEventListener("mouseup", function(){
							mainC.stopRotateCamera("up")
						}, false);
btnRotD.addEventListener("mousedown", function(){
							mainC.rotateCamera("down")
						}, false);
btnRotD.addEventListener("mouseup", function(){
							mainC.stopRotateCamera("down")
						}, false);

//TOUCH

//Move
btnMovL.addEventListener("touchstart", function(){
							mainC.moveCamera("left")
						}, false);
btnMovL.addEventListener("touchend", function(){
							mainC.stopMoveCamera("left")
						}, false);
btnMovR.addEventListener("touchstart", function(){
							mainC.moveCamera("right")
						}, false);
btnMovR.addEventListener("touchend", function(){
							mainC.stopMoveCamera("right")
						}, false);
btnMovU.addEventListener("touchstart", function(){
							mainC.moveCamera("forward")
						}, false);
btnMovU.addEventListener("touchend", function(){
							mainC.stopMoveCamera("forward")
						}, false);
btnMovD.addEventListener("touchstart", function(){
							mainC.moveCamera("backward")
						}, false);
btnMovD.addEventListener("touchend", function(){
							mainC.stopMoveCamera("backward")
						}, false);

//Rotation
btnRotL.addEventListener("touchstart", function(){
							mainC.rotateCamera("left")
						}, false);
btnRotL.addEventListener("touchend", function(){
							mainC.stopRotateCamera("left")
						}, false);
btnRotR.addEventListener("touchstart", function(){
							mainC.rotateCamera("right")
						}, false);
btnRotR.addEventListener("touchend", function(){
							mainC.stopRotateCamera("right")
						}, false);
btnRotU.addEventListener("touchstart", function(){
							mainC.rotateCamera("up")
						}, false);
btnRotU.addEventListener("touchend", function(){
							mainC.stopRotateCamera("up")
						}, false);
btnRotD.addEventListener("touchstart", function(){
							mainC.rotateCamera("down")
						}, false);
btnRotD.addEventListener("touchend", function(){
							mainC.stopRotateCamera("down")
						}, false);
//controlButtonEvent END


window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}