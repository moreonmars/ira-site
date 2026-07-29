import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container =
document.getElementById("container");



const scene =
new THREE.Scene();



const camera =
new THREE.PerspectiveCamera(
45,
window.innerWidth/window.innerHeight,
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
// POINT MEMORY
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
    )

});

}



let target =
new THREE.Vector3();



let inflating=false;

let pressure=0;

let broken=false;

let fragments=[];



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
// BREAK
//

function breakBalloon(){


broken=true;


balloon.visible=false;



for(
let i=0;
i<points.length;
i+=6
){


const p =
points[i];


const geo =
new THREE.TetrahedronGeometry(
0.08 +
Math.random()*0.08
);



const piece =
new THREE.Mesh(
geo,
material.clone()
);



piece.position.copy(
p.current
);



const direction =
p.current.clone()
.normalize();



piece.userData.velocity =
direction.multiplyScalar(
0.05 +
Math.random()*0.08
);



piece.userData.spin =
new THREE.Vector3(
Math.random()*0.2,
Math.random()*0.2,
Math.random()*0.2
);



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



//
// pressure
//

if(inflating){

pressure +=0.0012;

}
else{

pressure -=0.00015;

}


pressure =
THREE.MathUtils.clamp(
pressure,
0,
1
);





//
// material tension
//

material.opacity =
0.75-pressure*0.15;



for(
let i=0;
i<points.length;
i++
){


const p =
points[i];



//
// elastic return
//

const restore =
p.origin.clone()
.sub(p.current)
.multiplyScalar(
0.05
);


p.velocity.add(
restore
);




//
// inflate
//

const normal =
p.origin.clone()
.normalize();


p.velocity.add(
normal.multiplyScalar(
pressure*0.003
)
);




//
// touch
//

const distance =
p.current.distanceTo(
target
);



if(distance<1.1){


const push =
p.current.clone()
.sub(target)
.normalize();


push.multiplyScalar(
(1.1-distance)*0.08
);


p.velocity.add(
push
);


}




//
// near limit
//

if(pressure>0.8){

p.velocity.add(
normal.multiplyScalar(
Math.sin(time*20+i)
*
0.003
)
);

}



p.velocity.multiplyScalar(
0.88
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





if(pressure>0.95){

breakBalloon();

}



}





//
// fragments
//

else{


fragments.forEach(
piece=>{


piece.position.add(
piece.userData.velocity
);


piece.userData.velocity.multiplyScalar(
0.98
);


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
