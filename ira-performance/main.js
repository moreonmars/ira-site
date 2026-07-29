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


container.appendChild(renderer.domElement);



//
// BALLOON
//

const geometry = new THREE.SphereGeometry(
    1.55,
    180,
    180
);


const material = new THREE.MeshPhysicalMaterial({

    color:0xffffff,

    transparent:true,

    opacity:0.28,

    transmission:1,

    thickness:2,

    roughness:0.08,

    clearcoat:1,

    clearcoatRoughness:0.05

});


const balloon = new THREE.Mesh(
    geometry,
    material
);

scene.add(balloon);



//
// LIGHT
//

const light = new THREE.PointLight(
    0xffffff,
    8
);

light.position.set(
    2,
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
// PHYSICS
//

const position =
geometry.attributes.position;


const original=[];


const velocity=[];


for(
let i=0;
i<position.count;
i++
){

original.push(
    new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    )
);


velocity.push(
    new THREE.Vector3()
);

}



let mouse =
new THREE.Vector2();


let target =
new THREE.Vector3();


let pressure = 0;



window.addEventListener(
"pointermove",
(e)=>{


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



function updateMaterial(){


const time =
performance.now()*0.001;



//
// gentle breathing
//

const breathing =
Math.sin(time*1.2)*0.015;


pressure =
0.08 + breathing;



for(
let i=0;
i<position.count;
i++
){

let point =
new THREE.Vector3(
    position.getX(i),
    position.getY(i),
    position.getZ(i)
);



//
// internal pressure
//

const normal =
original[i].clone()
.normalize();


point.add(
normal.multiplyScalar(
pressure
)
);



//
// touch deformation
//

const distance =
point.distanceTo(target);


if(distance < 1.4){

const push =
point.clone()
.sub(target)
.normalize();


push.multiplyScalar(
(1.4-distance)*0.18
);


velocity[i].add(push);

}



//
// elastic return
//

const spring =
original[i]
.clone()
.sub(point)
.multiplyScalar(0.035);


velocity[i].add(
spring
);


velocity[i].multiplyScalar(
0.92
);


point.add(
velocity[i]
);



position.setXYZ(
i,
point.x,
point.y,
point.z
);

}



position.needsUpdate=true;

geometry.computeVertexNormals();


}



function animate(){

requestAnimationFrame(
animate
);


updateMaterial();


balloon.rotation.y +=0.001;


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
window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);

});
