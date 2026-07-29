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



const balloon =
new THREE.Mesh(
geometry,
material
);


scene.add(balloon);





let pointer =
new THREE.Vector2();



window.addEventListener(
"pointermove",
(e)=>{


pointer.x =
(e.clientX/window.innerWidth-0.5)
*
0.3;


pointer.y =
-(e.clientY/window.innerHeight-0.5)
*
0.3;


});




function animate(){

requestAnimationFrame(
animate
);


balloon.rotation.y +=0.01;


balloon.position.x =
pointer.x;


balloon.position.y =
pointer.y;



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
