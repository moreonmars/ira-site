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
    alpha:true,
    powerPreference:"high-performance"
});


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);


container.appendChild(
    renderer.domElement
);


//
// LIGHT
//

const light = new THREE.PointLight(
    0xffffff,
    6
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
        1
    )
);


//
// BALLOON
//

const segments =
window.innerWidth < 600 ? 48 : 72;



const geometry =
new THREE.SphereGeometry(
    1.5,
    segments,
    segments
);



const material =
new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.8,

    transmission:
    window.innerWidth < 600 ? 0 : 0.15,

    thickness:0.8,

    roughness:0.18,

    clearcoat:0.8

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

    current:
    new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    ),

    velocity:
    new THREE.Vector3(),

    origin:
    new THREE.Vector3(
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

let breaking=false;

let breakDelay=0;


let fragments=[];





//
// POINTER
//

function movePointer(x,y){


const mouse =
new THREE.Vector2(

    (x/window.innerWidth)*2-1,

    -(y/window.innerHeight)*2+1

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


}



window.addEventListener(
"pointermove",
e=>{

movePointer(
    e.clientX,
    e.clientY
);

});



window.addEventListener(
"pointerdown",
e=>{

inflating=true;

movePointer(
    e.clientX,
    e.clientY
);

});


window.addEventListener(
"pointerup",
()=>{

inflating=false;

});



//
// TOUCH
//

window.addEventListener(
"touchmove",
e=>{

const t =
e.touches[0];

movePointer(
    t.clientX,
    t.clientY
);

},
{
passive:true
});


window.addEventListener(
"touchstart",
e=>{

inflating=true;


const t =
e.touches[0];


movePointer(
    t.clientX,
    t.clientY
);

},
{
passive:true
});


window.addEventListener(
"touchend",
()=>{

inflating=false;

});





//
// BREAK
//

function explode(){


broken=true;


balloon.visible=false;



for(
let i=0;
i<points.length;
i+=10
){


const p =
points[i];



const piece =
new THREE.Mesh(

    new THREE.TetrahedronGeometry(
        0.04+
        Math.random()*0.08
    ),


    material.clone()

);



piece.position.copy(
    p.current
);



const velocity =
p.current.clone()
.normalize()
.multiplyScalar(
0.04+
Math.random()*0.06
);



piece.userData={

    velocity,

    life:0,

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



balloon.scale.setScalar(
1+pressure*0.35
);



material.opacity =
0.8-pressure*0.2;



for(
let i=0;
i<points.length;
i++
){


const p =
points[i];



const restore =
p.origin.clone()
.sub(p.current)
.multiplyScalar(
0.06
);


p.velocity.add(
restore
);



const normal =
p.origin.clone()
.normalize();



p.velocity.add(
normal.multiplyScalar(
pressure*0.002
)
);




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
(1.1-distance)*0.07
);


p.velocity.add(
push
);

}



if(pressure>0.85){

p.velocity.add(
normal.multiplyScalar(
Math.sin(time*18+i)
*
0.0015
)
);

}



p.velocity.multiplyScalar(
0.86
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

breaking=true;

}



if(breaking){

breakDelay +=0.016;


if(breakDelay>0.6){

explode();

}

}



}





//
// FRAGMENTS
//

for(
let i=fragments.length-1;
i>=0;
i--
){


const piece =
fragments[i];


piece.position.add(
piece.userData.velocity
);



piece.userData.velocity.y -=0.002;


piece.userData.velocity.multiplyScalar(
0.97
);



piece.rotation.x +=
piece.userData.spin.x;


piece.rotation.y +=
piece.userData.spin.y;


piece.rotation.z +=
piece.userData.spin.z;



piece.userData.life +=0.016;



if(piece.userData.life>3){

scene.remove(piece);

fragments.splice(
    i,
    1
);

}



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
