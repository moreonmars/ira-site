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
window.innerWidth < 600 ? 7 : 5;



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





const radius =
window.innerWidth < 600 ? 0.85 : 1.3;



const geometry =
new THREE.SphereGeometry(
radius,
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





let pointerX = 0;
let pointerY = 0;



function movePointer(x,y){

pointerX =
(x/window.innerWidth - 0.5)
*
0.3;


pointerY =
-(y/window.innerHeight - 0.5)
*
0.3;

}



window.addEventListener(
"pointermove",
e=>{

movePointer(
e.clientX,
e.clientY
);

});




function animate(){

requestAnimationFrame(
animate
);


sphere.rotation.y +=0.01;


sphere.position.x =
pointerX;


sphere.position.y =
pointerY;



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
window.innerWidth < 600 ? 7 : 5;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
