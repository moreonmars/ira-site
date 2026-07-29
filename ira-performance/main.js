const container = document.getElementById("container");


const scene = new THREE.Scene();

scene.background =
new THREE.Color(0x050505);



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
    antialias:false
});


renderer.setPixelRatio(
Math.min(window.devicePixelRatio,1.5)
);


renderer.setSize(
window.innerWidth,
window.innerHeight
);


container.appendChild(
renderer.domElement
);




const geometry =
new THREE.SphereGeometry(
1.3,
48,
48
);



const material =
new THREE.MeshBasicMaterial({
    color:0xffffff
});



const balloon =
new THREE.Mesh(
geometry,
material
);


scene.add(balloon);





const position =
geometry.attributes.position;


const points=[];


for(
let i=0;
i<position.count;
i++
){

points.push({

    origin:
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




const raycaster =
new THREE.Raycaster();


const mouse =
new THREE.Vector2();


let hitPoint =
null;



function pointerMove(x,y){


mouse.x =
x/window.innerWidth*2-1;


mouse.y =
-(y/window.innerHeight)*2+1;



raycaster.setFromCamera(
mouse,
camera
);



const hit =
raycaster.intersectObject(
balloon
);



if(hit.length){

    hitPoint =
    hit[0].point.clone();

}

}




window.addEventListener(
"pointermove",
e=>{

pointerMove(
e.clientX,
e.clientY
);

});



window.addEventListener(
"touchmove",
e=>{

const t =
e.touches[0];


pointerMove(
t.clientX,
t.clientY
);


},
{
passive:true
});






function update(){


for(
let i=0;
i<points.length;
i++
){


const p =
points[i];



let target =
p.origin.clone();



if(hitPoint){


const worldPoint =
hitPoint.clone();


const distance =
p.current.distanceTo(
worldPoint
);



if(distance < 0.8){


const push =
p.current.clone()
.sub(worldPoint)
.normalize();



push.multiplyScalar(
(0.8-distance)*0.25
);



target.add(
push
);


}


}




p.current.lerp(
target,
0.15
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
