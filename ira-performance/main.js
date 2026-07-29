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


camera.position.z = 5;



const renderer =
new THREE.WebGLRenderer({
    antialias:false
});


renderer.setPixelRatio(1);


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



let point =
new THREE.Vector3();


let active=false;




function setPointer(x,y){


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


ray.ray.at(
3,
point
);


active=true;

}



window.addEventListener(
"pointermove",
e=>{

setPointer(
e.clientX,
e.clientY
);

});


window.addEventListener(
"touchmove",
e=>{

const t =
e.touches[0];

setPointer(
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
i<position.count;
i++
){


let p =
new THREE.Vector3(
position.getX(i),
position.getY(i),
position.getZ(i)
);



let target =
original[i].clone();



if(active){


let distance =
p.distanceTo(point);



if(distance < 1){


let force =
p.clone()
.sub(point)
.normalize();



force.multiplyScalar(
(1-distance)*0.3
);



target.add(
force
);

}


}



p.lerp(
target,
0.15
);



position.setXYZ(
i,
p.x,
p.y,
p.z
);



}



position.needsUpdate=true;


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
