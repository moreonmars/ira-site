import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container = document.getElementById("container");


//
// SCENE
//

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


container.appendChild(
    renderer.domElement
);


//
// BALLOON
//

const geometry =
new THREE.SphereGeometry(
    1.55,
    160,
    160
);



const material =
new THREE.MeshPhysicalMaterial({

    color:0xffffff,

    transparent:true,

    opacity:0.32,

    transmission:1,

    thickness:1.8,

    roughness:0.08,

    clearcoat:1,

    clearcoatRoughness:0.05

});



const balloon =
new THREE.Mesh(
    geometry,
    material
);


scene.add(balloon);


//
// LIGHT
//

const light =
new THREE.PointLight(
    0xffffff,
    7
);


light.position.set(
    3,
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
// GEOMETRY MEMORY
//

const position =
geometry.attributes.position;


const original = [];


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

}



let mouse =
new THREE.Vector2();


let target =
new THREE.Vector3();


let tension = 0;



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



        const raycaster =
        new THREE.Raycaster();


        raycaster.setFromCamera(
            mouse,
            camera
        );


        raycaster.ray.at(
            3,
            target
        );

    }
);


//
// UPDATE MATERIAL
//

function updateMaterial(){


    const time =
    performance.now() * 0.001;



    //
    // breathing
    //

    const breathing =
    Math.sin(time * 1.5) * 0.015;



    //
    // controlled pressure
    //

    const pressure =
    0.05 +
    breathing +
    tension * 0.04;



    //
    // slowly relax
    //

    tension -= 0.00008;


    tension =
    THREE.MathUtils.clamp(
        tension,
        0,
        1
    );



    for(
        let i = 0;
        i < position.count;
        i++
    ){


        let point =
        original[i]
        .clone();



        const normal =
        original[i]
        .clone()
        .normalize();



        //
        // inflation
        //

        point.add(
            normal.clone()
            .multiplyScalar(
                pressure
            )
        );



        //
        // touch deformation
        //

        const distance =
        point.distanceTo(target);



        if(distance < 1.35){


            const force =
            point.clone()
            .sub(target)
            .normalize();



            force.multiplyScalar(
                (1.35-distance)*0.35
            );


            point.add(
                force
            );



            tension += 0.002;

        }



        //
        // stress vibration
        //

        if(tension > 0.65){


            const vibration =
            Math.sin(
                time * 18 + i
            )
            *
            (tension-0.65)
            *
            0.015;



            point.add(
                normal.clone()
                .multiplyScalar(
                    vibration
                )
            );

        }



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


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
