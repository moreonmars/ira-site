import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container =
document.getElementById("container");


//
// CHECK WEBGL
//

if(!window.WebGLRenderingContext){

    container.innerHTML =
    "<p style='color:white;text-align:center'>WebGL not supported</p>";

    throw new Error("No WebGL");

}



//
// SCENE
//

const scene =
new THREE.Scene();


scene.background =
new THREE.Color(
0x050505
);



const camera =
new THREE.PerspectiveCamera(
45,
window.innerWidth / window.innerHeight,
0.1,
100
);


camera.position.z = 5;



const renderer =
new THREE.WebGLRenderer({
    antialias:false,
    alpha:false
});


renderer.setPixelRatio(
1
);


renderer.setSize(
window.innerWidth,
window.innerHeight
);



container.appendChild(
renderer.domElement
);


//
// LIGHT
//

const light =
new THREE.DirectionalLight(
0xffffff,
2
);


light.position.set(
3,
3,
5
);


scene.add(light);



scene.add(
new THREE.AmbientLight(
0xffffff,
1
)
);


//
// SIMPLE BALL
//

const geometry =
new THREE.SphereGeometry(
1.5,
48,
48
);



const material =
new THREE.MeshStandardMaterial({

    color:0xffffff,

    roughness:0.3

});



const sphere =
new THREE.Mesh(
geometry,
material
);


scene.add(
sphere
);





//
// SIMPLE TOUCH
//

let target =
new THREE.Vector2();


window.addEventListener(
"pointermove",
(e)=>{


target.x =
(e.clientX/window.innerWidth)*2-1;


target.y =
-(e.clientY/window.innerHeight)*2+1;


});




function animate(){


requestAnimationFrame(
animate
);


sphere.rotation.y +=0.005;


renderer.render(
scene,
camera
);


}



animate();





window.addEventListener(
"resize",
()=>{


camera.aspect =
window.innerWidth /
window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
