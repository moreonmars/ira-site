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



camera.position.z =
window.innerWidth < 600 ? 6 : 5;




const renderer =
new THREE.WebGLRenderer({

    antialias:false

});


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
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
        0.8
    )
);





//
// BALLOON
//

const segments =
window.innerWidth < 600 ? 48 : 72;



const geometry =
new THREE.SphereGeometry(
    1.35,
    segments,
    segments
);



const material =
new THREE.MeshStandardMaterial({

    color:0xe8e8e8,

    roughness:0.25

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
// PHYSICS POINTS
//

const position =
geometry.attributes.position;



const points = [];



for(
let i = 0;
i < position.count;
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



let hasTouch =
false;





//
// POINTER + TOUCH
//

function movePointer(x,y){


const mouse =
new THREE.Vector2(

    x / window.innerWidth * 2 - 1,

    -(y / window.innerHeight * 2 - 1)

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


hasTouch=true;

}



window.addEventListener(
"pointermove",
e=>{

movePointer(
    e.clientX,
    e.clientY
);

});



window.addEventListener(
"touchmove",
e=>{


const t =
e.touches[0];


movePointer(
    t.clientX,
    t.clientY
);


},
{
    passive:true
}
);





//
// UPDATE
//

function update(){


const time =
performance.now()*0.001;



for(
let i=0;
i<points.length;
i++
){


const p =
points[i];



//
// RETURN
//

const restore =
p.origin.clone()
.sub(p.current)
.multiplyScalar(
    0.06
);



p.velocity.add(
    restore
);





//
// BREATHING
//

const normal =
p.origin.clone()
.normalize();


const breathe =
Math.sin(
    time * 1.5
)
*
0.002;



p.velocity.add(
    normal.multiplyScalar(
        breathe
    )
);





//
// TOUCH DEFORMATION
//

if(hasTouch){


const distance =
p.current.distanceTo(
    target
);



if(distance < 1.0){


const push =
p.current.clone()
.sub(target)
.normalize();



push.multiplyScalar(
    (1-distance)
    *
    0.06
);



p.velocity.add(
    push
);


}


}




//
// DAMPING
//

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


}







//
// LOOP
//

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






//
// RESIZE
//

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
