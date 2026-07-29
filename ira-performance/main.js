const container =
document.getElementById("container");


const scene =
new THREE.Scene();


scene.background =
new THREE.Color(
    0x050505
);



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
1
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
32,
32
);



const material =
new THREE.MeshBasicMaterial({
    color:0xffffff
});



const sphere =
new THREE.Mesh(
geometry,
material
);


scene.add(
sphere
);





const position =
geometry.attributes.position;



const original=[];


for(
let i=0;
i<position.count;
i++
){

original.push({

x:position.getX(i),
y:position.getY(i),
z:position.getZ(i)

});

}



let touchX=0;
let touchY=0;


function move(x,y){

touchX =
(x/window.innerWidth-0.5)*0.4;


touchY =
-(y/window.innerHeight-0.5)*0.4;


}



window.addEventListener(
"pointermove",
e=>{

move(
e.clientX,
e.clientY
);

});



window.addEventListener(
"touchmove",
e=>{

const t =
e.touches[0];


move(
t.clientX,
t.clientY
);


},
{
passive:true
});





function animate(){


requestAnimationFrame(
animate
);



for(
let i=0;
i<position.count;
i++
){


position.setXYZ(

i,

original[i].x + touchX,

original[i].y + touchY,

original[i].z

);


}



position.needsUpdate=true;



sphere.rotation.y +=0.01;



renderer.render(
scene,
camera
);


}



animate();
