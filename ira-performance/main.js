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
Math.min(window.devicePixelRatio, 1.5)
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
new THREE.MeshStandardMaterial({

    color:0xffffff,

    roughness:0.35

});



const balloon =
new THREE.Mesh(
geometry,
material
);


scene.add(balloon);





const light =
new THREE.DirectionalLight(
0xffffff,
2
);

light.position.set(
-3,
4,
5
);


scene.add(light);


scene.add(
new THREE.AmbientLight(
0xffffff,
1
)
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



let mouse =
new THREE.Vector2();


let active=false;



function setPointer(x,y){


mouse.x =
(x/window.innerWidth)*2-1;


mouse.y =
-(y/window.innerHeight)*2+1;


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

const t=e.touches[0];

setPointer(
t.clientX,
t.clientY
);

},
{
passive:true
});







function update(){


if(!active) return;



const time =
performance.now()*0.001;



for(
let i=0;
i<position.count;
i++
){


const ox =
original[i].x;


const oy =
original[i].y;


const oz =
original[i].z;



const wave =
Math.sin(
time*3+i
)
*
0.002;



position.setXYZ(

i,

ox + mouse.x*0.15 + wave,

oy + mouse.y*0.15 + wave,

oz

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


balloon.rotation.y +=0.002;


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
