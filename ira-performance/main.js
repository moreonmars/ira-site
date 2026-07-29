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
    96,
    96
);


const material =
new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.75,

    transmission:0.2,

    thickness:1,

    roughness:0.1,

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

let broken = false;

let fragments = [];


//
// POINTER
//

let mouse =
new THREE.Vector2();

let target =
new THREE.Vector3();



window.addEventListener(
"pointermove",
e=>{


mouse.x =
(e.clientX/window.innerWidth)*2-1;


mouse.y =
-(e.clientY/window.innerHeight)*2+1;



const ray =
new THREE.Raycaster();


ray.setFromCamera(
mouse,
camera
);


ray.ray.at(
3,
target
);

});



window.addEventListener(
"pointerdown",
()=>{

inflating=true;

});


window.addEventListener(
"pointerup",
()=>{

inflating=false;

});





//
// BREAK CREATION
//

function explode(){


broken=true;


balloon.visible=false;



const fragGeometry =
new THREE.IcosahedronGeometry(
0.18,
1
);



for(
let i=0;
i<80;
i++
){


const frag =
new THREE.Mesh(

    fragGeometry.clone(),

    new THREE.MeshPhysicalMaterial({

        color:0xe8e8e8,

        transparent:true,

        opacity:0.75,

        roughness:0.15,

        clearcoat:1

    })

);



const direction =
new THREE.Vector3(
    Math.random()-0.5,
    Math.random()-0.5,
    Math.random()-0.5
)
.normalize();



frag.position.copy(
direction.clone()
.multiplyScalar(
0.2
)
);



frag.userData = {

    velocity:
    direction.multiplyScalar(
        Math.random()*0.08+0.04
    ),

    rotation:
    new THREE.Vector3(
        Math.random()*0.1,
        Math.random()*0.1,
        Math.random()*0.1
    )

};



scene.add(frag);

fragments.push(
frag
);

}



}





//
// UPDATE
//

function update(){


if(!broken){


if(inflating){

pressure +=0.0018;

}
else{

pressure -=0.0002;

}



pressure =
THREE.MathUtils.clamp(
pressure,
0,
1
);



balloon.scale.setScalar(
1 + pressure*0.45
);



material.opacity =
0.75-pressure*0.2;



if(pressure>0.92){

setTimeout(
explode,
500
);

}



//
// deformation before break
//

balloon.rotation.x =
Math.sin(
performance.now()*0.003
)
*
pressure
*
0.05;


}
else{


fragments.forEach(
frag=>{


frag.position.add(
frag.userData.velocity
);



frag.rotation.x +=
frag.userData.rotation.x;


frag.rotation.y +=
frag.userData.rotation.y;


frag.rotation.z +=
frag.userData.rotation.z;



frag.userData.velocity.y -=0.001;


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
window.innerWidth /
window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);

});new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.7,

    transmission:0.25,

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
// LIGHT
//

const light =
new THREE.PointLight(
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
// POINTS
//

const position =
geometry.attributes.position;


const points=[];


for(
let i=0;
i<position.count;
i++
){

points.push({

    current:new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    ),

    velocity:new THREE.Vector3(),

    origin:new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    ),

    breakForce:
    Math.random()

});

}



let target =
new THREE.Vector3();


let inflating=false;


let pressure=0;


let broken=false;


let rupture=0;


//
// POINTER
//

window.addEventListener(
"pointermove",
e=>{


const mouse =
new THREE.Vector2(

(e.clientX/window.innerWidth)*2-1,

-(e.clientY/window.innerHeight)*2+1

);


const ray =
new THREE.Raycaster();


ray.setFromCamera(
mouse,
camera
);


ray.ray.at(
3,
target
);


});



window.addEventListener(
"pointerdown",
()=>{

inflating=true;

});


window.addEventListener(
"pointerup",
()=>{

inflating=false;

});





//
// UPDATE
//

function update(){


const time =
performance.now()*0.001;



//
// PRESSURE
//

if(!broken){

    if(inflating){

        pressure +=0.0015;

    }
    else{

        pressure -=0.0002;

    }


    pressure =
    THREE.MathUtils.clamp(
        pressure,
        0,
        1
    );


    if(pressure>0.92){

        broken=true;

    }

}



//
// NORMAL STATE
//

for(
let i=0;
i<points.length;
i++
){


const p =
points[i];


const normal =
p.origin.clone()
.normalize();



if(!broken){


const desired =
p.origin.clone()
.add(
normal.multiplyScalar(
pressure*0.35
)
);



const force =
desired
.sub(p.current)
.multiplyScalar(
0.04
);


p.velocity.add(
force
);



const distance =
p.current.distanceTo(
target
);



if(distance<1.15){


const push =
p.current.clone()
.sub(target)
.normalize();


push.multiplyScalar(
(1.15-distance)*0.08
);


p.velocity.add(
push
);

}



//
// BEFORE BREAK
//

if(pressure>0.75){

p.velocity.add(

normal.clone()
.multiplyScalar(
Math.sin(
time*20+i
)
*
0.002
)

);

}


}



//
// RUPTURE
//

else{


rupture +=0.003;


const explosion =
normal.clone()
.multiplyScalar(
rupture *
p.breakForce *
0.06
);


p.velocity.add(
explosion
);


material.opacity *=0.995;


}



p.velocity.multiplyScalar(
0.9
);


p.current.add(
p.velocity
);



position.setXYZ(
i,
p.current.x,
p.current.y,
p.current.z
);



}



position.needsUpdate=true;


geometry.computeVertexNormals();


}





//
// LOOP
//

function animate(){

requestAnimationFrame(
animate
);


update();


balloon.rotation.y+=0.001;


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
