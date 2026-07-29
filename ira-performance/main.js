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
// BALLOON GEOMETRY
//

const geometry = new THREE.SphereGeometry(
    1.55,
    180,
    180
);



const material = new THREE.MeshPhysicalMaterial({

    color:0xffffff,

    transparent:true,

    opacity:0.28,

    transmission:1,

    thickness:2,

    roughness:0.06,

    clearcoat:1,

    clearcoatRoughness:0.04

});


const balloon = new THREE.Mesh(
    geometry,
    material
);


scene.add(balloon);


//
// LIGHT
//

const light = new THREE.PointLight(
    0xffffff,
    8
);


light.position.set(
    2,
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
// PHYSICAL STATE
//

const position =
geometry.attributes.position;


const original = [];
const velocity = [];


for(
    let i = 0;
    i < position.count;
    i++
){

    original.push(
        new THREE.Vector3(
            position.getX(i),
            position.getY(i),
            position.getZ(i)
        )
    );


    velocity.push(
        new THREE.Vector3()
    );

}



let mouse =
new THREE.Vector2();


let target =
new THREE.Vector3();


let tension = 0;

let stress = 0;



//
// POINTER
//

window.addEventListener(
    "pointermove",
    (event)=>{


        mouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;


        mouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;



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


    }
);


//
// MATERIAL UPDATE
//

function updateMaterial(){


    const time =
    performance.now() * 0.001;



    //
    // natural breathing
    //

    const breathing =
    Math.sin(time * 1.2) * 0.015;



    //
    // internal pressure
    //

    const pressure =
    0.08 +
    breathing +
    tension * 0.08;



    //
    // tension decay / growth
    //

    const interactionDistance =
    target.length();



    if(interactionDistance > 0){

        tension += 0.00015;

    }


    tension -= 0.00003;


    tension =
    THREE.MathUtils.clamp(
        tension,
        0,
        1
    );



    stress =
    tension * 0.15;



    for(
        let i = 0;
        i < position.count;
        i++
    ){


        let point =
        new THREE.Vector3(
            position.getX(i),
            position.getY(i),
            position.getZ(i)
        );



        //
        // original normal direction
        //

        const normal =
        original[i]
        .clone()
        .normalize();



        //
        // internal inflation
        //

        point.add(
            normal.clone()
            .multiplyScalar(
                pressure
            )
        );



        //
        // stress vibration
        //

        point.add(
            normal.clone()
            .multiplyScalar(
                stress *
                Math.sin(time * 10 + i)
            )
        );



        //
        // user touch
        //

        const distance =
        point.distanceTo(target);



        if(distance < 1.4){


            const push =
            point.clone()
            .sub(target)
            .normalize();



            push.multiplyScalar(
                (1.4-distance) * 0.18
            );



            velocity[i].add(
                push
            );


            tension += 0.001;


        }



        //
        // elastic memory
        //

        const spring =
        original[i]
        .clone()
        .sub(point)
        .multiplyScalar(
            0.035
        );


        velocity[i].add(
            spring
        );


        velocity[i].multiplyScalar(
            0.92
        );


        point.add(
            velocity[i]
        );



        position.setXYZ(
            i,
            point.x,
            point.y,
            point.z
        );

    }


    position.needsUpdate = true;


    geometry.computeVertexNormals();


}



//
// LOOP
//

function animate(){

    requestAnimationFrame(
        animate
    );


    updateMaterial();


    balloon.rotation.y += 0.001;


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


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
