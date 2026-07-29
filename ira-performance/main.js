import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container =
document.getElementById("container");


const scene =
new THREE.Scene();


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
// MATERIAL
//

const geometry =
new THREE.SphereGeometry(
1.6,
160,
160
);


const material =
new THREE.MeshPhysicalMaterial({

    color:0xffffff,

    transparent:true,

    opacity:0.35,

    transmission:1,

    thickness:1,

    roughness:0.05,

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
5
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
// DEFORMATION
//

const position =
geometry.attributes.position;


const original=[];


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

}



let mouse =
new THREE.Vector2();


let target =
new THREE.Vector3();


window.addEventListener(
"pointermove",
event=>{

mouse.x =
(event.clientX /
window.innerWidth)*2-1;


mouse.y =
-(event.clientY /
window.innerHeight)*2+1;


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



function deform(){

for(
let i=0;
i<position.count;
i++
){

const p =
new THREE.Vector3(
position.getX(i),
position.getY(i),
position.getZ(i)
);


const force =
p.clone()
.sub(target);


const distance =
force.length();


if(distance < 1.2){

force.normalize();

force.multiplyScalar(
(1.2-distance)*0.08
);


p.add(force);

}
else{

const home =
original[i];


p.lerp(
home,
0.03
);

}



position.setXYZ(
i,
p.x,
p.y,
p.z
);

}


position.needsUpdate=true;

geometry.computeVertexNormals();

}



function animate(){

requestAnimationFrame(
animate
);


deform();


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
window.innerWidth /
window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);

});
