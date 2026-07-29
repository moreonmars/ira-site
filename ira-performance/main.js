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
    Math.min(window.devicePixelRatio, 2)
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
    64,
    64
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
// POINTS
//

const position =
geometry.attributes.position;


const points = [];


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


let inflating = false;

let pressure = 0;

let broken = false;

let breaking = false;

let breakTime = 0;


let fragments = [];


//
// POINTER / TOUCH
//

function updatePointer(x,y){

    const mouse =
    new THREE.Vector2(

        (x / window.innerWidth)*2-1,

        -(y / window.innerHeight)*2+1

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

    updatePointer(
        e.clientX,
        e.clientY
    );

});


window.addEventListener(
"pointerdown",
e=>{

    inflating = true;

    updatePointer(
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
// TOUCH SUPPORT
//

window.addEventListener(
"touchmove",
e=>{

    const touch =
    e.touches[0];


    updatePointer(
        touch.clientX,
        touch.clientY
    );

});


window.addEventListener(
"touchstart",
e=>{

    inflating=true;

    const touch =
    e.touches[0];


    updatePointer(
        touch.clientX,
        touch.clientY
    );

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



const fragmentMaterial =
material.clone();



for(
let i=0;
i<points.length;
i+=8
){


const p =
points[i];



const piece =
new THREE.Mesh(

    new THREE.TetrahedronGeometry(
        0.05+
        Math.random()*0.08
    ),

    fragmentMaterial.clone()

);



piece.position.copy(
p.current
);



const direction =
p.current.clone()
.normalize();



piece.userData = {

    velocity:
    direction.multiplyScalar(
        0.05+
        Math.random()*0.08
    ),

    life:0,

    spin:
    new THREE.Vector3(
        Math.random()*0.2,
        Math.random()*0.2,
        Math.random()*0.2
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

    pressure +=0.0013;

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



//
// inflate
//

balloon.scale.setScalar(
    1+
    pressure*0.35
);



material.opacity =
0.75-pressure*0.2;



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



if(pressure>0.85){


p.velocity.add(
normal.multiplyScalar(
Math.sin(time*20+i)
*
0.001
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

breakTime +=0.016;


if(breakTime>0.5){

explode();

}

}


}





//
// FRAGMENTS
//

fragments.forEach(
(piece,index)=>{


piece.position.add(
piece.userData.velocity
);


piece.userData.velocity.y -=0.002;


piece.userData.velocity.multiplyScalar(
0.98
);



piece.rotation.x +=
piece.userData.spin.x;


piece.rotation.y +=
piece.userData.spin.y;


piece.userData.life +=0.016;



if(
piece.userData.life>4
){

scene.remove(piece);

}


});



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
