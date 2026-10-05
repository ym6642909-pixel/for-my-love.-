document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const introScene = document.getElementById("intro");
    const earthScene = document.getElementById("earthScene");
    const finalScene = document.getElementById("finalScene");

    const earthContainer =
        document.getElementById("earth-container");

    const earthLoading =
        document.getElementById("earthLoading");

    const startJourneyButton =
        document.getElementById("startJourney");

    const travelButton =
        document.getElementById("travelButton");

    const distanceElement =
        document.getElementById("distance");

    const storyText =
        document.getElementById("storyText");


    /* =====================================================
       BASIC SCENE SYSTEM
       ===================================================== */

    function showScene(sceneElement) {

        if (!sceneElement) {
            console.error("Scene not found.");
            return;
        }

        document.querySelectorAll(".scene").forEach(scene => {
            scene.classList.remove("active");
        });

        sceneElement.classList.add("active");
    }


    /* =====================================================
       COUNTRIES
       ===================================================== */

    const egypt = {
        name: "Egipto",
        lat: 26.8206,
        lng: 30.8025
    };

    const honduras = {
        name: "Honduras",
        lat: 14.0723,
        lng: -86.2419
    };


    /* =====================================================
       DISTANCE
       ===================================================== */

    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const radius = 6371;

        const toRadians =
            value => value * Math.PI / 180;

        const phi1 = toRadians(lat1);
        const phi2 = toRadians(lat2);

        const deltaPhi =
            toRadians(lat2 - lat1);

        const deltaLambda =
            toRadians(lon2 - lon1);

        const a =
            Math.sin(deltaPhi / 2) ** 2 +
            Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return radius * c;
    }


    const totalDistance =
        calculateDistance(
            egypt.lat,
            egypt.lng,
            honduras.lat,
            honduras.lng
        );


    if (distanceElement) {

        distanceElement.textContent =
            Math.round(totalDistance)
                .toLocaleString("es-ES") +
            " km";
    }


    /* =====================================================
       THREE.JS VARIABLES
       ===================================================== */

    let THREE = null;

    let scene = null;
    let camera = null;
    let renderer = null;

    let earthGroup = null;
    let earth = null;

    let stars = null;

    let egyptMarker = null;
    let hondurasMarker = null;

    let routeLine = null;
    let routeGlow = null;
    let travelPoint = null;

    let earthReady = false;
    let journeyStarted = false;

    let animationFrame = null;

    let currentZoom = 15;

    let isDragging = false;

    let previousX = 0;
    let previousY = 0;

    let targetRotationX = -0.12;

    let targetRotationY = -0.45;

    let rotationVelocity = 0;

    let pinchDistance = null;


    /* =====================================================
       LOAD THREE.JS
       ===================================================== */

    function loadThreeJS() {

        return new Promise((resolve, reject) => {

            if (window.THREE) {

                THREE = window.THREE;

                resolve();

                return;
            }


            const script =
                document.createElement("script");

            script.src =
                "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.min.js";

            script.onload = () => {

                if (!window.THREE) {

                    reject(
                        new Error(
                            "Three.js loaded but is unavailable."
                        )
                    );

                    return;
                }

                THREE = window.THREE;

                resolve();
            };


            script.onerror = () => {

                reject(
                    new Error(
                        "Could not load Three.js."
                    )
                );
            };


            document.head.appendChild(script);
        });
    }


    /* =====================================================
       LAT/LNG → 3D
       ===================================================== */

    const EARTH_RADIUS = 5;


    function latLngToVector3(
        latitude,
        longitude,
        radius
    ) {

        const phi =
            (90 - latitude) *
            Math.PI /
            180;

        const theta =
            (longitude + 180) *
            Math.PI /
            180;


        const x =
            -radius *
            Math.sin(phi) *
            Math.cos(theta);


        const y =
            radius *
            Math.cos(phi);


        const z =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


        return new THREE.Vector3(
            x,
            y,
            z
        );
    }


    function latLngToUnitVector(
        latitude,
        longitude
    ) {

        return latLngToVector3(
            latitude,
            longitude,
            1
        ).normalize();
    }


    /* =====================================================
       GREAT CIRCLE
       ===================================================== */

    function createGreatCirclePoints(
        start,
        end,
        steps = 180
    ) {

        const points = [];


        const startVector =
            latLngToUnitVector(
                start.lat,
                start.lng
            );


        const endVector =
            latLngToUnitVector(
                end.lat,
                end.lng
            );


        const dot =
            THREE.MathUtils.clamp(
                startVector.dot(endVector),
                -1,
                1
            );


        const angle =
            Math.acos(dot);


        const sinAngle =
            Math.sin(angle);


        for (
            let i = 0;
            i <= steps;
            i++
        ) {

            const t =
                i / steps;


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


            const vector =
                new THREE.Vector3()
                    .addScaledVector(
                        startVector,
                        a
                    )
                    .addScaledVector(
                        endVector,
                        b
                    )
                    .normalize();


            const altitude =
                EARTH_RADIUS +
                0.08 +
                Math.sin(
                    t * Math.PI
                ) * 0.65;


            vector.multiplyScalar(
                altitude
            );


            points.push(vector);
        }


        return points;
    }


    /* =====================================================
       STARS
       ===================================================== */

    function createStars() {

        const geometry =
            new THREE.BufferGeometry();


        const count = 3500;


        const positions =
            new Float32Array(
                count * 3
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const radius =
                35 +
                Math.random() * 90;


            const theta =
                Math.random() *
                Math.PI *
                2;


            const phi =
                Math.acos(
                    2 * Math.random() - 1
                );


            positions[i * 3] =
                radius *
                Math.sin(phi) *
                Math.cos(theta);


            positions[i * 3 + 1] =
                radius *
                Math.cos(phi);


            positions[i * 3 + 2] =
                radius *
                Math.sin(phi) *
                Math.sin(theta);
        }


        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );


        const material =
            new THREE.PointsMaterial({

                color: 0xffffff,

                size: 0.07,

                transparent: true,

                opacity: 0.75
            });


        stars =
            new THREE.Points(
                geometry,
                material
            );


        scene.add(stars);
    }


    /* =====================================================
       EARTH
       ===================================================== */

    function createEarth() {

        earthGroup =
            new THREE.Group();


        scene.add(
            earthGroup
        );


        const geometry =
            new THREE.SphereGeometry(
                EARTH_RADIUS,
                96,
                96
            );


        const textureLoader =
            new THREE.TextureLoader();


        const material =
            new THREE.MeshPhongMaterial({

                color: 0x4477aa,

                shininess: 10
            });


        earth =
            new THREE.Mesh(
                geometry,
                material
            );


        earth.rotation.y =
            -Math.PI / 2;


        earthGroup.add(
            earth
        );


        /* ===============================
           EARTH ATMOSPHERE
           =============================== */

        const atmosphereGeometry =
            new THREE.SphereGeometry(
                EARTH_RADIUS * 1.035,
                64,
                64
            );


        const atmosphereMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x4da3ff,

                transparent: true,

                opacity: 0.13,

                side: THREE.BackSide,

                blending:
                    THREE.AdditiveBlending,

                depthWrite: false
            });


        const atmosphere =
            new THREE.Mesh(
                atmosphereGeometry,
                atmosphereMaterial
            );


        earthGroup.add(
            atmosphere
        );


        /* ===============================
           LOAD EARTH TEXTURE
           =============================== */

        textureLoader.load(

            "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",

            texture => {

                texture.colorSpace =
                    THREE.SRGBColorSpace;

                earth.material.map =
                    texture;

                earth.material.color.set(
                    0xffffff
                );

                earth.material.needsUpdate =
                    true;
            },

            undefined,

            error => {

                console.warn(
                    "Earth texture unavailable.",
                    error
                );
            }
        );
    }


    /* =====================================================
       LIGHTING
       ===================================================== */

    function createLighting() {

        const ambient =
            new THREE.AmbientLight(
                0x7890b0,
                0.7
            );


        scene.add(
            ambient
        );


        const sun =
            new THREE.DirectionalLight(
                0xffffff,
                2.4
            );


        sun.position.set(
            -10,
            6,
            10
        );


        scene.add(
            sun
        );


        const fill =
            new THREE.DirectionalLight(
                0x416ca8,
                0.5
            );


        fill.position.set(
            8,
            -3,
            -8
        );


        scene.add(
            fill
        );
    }


    /* =====================================================
       COUNTRY MARKERS
       ===================================================== */

    function createCountryMarker(
        location
    ) {

        const group =
            new THREE.Group();


        const position =
            latLngToVector3(
                location.lat,
                location.lng,
                EARTH_RADIUS + 0.13
            );


        group.position.copy(
            position
        );


        const core =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.09,
                    16,
                    16
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffffff
                })
            );


        group.add(
            core
        );


        const glow =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.28,
                    20,
                    20
                ),

                new THREE.MeshBasicMaterial({

                    color: 0x6da9ff,

                    transparent: true,

                    opacity: 0.15,

                    blending:
                        THREE.AdditiveBlending,

                    depthWrite: false
                })
            );


        group.add(
            glow
        );


        earthGroup.add(
            group
        );


        return group;
    }


    /* =====================================================
       ROUTE
       ===================================================== */

    function createRoute() {

        const points =
            createGreatCirclePoints(
                egypt,
                honduras,
                220
            );


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        const material =
            new THREE.LineBasicMaterial({

                color: 0xffffff,

                transparent: true,

                opacity: 0.9
            });


        routeLine =
            new THREE.Line(
                geometry,
                material
            );


        routeLine.visible =
            false;


        earthGroup.add(
            routeLine
        );


        const glowMaterial =
            new THREE.LineBasicMaterial({

                color: 0x4d8cff,

                transparent: true,

                opacity: 0.2
            });


        routeGlow =
            new THREE.Line(
                geometry.clone(),
                glowMaterial
            );


        routeGlow.visible =
            false;


        earthGroup.add(
            routeGlow
        );


        travelPoint =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.12,
                    20,
                    20
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffffff
                })
            );


        travelPoint.visible =
            false;


        earthGroup.add(
            travelPoint
        );


        routeLine.userData.points =
            points;
    }


    /* =====================================================
       INITIALIZE THREE
       ===================================================== */

    function initializeThree() {

        if (
            !earthContainer ||
            !THREE
        ) {
            return;
        }


        /* Prevent duplicate initialization */

        if (renderer) {

            handleResize();

            return;
        }


        scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(
                0x00030a
            );


        camera =
            new THREE.PerspectiveCamera(

                45,

                earthContainer.clientWidth /
                earthContainer.clientHeight,

                0.1,

                300
            );


        camera.position.set(
            0,
            0.7,
            currentZoom
        );


        camera.lookAt(
            0,
            0,
            0
        );


        renderer =
            new THREE.WebGLRenderer({

                antialias: true,

                alpha: false,

                powerPreference:
                    "high-performance"
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


        if (
            "outputColorSpace" in renderer
        ) {

            renderer.outputColorSpace =
                THREE.SRGBColorSpace;
        }


        earthContainer.innerHTML = "";


        earthContainer.appendChild(
            renderer.domElement
        );


        createLighting();

        createStars();

        createEarth();

        egyptMarker =
            createCountryMarker(
                egypt
            );

        hondurasMarker =
            createCountryMarker(
                honduras
            );

        createRoute();


        earthReady = true;


        if (earthLoading) {

            setTimeout(() => {

                earthLoading.classList.add(
                    "hidden"
                );

            }, 500);
        }


        animate();
    }


    /* =====================================================
       RESIZE
       ===================================================== */

    function handleResize() {

        if (
            !renderer ||
            !camera ||
            !earthContainer
        ) {
            return;
        }


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


    window.addEventListener(
        "resize",
        handleResize
    );


    /* =====================================================
       ROTATION
       ===================================================== */

    function startDragging(event) {

        if (
            !earthReady ||
            !earthScene.classList.contains(
                "active"
            )
        ) {
            return;
        }


        isDragging = true;


        previousX =
            event.clientX;


        previousY =
            event.clientY;


        rotationVelocity = 0;
    }


    function moveDragging(event) {

        if (
            !isDragging ||
            !earthGroup
        ) {
            return;
        }


        const dx =
            event.clientX -
            previousX;


        const dy =
            event.clientY -
            previousY;


        previousX =
            event.clientX;


        previousY =
            event.clientY;


        targetRotationY +=
            dx * 0.004;


        targetRotationX +=
            dy * 0.0025;


        targetRotationX =
            THREE.MathUtils.clamp(
                targetRotationX,
                -0.8,
                0.8
            );


        rotationVelocity =
            dx * 0.002;
    }


    function stopDragging() {

        isDragging = false;
    }


    document.addEventListener(
        "pointerdown",
        startDragging
    );


    document.addEventListener(
        "pointermove",
        moveDragging
    );


    document.addEventListener(
        "pointerup",
        stopDragging
    );


    /* =====================================================
       ZOOM
       ===================================================== */

    document.addEventListener(
        "wheel",
        event => {

            if (
                !earthScene.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            currentZoom +=
                event.deltaY * 0.008;


            currentZoom =
                THREE.MathUtils.clamp(
                    currentZoom,
                    6,
                    22
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH PINCH
       ===================================================== */

    document.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !== 2
            ) {
                return;
            }


            const a =
                event.touches[0];


            const b =
                event.touches[1];


            pinchDistance =
                Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );
        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchmove",
        event => {

            if (
                event.touches.length !== 2 ||
                pinchDistance === null ||
                !THREE
            ) {
                return;
            }


            const a =
                event.touches[0];


            const b =
                event.touches[1];


            const newDistance =
                Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );


            const difference =
                newDistance -
                pinchDistance;


            currentZoom -=
                difference * 0.008;


            currentZoom =
                THREE.MathUtils.clamp(
                    currentZoom,
                    6,
                    22
                );


            pinchDistance =
                newDistance;
        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchend",
        () => {

            pinchDistance = null;

        },
        {
            passive: true
        }
    );


    /* =====================================================
       ANIMATION
       ===================================================== */

    function animate(
        time = performance.now()
    ) {

        animationFrame =
            requestAnimationFrame(
                animate
            );


        if (earthGroup) {

            if (!isDragging) {

                if (!journeyStarted) {

                    targetRotationY +=
                        0.0007;
                }

                targetRotationY +=
                    rotationVelocity;

                rotationVelocity *=
                    0.94;
            }


            earthGroup.rotation.y +=
                (
                    targetRotationY -
                    earthGroup.rotation.y
                ) * 0.08;


            earthGroup.rotation.x +=
                (
                    targetRotationX -
                    earthGroup.rotation.x
                ) * 0.08;
        }


        if (stars) {

            stars.rotation.y +=
                0.00003;
        }


        if (egyptMarker) {

            const pulse =
                1 +
                Math.sin(
                    time * 0.003
                ) * 0.15;


            egyptMarker.scale.set(
                pulse,
                pulse,
                pulse
            );
        }


        if (hondurasMarker) {

            const pulse =
                1 +
                Math.sin(
                    time * 0.003
                ) * 0.15;


            hondurasMarker.scale.set(
                pulse,
                pulse,
                pulse
            );
        }


        if (camera) {

            camera.position.z =
                currentZoom;


            camera.lookAt(
                0,
                0,
                0
            );
        }


        if (
            renderer &&
            scene &&
            camera
        ) {

            renderer.render(
                scene,
                camera
            );
        }
    }


    /* =====================================================
       ROUTE ANIMATION
       ===================================================== */

    function startRouteAnimation() {

        if (
            !routeLine ||
            !routeGlow ||
            !travelPoint
        ) {
            return;
        }


        const points =
            routeLine.userData.points;


        if (
            !points ||
            points.length === 0
        ) {
            return;
        }


        routeLine.visible =
            true;


        routeGlow.visible =
            true;


        travelPoint.visible =
            true;


        const duration =
            8000;


        const startTime =
            performance.now();


        function drawRoute(time) {

            const progress =
                Math.min(
                    (time - startTime) /
                    duration,
                    1
                );


            const eased =
                progress < 0.5

                    ? 2 *
                      progress *
                      progress

                    : 1 -
                      Math.pow(
                          -2 * progress + 2,
                          2
                      ) / 2;


            const index =
                Math.floor(
                    eased *
                    (points.length - 1)
                );


            const visiblePoints =
                points.slice(
                    0,
                    index + 1
                );


            routeLine.geometry.dispose();


            routeLine.geometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        visiblePoints
                    );


            routeGlow.geometry.dispose();


            routeGlow.geometry =
                new THREE.BufferGeometry()
                    .setFromPoints(
                        visiblePoints
                    );


            if (points[index]) {

                travelPoint.position.copy(
                    points[index]
                );
            }


            if (storyText) {

                if (progress < 0.33) {

                    storyText.textContent =
                        "Un camino comienza a cruzar el mundo...";

                } else if (
                    progress < 0.7
                ) {

                    storyText.textContent =
                        "Miles de kilómetros entre dos corazones...";

                } else {

                    storyText.textContent =
                        "Y aun así, el mundo parece un poco más pequeño.";
                }
            }


            if (progress < 1) {

                requestAnimationFrame(
                    drawRoute
                );

            } else {

                finishJourney();
            }
        }


        requestAnimationFrame(
            drawRoute
        );
    }


    /* =====================================================
       FINISH JOURNEY
       ===================================================== */

    function finishJourney() {

        if (travelPoint) {

            travelPoint.visible =
                false;
        }


        if (storyText) {

            storyText.textContent =
                "Finalmente... el camino llega hasta Honduras.";
        }


        if (travelButton) {

            travelButton.disabled =
                false;


            travelButton.style.opacity =
                "1";


            travelButton.textContent =
                "Continuar";


            travelButton.onclick =
                () => {

                    showScene(
                        finalScene
                    );
                };
        }
    }


    /* =====================================================
       START BUTTON
       ===================================================== */

    if (startJourneyButton) {

        startJourneyButton.addEventListener(
            "click",
            async () => {

                /*
                 * IMPORTANT:
                 * First change the scene.
                 * Do not wait for Three.js.
                 */

                showScene(
                    earthScene
                );


                /*
                 * Show loading.
                 */

                if (earthLoading) {

                    earthLoading.classList.remove(
                        "hidden"
                    );
                }


                /*
                 * Load Three.js after
                 * entering the scene.
                 */

                try {

                    await loadThreeJS();


                    initializeThree();


                } catch (error) {

                    console.error(
                        "Three.js error:",
                        error
                    );


                    if (earthLoading) {

                        earthLoading.innerHTML = `
                            <span>
                                No se pudo cargar el mundo 3D.
                            </span>
                        `;
                    }
                }
            }
        );
    }


    /* =====================================================
       TRAVEL BUTTON
       ===================================================== */

    if (travelButton) {

        travelButton.addEventListener(
            "click",
            () => {

                if (
                    !earthReady ||
                    journeyStarted
                ) {
                    return;
                }


                journeyStarted =
                    true;


                travelButton.disabled =
                    true;


                travelButton.style.opacity =
                    "0.5";


                travelButton.textContent =
                    "Viajando...";


                if (storyText) {

                    storyText.textContent =
                        "Preparando el camino entre nosotros...";
                }


                setTimeout(
                    () => {

                        startRouteAnimation();

                    },
                    1200
                );
            }
        );
    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    showScene(
        introScene
    );

});
