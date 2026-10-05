document.addEventListener("DOMContentLoaded", function () {

    console.log("Entre Dos Mundos started");

    const earthContainer =
        document.getElementById("earth-container");

    const earthScene =
        document.getElementById("earthScene");

    const earthLoading =
        document.getElementById("earthLoading");

    const travelButton =
        document.getElementById("travelButton");

    const storyText =
        document.getElementById("storyText");

    const distanceElement =
        document.getElementById("distance");

    const finalScene =
        document.getElementById("finalScene");


    /* =========================================
       DISTANCE
       ========================================= */

    const egypt = {
        lat: 26.8206,
        lng: 30.8025
    };

    const honduras = {
        lat: 14.0723,
        lng: -86.2419
    };


    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const R = 6371;

        const dLat =
            (lat2 - lat1) *
            Math.PI / 180;

        const dLon =
            (lon2 - lon1) *
            Math.PI / 180;

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +

            Math.cos(
                lat1 * Math.PI / 180
            ) *

            Math.cos(
                lat2 * Math.PI / 180
            ) *

            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
    }


    const distance =
        calculateDistance(
            egypt.lat,
            egypt.lng,
            honduras.lat,
            honduras.lng
        );


    if (distanceElement) {

        distanceElement.textContent =
            Math.round(distance)
                .toLocaleString("es-ES") +
            " km";
    }


    /* =========================================
       THREE.JS
       ========================================= */

    if (
        typeof THREE === "undefined"
    ) {

        console.error(
            "Three.js is not loaded."
        );

        if (earthLoading) {

            earthLoading.innerHTML =
                "<span>No se pudo cargar el mundo 3D.</span>";
        }

        return;
    }


    console.log(
        "Three.js loaded successfully"
    );


    /* =========================================
       VARIABLES
       ========================================= */

    let scene;
    let camera;
    let renderer;

    let earth;
    let earthGroup;

    let route;
    let movingPoint;

    let animationId;

    let routeStarted = false;


    const EARTH_RADIUS = 5;


    /* =========================================
       SCENE
       ========================================= */

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x00030a
        );


    /* =========================================
       CAMERA
       ========================================= */

    function createCamera() {

        const width =
            earthContainer.clientWidth;

        const height =
            earthContainer.clientHeight;


        camera =
            new THREE.PerspectiveCamera(
                45,
                width / height,
                0.1,
                200
            );


        camera.position.set(
            0,
            1,
            15
        );


        camera.lookAt(
            0,
            0,
            0
        );
    }


    createCamera();


    /* =========================================
       RENDERER
       ========================================= */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    renderer.setSize(
        earthContainer.clientWidth,
        earthContainer.clientHeight
    );


    earthContainer.appendChild(
        renderer.domElement
    );


    /* =========================================
       LIGHT
       ========================================= */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            1.2
        );


    scene.add(
        ambientLight
    );


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            2.5
        );


    sun.position.set(
        -10,
        5,
        10
    );


    scene.add(
        sun
    );


    /* =========================================
       STARS
       ========================================= */

    const starGeometry =
        new THREE.BufferGeometry();


    const starCount = 3000;


    const starPositions =
        new Float32Array(
            starCount * 3
        );


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const radius =
            40 +
            Math.random() * 70;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 *
                Math.random() -
                1
            );


        starPositions[i * 3] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        starPositions[i * 3 + 1] =
            radius *
            Math.cos(phi);


        starPositions[i * 3 + 2] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);
    }


    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            starPositions,
            3
        )
    );


    const starMaterial =
        new THREE.PointsMaterial({

            color: 0xffffff,

            size: 0.07,

            transparent: true,

            opacity: 0.8
        });


    const stars =
        new THREE.Points(
            starGeometry,
            starMaterial
        );


    scene.add(
        stars
    );


    /* =========================================
       EARTH GROUP
       ========================================= */

    earthGroup =
        new THREE.Group();


    scene.add(
        earthGroup
    );


    /* =========================================
       EARTH
       ========================================= */

    const earthGeometry =
        new THREE.SphereGeometry(
            EARTH_RADIUS,
            64,
            64
        );


    const earthMaterial =
        new THREE.MeshPhongMaterial({

            color: 0x2870ad,

            shininess: 15
        });


    earth =
        new THREE.Mesh(
            earthGeometry,
            earthMaterial
        );


    earth.rotation.y =
        -Math.PI / 2;


    earthGroup.add(
        earth
    );


    /* =========================================
       EARTH TEXTURE
       ========================================= */

    const textureLoader =
        new THREE.TextureLoader();


    textureLoader.load(

        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",

        function (texture) {

            texture.colorSpace =
                THREE.SRGBColorSpace;


            earthMaterial.map =
                texture;


            earthMaterial.color.set(
                0xffffff
            );


            earthMaterial.needsUpdate =
                true;

        },

        undefined,

        function () {

            console.warn(
                "Earth texture failed. Using fallback."
            );
        }
    );


    /* =========================================
       ATMOSPHERE
       ========================================= */

    const atmosphere =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                EARTH_RADIUS * 1.04,
                48,
                48
            ),

            new THREE.MeshBasicMaterial({

                color: 0x4da3ff,

                transparent: true,

                opacity: 0.12,

                side: THREE.BackSide,

                blending:
                    THREE.AdditiveBlending,

                depthWrite: false
            })
        );


    earthGroup.add(
        atmosphere
    );


    /* =========================================
       COORDINATES
       ========================================= */

    function coordinateToVector(
        lat,
        lng,
        radius
    ) {

        const phi =
            (90 - lat) *
            Math.PI /
            180;


        const theta =
            (lng + 180) *
            Math.PI /
            180;


        return new THREE.Vector3(

            -radius *
            Math.sin(phi) *
            Math.cos(theta),

            radius *
            Math.cos(phi),

            radius *
            Math.sin(phi) *
            Math.sin(theta)
        );
    }


    /* =========================================
       COUNTRY MARKERS
       ========================================= */

    function createMarker(
        lat,
        lng
    ) {

        const position =
            coordinateToVector(
                lat,
                lng,
                EARTH_RADIUS + 0.12
            );


        const marker =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.12,
                    16,
                    16
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffffff
                })
            );


        marker.position.copy(
            position
        );


        earthGroup.add(
            marker
        );


        return marker;
    }


    const egyptMarker =
        createMarker(
            egypt.lat,
            egypt.lng
        );


    const hondurasMarker =
        createMarker(
            honduras.lat,
            honduras.lng
        );


    /* =========================================
       GREAT CIRCLE ROUTE
       ========================================= */

    function createRoutePoints() {

        const start =
            coordinateToVector(
                egypt.lat,
                egypt.lng,
                1
            ).normalize();


        const end =
            coordinateToVector(
                honduras.lat,
                honduras.lng,
                1
            ).normalize();


        const dot =
            THREE.MathUtils.clamp(
                start.dot(end),
                -1,
                1
            );


        const angle =
            Math.acos(dot);


        const sinAngle =
            Math.sin(angle);


        const points = [];


        for (
            let i = 0;
            i <= 160;
            i++
        ) {

            const t =
                i / 160;


            const a =
                Math.sin(
                    (1 - t) * angle
                ) /
                sinAngle;


            const b =
                Math.sin(
                    t * angle
                ) /
                sinAngle;


            const point =
                new THREE.Vector3()
                    .addScaledVector(
                        start,
                        a
                    )
                    .addScaledVector(
                        end,
                        b
                    )
                    .normalize();


            point.multiplyScalar(
                EARTH_RADIUS +
                0.12 +
                Math.sin(
                    t * Math.PI
                ) * 0.6
            );


            points.push(
                point
            );
        }


        return points;
    }


    const routePoints =
        createRoutePoints();


    /* =========================================
       ROUTE LINE
       ========================================= */

    const routeGeometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                routePoints
            );


    const routeMaterial =
        new THREE.LineBasicMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 0.9
        });


    route =
        new THREE.Line(
            routeGeometry,
            routeMaterial
        );


    route.visible =
        false;


    earthGroup.add(
        route
    );


    /* =========================================
       MOVING POINT
       ========================================= */

    movingPoint =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.16,
                20,
                20
            ),

            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );


    movingPoint.visible =
        false;


    earthGroup.add(
        movingPoint
    );


    /* =========================================
       INITIAL EARTH POSITION
       ========================================= */

    earthGroup.rotation.x =
        -0.12;


    earthGroup.rotation.y =
        -0.45;


    /* =========================================
       HIDE LOADING
       ========================================= */

    setTimeout(
        function () {

            if (earthLoading) {

                earthLoading.classList.add(
                    "hidden"
                );
            }

        },
        1000
    );


    /* =========================================
       ANIMATION
       ========================================= */

    function animate() {

        animationId =
            requestAnimationFrame(
                animate
            );


        if (
            earthScene &&
            earthScene.classList.contains(
                "active"
            )
        ) {

            if (!routeStarted) {

                earthGroup.rotation.y +=
                    0.0008;
            }
        }


        stars.rotation.y +=
            0.00003;


        const pulse =
            1 +
            Math.sin(
                performance.now() * 0.003
            ) * 0.12;


        egyptMarker.scale.set(
            pulse,
            pulse,
            pulse
        );


        hondurasMarker.scale.set(
            pulse,
            pulse,
            pulse
        );


        renderer.render(
            scene,
            camera
        );
    }


    animate();


    /* =========================================
       RESIZE
       ========================================= */

    window.addEventListener(
        "resize",
        function () {

            const width =
                earthContainer.clientWidth;

            const height =
                earthContainer.clientHeight;


            camera.aspect =
                width / height;


            camera.updateProjectionMatrix();


            renderer.setSize(
                width,
                height
            );
        }
    );


    /* =========================================
       START JOURNEY
       ========================================= */

    travelButton.addEventListener(
        "click",
        function () {

            if (routeStarted) {
                return;
            }


            routeStarted =
                true;


            travelButton.disabled =
                true;


            travelButton.textContent =
                "Viajando...";


            if (storyText) {

                storyText.textContent =
                    "El camino comienza entre Egipto y Honduras...";
            }


            route.visible =
                true;


            movingPoint.visible =
                true;


            let index = 0;


            const routeTimer =
                setInterval(
                    function () {

                        if (
                            index >=
                            routePoints.length
                        ) {

                            clearInterval(
                                routeTimer
                            );


                            movingPoint.visible =
                                false;


                            travelButton.disabled =
                                false;


                            travelButton.textContent =
                                "Continuar";


                            if (storyText) {

                                storyText.textContent =
                                    "Finalmente... el camino llega hasta Honduras.";
                            }


                            travelButton.onclick =
                                function () {

                                    earthScene.classList.remove(
                                        "active"
                                    );


                                    finalScene.classList.add(
                                        "active"
                                    );
                                };


                            return;
                        }


                        const visiblePoints =
                            routePoints.slice(
                                0,
                                index + 1
                            );


                        route.geometry.dispose();


                        route.geometry =
                            new THREE.BufferGeometry()
                                .setFromPoints(
                                    visiblePoints
                                );


                        movingPoint.position.copy(
                            routePoints[index]
                        );


                        index++;

                    },
                    50
                );
        }
    );


    /* =========================================
       MOUSE / TOUCH ROTATION
       ========================================= */

    let dragging = false;

    let lastX = 0;
    let lastY = 0;


    earthContainer.addEventListener(
        "pointerdown",
        function (event) {

            dragging = true;

            lastX =
                event.clientX;

            lastY =
                event.clientY;
        }
    );


    earthContainer.addEventListener(
        "pointermove",
        function (event) {

            if (!dragging) {
                return;
            }


            const dx =
                event.clientX -
                lastX;


            const dy =
                event.clientY -
                lastY;


            lastX =
                event.clientX;


            lastY =
                event.clientY;


            earthGroup.rotation.y +=
                dx * 0.005;


            earthGroup.rotation.x +=
                dy * 0.003;


            earthGroup.rotation.x =
                THREE.MathUtils.clamp(
                    earthGroup.rotation.x,
                    -0.8,
                    0.8
                );
        }
    );


    earthContainer.addEventListener(
        "pointerup",
        function () {

            dragging = false;
        }
    );


    earthContainer.addEventListener(
        "pointerleave",
        function () {

            dragging = false;
        }
    );


    console.log(
        "3D Earth initialized successfully"
    );

});
