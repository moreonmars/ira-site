import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container = document.getElementById("container");


const scene = new THREE.Scene();



const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.z = 5;



const renderer = new THREE.WebGLRenderer({
    antialias:true,
    alpha:true
});


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    window.devicePixelRatio
);


container.appendChild(
    renderer.domElement
);


//
// LIGHT
//

const light = new THREE.PointLight(
    0xffffff,
    8
);

light.position.set(
    -3,
    4,
    6
);

scene.add(light);


scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.8
    )
);


//
// BALLOON
//

const geometry =
new THREE.SphereGeometry(
    1.5,
    128,
    128
);



const material =
new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.75,

    transmission:0.2,

    thickness:1,

    roughness:0.12,

    clearcoat:1

});


const balloon =
new THREE.Mesh(
    geometry,
    material
);


scene.add(balloon);


//
// STATE
//

let pressure = 0;

let inflating = false;

let breaking = false;

let broken = false;

let breakTimer = 0;


let fragments = [];


//
// POINTER
//

let target =
new THREE.Vector3();



window.addEventListener(
"pointermove",
(e)=>{


const mouse =
new THREE.Vector2(

    e.clientX / window.innerWidth * 2 - 1,

    -(e.clientY / window.innerHeight * 2 - 1)

);


const raycaster =
new THREE.Raycaster();


raycaster.setFromCamera(
    mouse,
    camera
);


raycaster.ray.at(
    3,
    target
);


});



window.addEventListener(
"pointerdown",
()=>{

inflating = true;

});


window.addEventListener(
"pointerup",
()=>{

inflating = false;

});





//
// CREATE PIECES
//

function createFragments(){


balloon.visible = false;


const material =
new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.8,

    roughness:0.2,

    clearcoat:1

});



for(
let i=0;
i<70;
i++
){


const piece =
new THREE.Mesh(

    new THREE.TetrahedronGeometry(
        Math.random()*0.12+0.05
    ),

    material.clone()

);



const direction =
new THREE.Vector3(
    Math.random()-0.5,
    Math.random()-0.5,
    Math.random()-0.5
)
.normalize();



piece.position.set(
    0,
    0,
    0
);



piece.userData = {

    velocity:
    direction.multiplyScalar(
        Math.random()*0.09+0.04
    ),


    spin:
    new THREE.Vector3(
        Math.random()*0.15,
        Math.random()*0.15,
        Math.random()*0.15
    )

};


scene.add(piece);

fragments.push(piece);


}


}





//
// UPDATE
//

function update(){


const time =
performance.now()*0.001;



if(!broken){


if(inflating && !breaking){

    pressure +=0.0015;

}
else if(!breaking){

    pressure -=0.00015;

}



pressure =
THREE.MathUtils.clamp(
    pressure,
    0,
    1
);



//
// inflate
//

if(!breaking){


const scale =
1 + pressure*0.45;


balloon.scale.setScalar(
    scale
);



material.opacity =
0.75-pressure*0.15;



//
// tension
//

if(pressure > 0.75){


balloon.rotation.x =
Math.sin(time*18)
*
(pressure-0.75)
*
0.1;


balloon.rotation.y =
Math.cos(time*20)
*
(pressure-0.75)
*
0.1;


}



}



//
// START BREAK
//

if(
pressure > 0.94 &&
!breaking
){

breaking=true;

}





//
// BREAK DELAY
//

if(breaking){

breakTimer +=0.016;


balloon.scale.setScalar(
1 + pressure*0.5
);



if(
breakTimer > 0.7
){

broken=true;

createFragments();

}

}



}



//
// FRAGMENTS
//

if(broken){


fragments.forEach(
(piece)=>{


piece.position.add(
piece.userData.velocity
);



piece.userData.velocity.y -=0.002;


piece.rotation.x +=
piece.userData.spin.x;


piece.rotation.y +=
piece.userData.spin.y;


piece.rotation.z +=
piece.userData.spin.z;



});

}


}





//
// LOOP
//

function animate(){

requestAnimationFrame(
animate
);


update();


renderer.render(
scene,
camera
);

}


animate();





//
// RESIZE
//

window.addEventListener(
"resize",
()=>{


camera.aspect =
window.innerWidth/window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
