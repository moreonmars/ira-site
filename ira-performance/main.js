import * as THREE from 
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


const container =
document.getElementById("container");


//
// SCENE
//

const scene =
new THREE.Scene();



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
    1.5,
    128,
    128
);



const material =
new THREE.MeshPhysicalMaterial({

    color:0xffffff,

    transparent:true,

    opacity:0.35,

    transmission:1,

    thickness:1.5,

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
    6
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
// POINT MEMORY
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


//
// POINTER
//

window.addEventListener(
"pointermove",
(event)=>{


    const mouse =
    new THREE.Vector2(

        (event.clientX /
        window.innerWidth) * 2 - 1,


        -(event.clientY /
        window.innerHeight) * 2 + 1

    );


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


});





//
// PHYSICS UPDATE
//

function update(){


    const time =
    performance.now() * 0.001;



    for(
        let i = 0;
        i < points.length;
        i++
    ){


        const p =
        points[i];



        //
        // elastic return
        //

        const restore =
        p.origin.clone()
        .sub(p.current)
        .multiplyScalar(
            0.08
        );


        p.velocity.add(
            restore
        );



        //
        // breathing
        //

        const normal =
        p.origin.clone()
        .normalize();



        const breathing =
        Math.sin(
            time * 1.5
        ) * 0.003;



        p.velocity.add(
            normal.multiplyScalar(
                breathing
            )
        );



        //
        // touch deformation
        //

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
                (1.0-distance)
                *0.04
            );



            p.velocity.add(
                push
            );

        }



        //
        // damping
        //

        p.velocity.multiplyScalar(
            0.82
        );


        p.current.add(
            p.velocity
        );



        //
        // safety radius
        //

        const maxRadius = 1.6;


        if(
            p.current.length() > maxRadius
        ){

            p.current
            .normalize()
            .multiplyScalar(
                maxRadius
            );

        }



        position.setXYZ(
            i,
            p.current.x,
            p.current.y,
            p.current.z
        );


    }



    position.needsUpdate = true;


    geometry.computeVertexNormals();


}





//
// ANIMATION
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


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


});
