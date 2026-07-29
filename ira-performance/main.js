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

const geometry =
new THREE.SphereGeometry(
1.5,
128,
128
);


const material =
new THREE.MeshPhysicalMaterial({

    color:0xffffff,
    transparent:true,
    opacity:0.35,

    transmission:1,
    thickness:1.5,

    roughness:0.08,
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
6
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
// PHYSICS MEMORY
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


let tension = 0;



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





function update(){


const time =
performance.now()*0.001;


const inflation =
0.03 +
Math.sin(time*1.5)*0.01 +
tension*0.15;



for(
let i=0;
i<points.length;
i++
){


let p =
points[i];



//
// spring back
//

let force =
p.origin.clone()
.sub(p.current)
.multiplyScalar(
0.025
);



p.velocity.add(
force
);



//
// inflate
//

let normal =
p.origin.clone()
.normalize();


p.velocity.add(
normal.multiplyScalar(
(inflation)*0.002
)
);





//
// touch
//

let distance =
p.current.distanceTo(
target
);



if(distance < 1.2){

let push =
p.current.clone()
.sub(target)
.normalize();


push.multiplyScalar(
(1.2-distance)*0.02
);


p.velocity.add(
push
);


tension +=0.002;

}




//
// damping
//

p.velocity.multiplyScalar(
0.92
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



tension*=0.995;


position.needsUpdate=true;

geometry.computeVertexNormals();


}





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
