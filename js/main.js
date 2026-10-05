/* =========================================================
   ENTRE DOS MUNDOS
   3D EARTH EXPERIENCE
   main.js
   ========================================================= */


/* =========================================================
   WAIT FOR PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const introScene =
        document.getElementById("intro");

    const earthScene =
        document.getElementById("earthScene");

    const finalScene =
        document.getElementById("finalScene");

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
       CHECK THREE.JS
       ===================================================== */

    if (typeof THREE === "undefined") {

        console.error(
            "Three.js could not be loaded."
        );

        if (earthLoading) {

            earthLoading.innerHTML = `
                <span>
                    No se pudo cargar la experiencia 3D.
                </span>
            `;
        }

        return;
    }


    /* =====================================================
       LOCATIONS
       ===================================================== */

    /*
     * Representative coordinates for the two countries.
     */

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
       EARTH SETTINGS
       ===================================================== */

    const EARTH_RADIUS = 5;

    const CAMERA_START_DISTANCE = 15;

    const CAMERA_MIN_DISTANCE = 5.8;

    const CAMERA_MAX_DISTANCE = 18;


    /* =====================================================
       THREE.JS VARIABLES
       ===================================================== */

    let scene = null;

    let camera = null;

    let renderer = null;

    let earth = null;

    let earthGroup = null;

    let atmosphere = null;

    let stars = null;

    let egyptMarker = null;

    let hondurasMarker = null;

    let routeLine = null;

    let routeGlow = null;

    let travelPoint = null;

    let animationFrame = null;


    /* =====================================================
       STATE
       ===================================================== */

    let journeyStarted = false;

    let journeyFinished = false;

    let earthReady = false;

    let cameraAnimation = null;


    /* =====================================================
       INTERACTION STATE
       ===================================================== */

    let isDragging = false;

    let previousPointerX = 0;

    let previousPointerY = 0;

    let rotationVelocityX = 0;

    let rotationVelocityY = 0;

    let targetRotationX = 0;

    let targetRotationY = 0;

    let currentZoom =
        CAMERA_START_DISTANCE;


    /* =====================================================
       COLOR HELPERS
       ===================================================== */

    const COLORS = {

        white: 0xffffff,

        blue: 0x6da9ff,

        softBlue: 0x4d8cff,

        atmosphere: 0x5ca9ff,

        route: 0xffffff

    };


    /* =====================================================
       SCENE CONTROL
       ===================================================== */

    function showScene(sceneElement) {

        if (!sceneElement) return;

        document
            .querySelectorAll(".scene")
            .forEach((element) => {

                element.classList.remove("active");

            });

        sceneElement.classList.add("active");
    }


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
            (value) =>
                value * Math.PI / 180;


        const phi1 =
            toRadians(lat1);

        const phi2 =
            toRadians(lat2);

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
       LAT / LNG → 3D
       ===================================================== */

    function latLngToVector3(
        latitude,
        longitude,
        radius
    ) {

        /*
         * Convert geographic coordinates
         * into a position on a sphere.
         */

        const phi =
            (90 - latitude) *
            Math.PI / 180;


        const theta =
            (longitude + 180) *
            Math.PI / 180;


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


    /* =====================================================
       GREAT CIRCLE POINTS
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


        if (angle < 0.00001) {

            return [
                latLngToVector3(
                    start.lat,
                    start.lng,
                    EARTH_RADIUS + 0.08
                ),
                latLngToVector3(
                    end.lat,
                    end.lng,
                    EARTH_RADIUS + 0.08
                )
            ];
        }


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
                ) / sinAngle;


            const b =
                Math.sin(
                    t * angle
                ) / sinAngle;


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


            /*
             * Slightly above the surface.
             */

            const altitude =
                EARTH_RADIUS +
                0.08 +
                Math.sin(t * Math.PI) *
                0.65;


            vector.multiplyScalar(
                altitude
            );


            points.push(vector);
        }


        return points;
    }


    /* =====================================================
       LAT / LNG → UNIT VECTOR
       ===================================================== */

    function latLngToUnitVector(
        latitude,
        longitude
    ) {

        const vector =
            latLngToVector3(
                latitude,
                longitude,
                1
            );


        return vector.normalize();
    }


    /* =====================================================
       CREATE STARS
       ===================================================== */

    function createStars() {

        const geometry =
            new THREE.BufferGeometry();


        const starCount = 4500;


        const positions =
            new Float32Array(
                starCount * 3
            );


        for (
            let i = 0;
            i < starCount;
            i++
        ) {

            const radius =
                30 +
                Math.random() * 100;


            const theta =
                Math.random() *
                Math.PI * 2;


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

                color:
                    COLORS.white,

                size:
                    0.075,

                transparent:
                    true,

                opacity:
                    0.8,

                sizeAttenuation:
                    true
            });


        stars =
            new THREE.Points(
                geometry,
                material
            );


        scene.add(stars);
    }


    /* =====================================================
       CREATE EARTH
       ===================================================== */

    function createEarth() {

        earthGroup =
            new THREE.Group();


        scene.add(
            earthGroup
        );


        /* =================================================
           EARTH GEOMETRY
           ================================================= */

        const geometry =
            new THREE.SphereGeometry(
                EARTH_RADIUS,
                96,
                96
            );


        /* =================================================
           EARTH TEXTURE
           ================================================= */

        const textureLoader =
            new THREE.TextureLoader();


        textureLoader.setCrossOrigin(
            "anonymous"
        );


        const earthTexture =
            textureLoader.load(
                "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
                () => {

                    hideLoading();

                },
                undefined,
                () => {

                    console.warn(
                        "Earth texture could not be loaded."
                    );

                    hideLoading();
                }
            );


        /* =================================================
           NIGHT LIGHTS
           ================================================= */

        const nightTexture =
            textureLoader.load(
                "https://threejs.org/examples/textures/planets/earth_lights_2048.png"
            );


        /* =================================================
           EARTH MATERIAL
           ================================================= */

        const material =
            new THREE.MeshPhongMaterial({

                map:
                    earthTexture,

                emissiveMap:
                    nightTexture,

                emissive:
                    new THREE.Color(
                        0x334466
                    ),

                emissiveIntensity:
                    0.22,

                shininess:
                    8
            });


        earth =
            new THREE.Mesh(
                geometry,
                material
            );


        /*
         * Rotate texture orientation.
         */

        earth.rotation.y =
            -Math.PI / 2;


        earthGroup.add(
            earth
        );


        /* =================================================
           ATMOSPHERE
           ================================================= */

        const atmosphereGeometry =
            new THREE.SphereGeometry(
                EARTH_RADIUS * 1.035,
                64,
                64
            );


        const atmosphereMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    COLORS.atmosphere,

                transparent:
                    true,

                opacity:
                    0.12,

                side:
                    THREE.BackSide,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false
            });


        atmosphere =
            new THREE.Mesh(
                atmosphereGeometry,
                atmosphereMaterial
            );


        earthGroup.add(
            atmosphere
        );


        /* =================================================
           OUTER GLOW
           ================================================= */

        const glowGeometry =
            new THREE.SphereGeometry(
                EARTH_RADIUS * 1.08,
                64,
                64
            );


        const glowMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    COLORS.atmosphere,

                transparent:
                    true,

                opacity:
                    0.035,

                side:
                    THREE.BackSide,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false
            });


        const glow =
            new THREE.Mesh(
                glowGeometry,
                glowMaterial
            );


        earthGroup.add(
            glow
        );
    }


    /* =====================================================
       CREATE LIGHTING
       ===================================================== */

    function createLighting() {

        /*
         * Ambient light.
         */

        const ambientLight =
            new THREE.AmbientLight(
                0x7890b0,
                0.65
            );


        scene.add(
            ambientLight
        );


        /*
         * Main sunlight.
         */

        const sunLight =
            new THREE.DirectionalLight(
                0xffffff,
                2.4
            );


        sunLight.position.set(
            -10,
            6,
            10
        );


        scene.add(
            sunLight
        );


        /*
         * Soft blue fill.
         */

        const fillLight =
            new THREE.DirectionalLight(
                0x426aa8,
                0.5
            );


        fillLight.position.set(
            8,
            -3,
            -8
        );


        scene.add(
            fillLight
        );
    }


    /* =====================================================
       CREATE COUNTRY MARKER
       ===================================================== */

    function createCountryMarker(
        location,
        type
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


        /*
         * Core.
         */

        const coreGeometry =
            new THREE.SphereGeometry(
                0.09,
                16,
                16
            );


        const coreMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    COLORS.white
            });


        const core =
            new THREE.Mesh(
                coreGeometry,
                coreMaterial
            );


        group.add(
            core
        );


        /*
         * Glow ring.
         */

        const ringGeometry =
            new THREE.RingGeometry(
                0.13,
                0.17,
                32
            );


        const ringMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    COLORS.white,

                transparent:
                    true,

                opacity:
                    0.8,

                side:
                    THREE.DoubleSide
            });


        const ring =
            new THREE.Mesh(
                ringGeometry,
                ringMaterial
            );


        /*
         * Point the ring outward
         * from the Earth's center.
         */

        ring.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            position.clone().normalize()
        );


        group.add(
            ring
        );


        /*
         * Larger transparent glow.
         */

        const glowGeometry =
            new THREE.SphereGeometry(
                0.28,
                24,
                24
            );


        const glowMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    COLORS.white,

                transparent:
                    true,

                opacity:
                    0.08,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false
            });


        const glow =
            new THREE.Mesh(
                glowGeometry,
                glowMaterial
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
       CREATE ROUTE
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

                color:
                    COLORS.route,

                transparent:
                    true,

                opacity:
                    0.9
            });


        routeLine =
            new THREE.Line(
                geometry,
                material
            );


        /*
         * Hidden initially.
         */

        routeLine.visible = false;


        earthGroup.add(
            routeLine
        );


        /* =================================================
           GLOW ROUTE
           ================================================= */

        const glowMaterial =
            new THREE.LineBasicMaterial({

                color:
                    COLORS.softBlue,

                transparent:
                    true,

                opacity:
                    0.18
            });


        routeGlow =
            new THREE.Line(
                geometry.clone(),
                glowMaterial
            );


        routeGlow.scale.set(
            1.002,
            1.002,
            1.002
        );


        routeGlow.visible = false;


        earthGroup.add(
            routeGlow
        );


        /* =================================================
           MOVING POINT
           ================================================= */

        const pointGeometry =
            new THREE.SphereGeometry(
                0.12,
                20,
                20
            );


        const pointMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    COLORS.white
            });


        travelPoint =
            new THREE.Mesh(
                pointGeometry,
                pointMaterial
            );


        travelPoint.visible =
            false;


        earthGroup.add(
            travelPoint
        );


        /*
         * Store points for animation.
         */

        routeLine.userData.points =
            points;
    }


    /* =====================================================
       CREATE THREE.JS
       ===================================================== */

    function initializeThree() {

        if (!earthContainer) {
            return;
        }


        /* =================================================
           SCENE
           ================================================= */

        scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(
                0x00030a
            );


        /* =================================================
           CAMERA
           ================================================= */

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
            1,
            CAMERA_START_DISTANCE
        );


        camera.lookAt(
            0,
            0,
            0
        );


        /* =================================================
           RENDERER
           ================================================= */

        renderer =
            new THREE.WebGLRenderer({

                antialias:
                    true,

                alpha:
                    false,

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


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        earthContainer.appendChild(
            renderer.domElement
        );


        /* =================================================
           OBJECTS
           ================================================= */

        createLighting();

        createStars();

        createEarth();


        /* =================================================
           MARKERS
           ================================================= */

        egyptMarker =
            createCountryMarker(
                egypt,
                "egypt"
            );


        hondurasMarker =
            createCountryMarker(
                honduras,
                "honduras"
            );


        /* =================================================
           ROUTE
           ================================================= */

        createRoute();


        /* =================================================
           READY
           ================================================= */

        earthReady = true;


        hideLoading();


        /*
         * Initial cinematic position.
         */

        earthGroup.rotation.x =
            -0.12;

        earthGroup.rotation.y =
            -0.45;


        /*
         * Start render loop.
         */

        animate();
    }


    /* =====================================================
       HIDE LOADING
       ===================================================== */

    function hideLoading() {

        if (!earthLoading) {
            return;
        }


        setTimeout(() => {

            earthLoading.classList.add(
                "hidden"
            );

        }, 500);
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


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );


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
       POINTER DOWN
       ===================================================== */

    function pointerDown(event) {

        if (!earthReady) {
            return;
        }


        isDragging = true;


        previousPointerX =
            event.clientX;


        previousPointerY =
            event.clientY;


        rotationVelocityX = 0;

        rotationVelocityY = 0;
    }


    /* =====================================================
       POINTER MOVE
       ===================================================== */

    function pointerMove(event) {

        if (
            !isDragging ||
            !earthGroup
        ) {
            return;
        }


        const deltaX =
            event.clientX -
            previousPointerX;


        const deltaY =
            event.clientY -
            previousPointerY;


        previousPointerX =
            event.clientX;


        previousPointerY =
            event.clientY;


        /*
         * Horizontal rotation.
         */

        earthGroup.rotation.y +=
            deltaX * 0.004;


        /*
         * Vertical rotation.
         */

        targetRotationX +=
            deltaY * 0.0025;


        targetRotationX =
            THREE.MathUtils.clamp(
                targetRotationX,
                -0.75,
                0.75
            );


        rotationVelocityY =
            deltaX * 0.002;


        rotationVelocityX =
            deltaY * 0.0015;
    }


    /* =====================================================
       POINTER UP
       ===================================================== */

    function pointerUp() {

        isDragging = false;
    }


    rendererPointerEvents();


    function rendererPointerEvents() {

        document.addEventListener(
            "pointerdown",
            pointerDown,
            {
                passive: true
            }
        );


        document.addEventListener(
            "pointermove",
            pointerMove,
            {
                passive: true
            }
        );


        document.addEventListener(
            "pointerup",
            pointerUp,
            {
                passive: true
            }
        );


        document.addEventListener(
            "pointercancel",
            pointerUp,
            {
                passive: true
            }
        );
    }


    /* =====================================================
       WHEEL ZOOM
       ===================================================== */

    document.addEventListener(
        "wheel",
        (event) => {

            if (
                !earthScene ||
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
                    CAMERA_MIN_DISTANCE,
                    CAMERA_MAX_DISTANCE
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH PINCH
       ===================================================== */

    let initialPinchDistance = null;


    document.addEventListener(
        "touchstart",
        (event) => {

            if (
                event.touches.length !== 2
            ) {
                return;
            }


            const first =
                event.touches[0];


            const second =
                event.touches[1];


            initialPinchDistance =
                Math.hypot(
                    first.clientX -
                    second.clientX,

                    first.clientY -
                    second.clientY
                );
        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchmove",
        (event) => {

            if (
                event.touches.length !== 2 ||
                initialPinchDistance === null
            ) {
                return;
            }


            const first =
                event.touches[0];


            const second =
                event.touches[1];


            const currentDistance =
                Math.hypot(
                    first.clientX -
                    second.clientX,

                    first.clientY -
                    second.clientY
                );


            const difference =
                currentDistance -
                initialPinchDistance;


            currentZoom -=
                difference * 0.008;


            currentZoom =
                THREE.MathUtils.clamp(
                    currentZoom,
                    CAMERA_MIN_DISTANCE,
                    CAMERA_MAX_DISTANCE
                );


            initialPinchDistance =
                currentDistance;

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchend",
        () => {

            initialPinchDistance =
                null;

        },
        {
            passive: true
        }
    );


    /* =====================================================
       CAMERA ANIMATION
       ===================================================== */

    function animateCameraTo(
        targetDistance,
        duration = 2200
    ) {

        const startDistance =
            currentZoom;


        const startTime =
            performance.now();


        cameraAnimation = {
            startDistance,
            targetDistance,
            duration,
            startTime
        };
    }


    /* =====================================================
       UPDATE CAMERA
       ===================================================== */

    function updateCamera(
        currentTime
    ) {

        if (
            !cameraAnimation ||
            !camera
        ) {
            return;
        }


        const elapsed =
            currentTime -
            cameraAnimation.startTime;


        let progress =
            elapsed /
            cameraAnimation.duration;


        progress =
            THREE.MathUtils.clamp(
                progress,
                0,
                1
            );


        /*
         * Smooth easing.
         */

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        currentZoom =
            THREE.MathUtils.lerp(
                cameraAnimation.startDistance,
                cameraAnimation.targetDistance,
                eased
            );


        if (progress >= 1) {

            cameraAnimation = null;
        }
    }


    /* =====================================================
       UPDATE ROTATION
       ===================================================== */

    function updateRotation() {

        if (!earthGroup) {
            return;
        }


        /*
         * Automatic slow rotation before journey.
         */

        if (
            !isDragging &&
            !journeyStarted
        ) {

            earthGroup.rotation.y +=
                0.0007;
        }


        /*
         * Momentum after dragging.
         */

        if (
            !isDragging &&
            journeyStarted === false
        ) {

            earthGroup.rotation.y +=
                rotationVelocityY;


            targetRotationX +=
                rotationVelocityX;


            rotationVelocityY *=
                0.94;


            rotationVelocityX *=
                0.94;
        }


        /*
         * Smooth vertical rotation.
         */

        earthGroup.rotation.x +=
            (
                targetRotationX -
                earthGroup.rotation.x
            ) * 0.08;
    }


    /* =====================================================
       UPDATE CAMERA POSITION
       ===================================================== */

    function updateCameraPosition() {

        if (!camera) {
            return;
        }


        /*
         * Keep camera slightly above
         * the equator for cinematic view.
         */

        const vertical =
            0.7;


        camera.position.set(
            0,
            vertical,
            currentZoom
        );


        camera.lookAt(
            0,
            0,
            0
        );
    }


    /* =====================================================
       ANIMATE MARKERS
       ===================================================== */

    function animateMarkers(
        time
    ) {

        const pulse =
            1 +
            Math.sin(
                time * 0.003
            ) * 0.15;


        if (egyptMarker) {

            egyptMarker.scale.set(
                pulse,
                pulse,
                pulse
            );
        }


        if (hondurasMarker) {

            hondurasMarker.scale.set(
                pulse,
                pulse,
                pulse
            );
        }
    }


    /* =====================================================
       ANIMATE
       ===================================================== */

    function animate(
        currentTime = performance.now()
    ) {

        animationFrame =
            requestAnimationFrame(
                animate
            );


        updateCamera(
            currentTime
        );


        updateRotation();


        updateCameraPosition();


        animateMarkers(
            currentTime
        );


        if (stars) {

            stars.rotation.y +=
                0.00003;
        }


        if (renderer && scene && camera) {

            renderer.render(
                scene,
                camera
            );
        }
    }


    /* =====================================================
       START ROUTE
       ===================================================== */

    function startRouteAnimation() {

        if (
            !routeLine ||
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


        /*
         * Start at Egypt.
         */

        travelPoint.position.copy(
            points[0]
        );


        /*
         * Empty geometry initially.
         */

        routeLine.geometry =
            new THREE.BufferGeometry()
                .setFromPoints([
                    points[0]
                ]);


        routeGlow.geometry =
            new THREE.BufferGeometry()
                .setFromPoints([
                    points[0]
                ]);


        const duration =
            8500;


        const startTime =
            performance.now();


        function animateRoute(
            currentTime
        ) {

            const elapsed =
                currentTime -
                startTime;


            let progress =
                elapsed /
                duration;


            progress =
                THREE.MathUtils.clamp(
                    progress,
                    0,
                    1
                );


            /*
             * Cinematic easing.
             */

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


            const currentPoint =
                points[index];


            if (currentPoint) {

                travelPoint.position.copy(
                    currentPoint
                );
            }


            /*
             * Update story.
             */

            if (
                storyText &&
                progress < 0.35
            ) {

                storyText.textContent =
                    "Un camino comienza a cruzar el mundo...";
            }


            if (
                storyText &&
                progress >= 0.35 &&
                progress < 0.75
            ) {

                storyText.textContent =
                    "Miles de kilómetros entre dos corazones...";
            }


            if (
                storyText &&
                progress >= 0.75
            ) {

                storyText.textContent =
                    "Y aun así, el mundo parece un poco más pequeño.";
            }


            if (progress < 1) {

                requestAnimationFrame(
                    animateRoute
                );

            } else {

                finishRoute();
            }
        }


        requestAnimationFrame(
            animateRoute
        );
    }


    /* =====================================================
       FINISH ROUTE
       ===================================================== */

    function finishRoute() {

        journeyFinished =
            true;


        if (travelPoint) {

            travelPoint.visible =
                false;
        }


        if (storyText) {

            storyText.textContent =
                "Finalmente... el camino llega hasta Honduras.";
        }


        /*
         * Slow cinematic zoom.
         */

        animateCameraTo(
            8.5,
            2200
        );


        setTimeout(() => {

            if (!travelButton) {
                return;
            }


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

        }, 2500);
    }


    /* =====================================================
       START JOURNEY
       ===================================================== */

    if (startJourneyButton) {

        startJourneyButton.addEventListener(
            "click",
            () => {

                showScene(
                    earthScene
                );


                /*
                 * Initialize only once.
                 */

                if (!earthReady) {

                    setTimeout(() => {

                        initializeThree();

                    }, 100);

                } else {

                    handleResize();
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
                    journeyStarted ||
                    !earthReady
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


                /*
                 * Pull camera back first.
                 */

                animateCameraTo(
                    12,
                    1800
                );


                /*
                 * Slightly rotate the Earth.
                 */

                if (earthGroup) {

                    earthGroup.rotation.y +=
                        0.25;
                }


                /*
                 * Start the route.
                 */

                setTimeout(() => {

                    startRouteAnimation();

                }, 1800);

            }
        );
    }


    /* =====================================================
       DOUBLE CLICK
       ===================================================== */

    document.addEventListener(
        "dblclick",
        (event) => {

            if (
                !earthScene ||
                !earthScene.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            currentZoom =
                THREE.MathUtils.clamp(
                    currentZoom - 1.5,
                    CAMERA_MIN_DISTANCE,
                    CAMERA_MAX_DISTANCE
                );
        }
    );


    /* =====================================================
       INITIAL SCENE
       ===================================================== */

    showScene(
        introScene
    );


    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            if (animationFrame) {

                cancelAnimationFrame(
                    animationFrame
                );
            }

        }
    );

});
