const container =
document.getElementById("container");


const scene =
new THREE.Scene();


scene.background =
new THREE.Color(0x050505);



const camera =
new THREE.PerspectiveCamera(
45,
window.innerWidth / window.innerHeight,
0.1,
100
);


camera.position.z =
window.innerWidth < 600 ? 6 : 5;



const renderer =
new THREE.WebGLRenderer({
    antialias:false
});


renderer.setPixelRatio(
Math.min(window.devicePixelRatio, 1.5)
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
window.innerWidth < 600 ? 40 : 64;



const geometry =
new THREE.SphereGeometry(
1.3,
segments,
segments
);



const material =
new THREE.MeshStandardMaterial({

    color:0xe8e8e8,

    roughness:0.35

});



const balloon =
new THREE.Mesh(
geometry,
material
);


scene.add(
balloon
);





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

    original:
    new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    ),


    current:
    new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
    )

});

}



let hitPoint =
new THREE.Vector3();



let touching=false;



//
// POINTER
//

function updatePointer(x,y){


const mouse =
new THREE.Vector2(

    x/window.innerWidth*2-1,

    -(y/window.innerHeight*2-1)

);



const ray =
new THREE.Raycaster();



ray.setFromCamera(
mouse,
camera
);



const hit =
new THREE.Vector3();



ray.ray.at(
3,
hit
);



hitPoint.copy(
hit
);


touching=true;

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
"touchmove",
e=>{

const t =
e.touches[0];


updatePointer(
t.clientX,
t.clientY
);


},
{
passive:true
});





//
// DEFORM
//

function update(){


for(
let i=0;
i<points.length;
i++
){


const p =
points[i];



let target =
p.original.clone();



if(touching){


const distance =
p.current.distanceTo(
hitPoint
);



if(distance < 1.0){


const push =
p.current.clone()
.sub(hitPoint);



push.normalize();


push.multiplyScalar(
(1-distance)*0.25
);



target.add(
push
);


}

}



p.current.lerp(
target,
0.08
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


touching=false;


}






function animate(){

requestAnimationFrame(
animate
);


update();


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


camera.position.z =
window.innerWidth < 600 ? 6 : 5;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
