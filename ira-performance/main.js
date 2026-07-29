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

const geometry = new THREE.SphereGeometry(
    1.5,
    128,
    128
);



const material = new THREE.MeshPhysicalMaterial({

    color:0xe8e8e8,

    transparent:true,

    opacity:0.7,

    transmission:0.2,

    thickness:1,

    roughness:0.12,

    clearcoat:1

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
    7
);

light.position.set(
    -3,
    4,
    6
);


scene.add(light);


scene.add(
    new THREE.AmbientLight(
        0xffffff,
        0.8
    )
);


//
// POINT DATA
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



let inflating = false;


let pressure = 0;



//
// POINTER
//

window.addEventListener(
"pointermove",
(e)=>{


    const mouse =
    new THREE.Vector2(

        (e.clientX /
        window.innerWidth)*2-1,


        -(e.clientY /
        window.innerHeight)*2+1

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


});



window.addEventListener(
"pointerdown",
()=>{

    inflating = true;

});



window.addEventListener(
"pointerup",
()=>{

    inflating = false;

});





//
// UPDATE
//

function update(){


    const time =
    performance.now()*0.001;



    //
    // AIR PRESSURE
    //

    if(inflating){

        pressure += 0.0015;

    }
    else{

        pressure -= 0.0003;

    }



    pressure =
    THREE.MathUtils.clamp(
        pressure,
        0,
        0.35
    );



    //
    // MATERIAL RESPONSE
    //

    material.roughness =
    0.12 + pressure*0.15;


    material.opacity =
    0.7 - pressure*0.15;



    for(
        let i=0;
        i<points.length;
        i++
    ){


        const p =
        points[i];



        const normal =
        p.origin.clone()
        .normalize();



        //
        // inflate
        //

        const desired =
        p.origin.clone()
        .add(
            normal.multiplyScalar(
                pressure
            )
        );



        const spring =
        desired
        .sub(p.current)
        .multiplyScalar(
            0.04
        );


        p.velocity.add(
            spring
        );



        //
        // touch
        //

        const distance =
        p.current.distanceTo(
            target
        );



        if(distance < 1.15){


            const push =
            p.current.clone()
            .sub(target)
            .normalize();


            push.multiplyScalar(
                (1.15-distance)*0.08
            );


            p.velocity.add(
                push
            );

        }



        //
        // wobble near limit
        //

        if(pressure > 0.25){


            p.velocity.add(
                normal.multiplyScalar(
                    Math.sin(
                        time*12+i
                    )*
                    0.002
                )
            );

        }



        //
        // damping
        //

        p.velocity.multiplyScalar(
            0.88
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
