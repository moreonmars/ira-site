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


renderer.setSize(
window.innerWidth,
window.innerHeight
);


container.appendChild(
renderer.domElement
);



const geometry =
new THREE.SphereGeometry(
1.5,
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



function animate(){

requestAnimationFrame(
animate
);


sphere.rotation.y +=0.01;


renderer.render(
scene,
camera
);

}


animate();
