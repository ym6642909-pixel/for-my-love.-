document.addEventListener("DOMContentLoaded", () => {

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


    /* =====================================================
       COUNTRY DATA
       ===================================================== */

    const egypt = {
        name: "EGIPTO",
        lat: 26.8206,
        lng: 30.8025
    };

    const honduras = {
        name: "HONDURAS",
        lat: 14.0723,
        lng: -86.2419
    };


    /* =====================================================
       DISTANCE
       ===================================================== */

    function haversine(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const R = 6371;

        const p1 =
            lat1 * Math.PI / 180;

        const p2 =
            lat2 * Math.PI / 180;

        const dp =
            (lat2 - lat1) *
            Math.PI / 180;

        const dl =
            (lon2 - lon1) *
            Math.PI / 180;

        const a =
            Math.sin(dp / 2) ** 2 +
            Math.cos(p1) *
            Math.cos(p2) *
            Math.sin(dl / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
    }


    const distance =
        haversine(
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


    /* =====================================================
       CANVAS
       ===================================================== */

    if (!earthContainer) {
        return;
    }


    const canvas =
        document.createElement("canvas");


    earthContainer.innerHTML = "";


    earthContainer.appendChild(
        canvas
    );


    const ctx =
        canvas.getContext("2d");


    if (!ctx) {
        return;
    }


    let width = 0;
    let height = 0;
    let dpr = 1;


    function resize() {

        width =
            earthContainer.clientWidth;

        height =
            earthContainer.clientHeight;


        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            width * dpr;

        canvas.height =
            height * dpr;


        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }


    resize();


    window.addEventListener(
        "resize",
        resize
    );


    /* =====================================================
       EARTH STATE
       ===================================================== */

    let rotation =
        -0.55;

    let targetRotation =
        -0.55;

    let verticalRotation =
        -0.12;

    let targetVerticalRotation =
        -0.12;


    let zoom = 1;

    let targetZoom = 1;


    let dragging = false;

    let lastX = 0;
    let lastY = 0;


    let routeStarted = false;

    let routeProgress = 0;

    let routeFinished = false;


    let cameraFocus = 0;


    /* =====================================================
       STARS
       ===================================================== */

    const stars = [];


    for (
        let i = 0;
        i < 420;
        i++
    ) {

        stars.push({

            x:
                Math.random(),

            y:
                Math.random(),

            size:
                Math.random() *
                1.5 +
                0.2,

            alpha:
                Math.random() *
                0.7 +
                0.15,

            twinkle:
                Math.random() *
                0.03
        });
    }


    /* =====================================================
       CLOUDS
       ===================================================== */

    const clouds = [];


    for (
        let i = 0;
        i < 85;
        i++
    ) {

        clouds.push({

            lat:
                -70 +
                Math.random() * 140,

            lng:
                -180 +
                Math.random() * 360,

            size:
                0.012 +
                Math.random() * 0.035,

            speed:
                0.0002 +
                Math.random() * 0.0005,

            phase:
                Math.random() * Math.PI * 2
        });
    }


    /* =====================================================
       ROUTE
       ===================================================== */

    function createRoute() {

        const points = [];


        for (
            let i = 0;
            i <= 180;
            i++
        ) {

            const t =
                i / 180;


            const lat =
                egypt.lat +
                (
                    honduras.lat -
                    egypt.lat
                ) *
                t;


            let longitudeDifference =
                honduras.lng -
                egypt.lng;


            if (
                longitudeDifference >
                180
            ) {

                longitudeDifference -=
                    360;
            }


            if (
                longitudeDifference <
                -180
            ) {

                longitudeDifference +=
                    360;
            }


            const lng =
                egypt.lng +
                longitudeDifference *
                t;


            const curve =
                Math.sin(
                    t * Math.PI
                ) *
                18;


            points.push({

                lat:
                    lat + curve,

                lng:
                    lng
            });
        }


        return points;
    }


    const routePoints =
        createRoute();


    /* =====================================================
       PROJECT LAT/LNG
       ===================================================== */

    function project(
        lat,
        lng,
        radius
    ) {

        const latRad =
            lat *
            Math.PI /
            180;


        const lngRad =
            lng *
            Math.PI /
            180 +
            rotation;


        const vertical =
            Math.cos(
                verticalRotation
            );


        const x =
            Math.cos(latRad) *
            Math.sin(lngRad);


        const y =
            Math.sin(latRad) *
            vertical;


        const z =
            Math.cos(latRad) *
            Math.cos(lngRad);


        return {

            x:
                x * radius,

            y:
                y * radius,

            z
        };
    }


    /* =====================================================
       BACKGROUND
       ===================================================== */

    function drawBackground() {

        const gradient =
            ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                Math.max(
                    width,
                    height
                )
            );


        gradient.addColorStop(
            0,
            "#081a31"
        );


        gradient.addColorStop(
            0.45,
            "#020914"
        );


        gradient.addColorStop(
            1,
            "#000000"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );
    }


    /* =====================================================
       STARS
       ===================================================== */

    function drawStars(time) {

        stars.forEach(
            star => {

                const alpha =
                    star.alpha +
                    Math.sin(
                        time *
                        star.twinkle
                    ) *
                    0.12;


                ctx.beginPath();


                ctx.arc(
                    star.x * width,
                    star.y * height,
                    star.size,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(255,255,255,${Math.max(
                        0.05,
                        alpha
                    )})`;


                ctx.fill();
            }
        );
    }


    /* =====================================================
       EARTH ATMOSPHERE
       ===================================================== */

    function drawAtmosphere(
        cx,
        cy,
        radius
    ) {

        const glow =
            ctx.createRadialGradient(
                cx,
                cy,
                radius * 0.82,
                cx,
                cy,
                radius * 1.25
            );


        glow.addColorStop(
            0,
            "rgba(0,0,0,0)"
        );


        glow.addColorStop(
            0.75,
            "rgba(60,160,255,0.18)"
        );


        glow.addColorStop(
            0.9,
            "rgba(60,150,255,0.08)"
        );


        glow.addColorStop(
            1,
            "rgba(60,150,255,0)"
        );


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius * 1.22,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            glow;


        ctx.fill();
    }


    /* =====================================================
       EARTH BASE
       ===================================================== */

    function drawEarthBase(
        cx,
        cy,
        radius
    ) {

        const earth =
            ctx.createRadialGradient(

                cx -
                radius * 0.35,

                cy -
                radius * 0.4,

                radius * 0.05,

                cx,
                cy,
                radius
            );


        earth.addColorStop(
            0,
            "#65b5dc"
        );


        earth.addColorStop(
            0.25,
            "#1d78aa"
        );


        earth.addColorStop(
            0.6,
            "#07507d"
        );


        earth.addColorStop(
            0.85,
            "#032e52"
        );


        earth.addColorStop(
            1,
            "#011323"
        );


        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            earth;


        ctx.fill();
    }


    /* =====================================================
       CONTINENT SHAPES
       ===================================================== */

    const continentShapes = [

        [
            [-170, 65],
            [-130, 70],
            [-110, 55],
            [-100, 40],
            [-120, 25],
            [-105, 10],
            [-120, 5],
            [-145, 25],
            [-160, 45]
        ],

        [
            [-80, 10],
            [-60, 15],
            [-45, 5],
            [-50, -15],
            [-60, -35],
            [-72, -55],
            [-80, -30]
        ],

        [
            [-15, 37],
            [0, 48],
            [25, 60],
            [55, 55],
            [80, 45],
            [110, 30],
            [125, 10],
            [100, 0],
            [70, 5],
            [40, 0],
            [20, 10],
            [5, 20]
        ],

        [
            [15, 5],
            [35, 10],
            [48, -10],
            [40, -30],
            [25, -50],
            [5, -35],
            [-5, -10]
        ],

        [
            [115, 0],
            [140, -10],
            [155, -30],
            [145, -45],
            [120, -35],
            [110, -15]
        ]
    ];


    function drawContinents(
        cx,
        cy,
        radius
    ) {

        continentShapes.forEach(
            shape => {

                ctx.beginPath();

                let started =
                    false;


                shape.forEach(
                    point => {

                        const p =
                            project(
                                point[1],
                                point[0],
                                radius
                            );


                        if (p.z < 0) {
                            return;
                        }


                        const x =
                            cx + p.x;


                        const y =
                            cy - p.y;


                        if (!started) {

                            ctx.moveTo(
                                x,
                                y
                            );

                            started = true;

                        } else {

                            ctx.lineTo(
                                x,
                                y
                            );
                        }
                    }
                );


                if (!started) {
                    return;
                }


                ctx.closePath();


                const land =
                    ctx.createLinearGradient(
                        cx - radius,
                        cy - radius,
                        cx + radius,
                        cy + radius
                    );


                land.addColorStop(
                    0,
                    "rgba(104,174,105,0.95)"
                );


                land.addColorStop(
                    0.5,
                    "rgba(52,128,72,0.88)"
                );


                land.addColorStop(
                    1,
                    "rgba(25,83,48,0.8)"
                );


                ctx.fillStyle =
                    land;


                ctx.fill();
            }
        );
    }


    /* =====================================================
       CLOUDS
       ===================================================== */

    function drawClouds(
        cx,
        cy,
        radius,
        time
    ) {

        clouds.forEach(
            cloud => {

                const longitude =
                    cloud.lng +
                    time *
                    cloud.speed;


                const p =
                    project(
                        cloud.lat,
                        longitude,
                        radius *
                        1.012
                    );


                if (p.z < 0.08) {
                    return;
                }


                const x =
                    cx + p.x;


                const y =
                    cy - p.y;


                const size =
                    radius *
                    cloud.size;


                ctx.beginPath();


                ctx.ellipse(
                    x,
                    y,
                    size * 1.8,
                    size,
                    0,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "rgba(255,255,255,0.08)";


                ctx.fill();
            }
        );
    }


    /* =====================================================
       NIGHT LIGHTS
       ===================================================== */

    function drawNightLights(
        cx,
        cy,
        radius
    ) {

        const cities = [

            [30, 31],
            [31, 30],
            [40, 29],
            [51, 25],
            [29, 41],
            [77, 28],
            [139, 35],
            [116, 40],
            [-74, 40],
            [-118, 34],
            [-99, 19],
            [-84, 10],
            [-78, 15]
        ];


        cities.forEach(
            city => {

                const p =
                    project(
                        city[1],
                        city[0],
                        radius *
                        1.002
                    );


                if (p.z < 0.25) {
                    return;
                }


                const x =
                    cx + p.x;


                const y =
                    cy - p.y;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,
                    1.5,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "rgba(255,190,70,0.75)";


                ctx.shadowBlur =
                    5;


                ctx.shadowColor =
                    "rgba(255,160,40,0.8)";


                ctx.fill();


                ctx.shadowBlur =
                    0;
            }
        );
    }


    /* =====================================================
       MARKER
       ===================================================== */

    function drawMarker(
        location,
        radius,
        cx,
        cy,
        label
    ) {

        const p =
            project(
                location.lat,
                location.lng,
                radius * 1.025
            );


        if (p.z < 0) {
            return;
        }


        const x =
            cx + p.x;


        const y =
            cy - p.y;


        const pulse =
            5 +
            Math.sin(
                performance.now() *
                0.005
            ) *
            2;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            pulse,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.18)";


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            3,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.shadowBlur =
            15;


        ctx.shadowColor =
            "#ffffff";


        ctx.fill();


        ctx.shadowBlur =
            0;


        ctx.font =
            "600 10px Arial";


        ctx.textAlign =
            "center";


        ctx.fillStyle =
            "rgba(255,255,255,0.9)";


        ctx.fillText(
            label,
            x,
            y - 12
        );
    }


    /* =====================================================
       ROUTE
       ===================================================== */

    function drawRoute(
        radius,
        cx,
        cy
    ) {

        if (!routeStarted) {
            return;
        }


        const count =
            Math.max(
                2,
                Math.floor(
                    routePoints.length *
                    routeProgress
                )
            );


        ctx.beginPath();


        let started =
            false;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const point =
                routePoints[i];


            const p =
                project(
                    point.lat,
                    point.lng,
                    radius * 1.035
                );


            if (p.z < 0) {
                continue;
            }


            const x =
                cx + p.x;


            const y =
                cy - p.y;


            if (!started) {

                ctx.moveTo(
                    x,
                    y
                );

                started = true;

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }


        if (!started) {
            return;
        }


        ctx.lineWidth =
            5;


        ctx.strokeStyle =
            "rgba(70,170,255,0.2)";


        ctx.shadowBlur =
            18;


        ctx.shadowColor =
            "rgba(70,170,255,0.8)";


        ctx.stroke();


        ctx.lineWidth =
            2;


        ctx.strokeStyle =
            "#ffffff";


        ctx.shadowBlur =
            8;


        ctx.stroke();


        ctx.shadowBlur =
            0;
    }


    /* =====================================================
       EARTH EDGE
       ===================================================== */

    function drawEarthEdge(
        cx,
        cy,
        radius
    ) {

        ctx.beginPath();


        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(110,200,255,0.45)";


        ctx.lineWidth =
            1.5;


        ctx.stroke();
    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render(
        time
    ) {

        drawBackground(
            time
        );


        drawStars(
            time
        );


        rotation +=
            (
                targetRotation -
                rotation
            ) *
            0.06;


        verticalRotation +=
            (
                targetVerticalRotation -
                verticalRotation
            ) *
            0.06;


        zoom +=
            (
                targetZoom -
                zoom
            ) *
            0.06;


        const radius =
            Math.min(
                width,
                height
            ) *
            0.37 *
            zoom;


        const cx =
            width / 2;


        const cy =
            height / 2 -
            15;


        drawAtmosphere(
            cx,
            cy,
            radius
        );


        drawEarthBase(
            cx,
            cy,
            radius
        );


        drawContinents(
            cx,
            cy,
            radius
        );


        drawNightLights(
            cx,
            cy,
            radius
        );


        drawClouds(
            cx,
            cy,
            radius,
            time
        );


        drawRoute(
            radius,
            cx,
            cy
        );


        drawMarker(
            egypt,
            radius,
            cx,
            cy,
            egypt.name
        );


        drawMarker(
            honduras,
            radius,
            cx,
            cy,
            honduras.name
        );


        drawEarthEdge(
            cx,
            cy,
            radius
        );


        requestAnimationFrame(
            render
        );
    }


    requestAnimationFrame(
        render
    );


    /* =====================================================
       LOADING
       ===================================================== */

    setTimeout(
        () => {

            if (earthLoading) {

                earthLoading.classList.add(
                    "hidden"
                );
            }

        },
        900
    );


    /* =====================================================
       DRAG
       ===================================================== */

    earthContainer.addEventListener(
        "pointerdown",
        event => {

            dragging =
                true;


            lastX =
                event.clientX;


            lastY =
                event.clientY;
        }
    );


    earthContainer.addEventListener(
        "pointermove",
        event => {

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


            targetRotation +=
                dx *
                0.007;


            targetVerticalRotation +=
                dy *
                0.004;


            targetVerticalRotation =
                Math.max(
                    -0.65,
                    Math.min(
                        0.65,
                        targetVerticalRotation
                    )
                );
        }
    );


    earthContainer.addEventListener(
        "pointerup",
        () => {

            dragging =
                false;
        }
    );


    earthContainer.addEventListener(
        "pointercancel",
        () => {

            dragging =
                false;
        }
    );


    earthContainer.addEventListener(
        "pointerleave",
        () => {

            dragging =
                false;
        }
    );


    /* =====================================================
       WHEEL ZOOM
       ===================================================== */

    earthContainer.addEventListener(
        "wheel",
        event => {

            targetZoom +=
                event.deltaY *
                -0.001;


            targetZoom =
                Math.max(
                    0.75,
                    Math.min(
                        1.35,
                        targetZoom
                    )
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       TRAVEL
       ===================================================== */

    if (travelButton) {

        travelButton.addEventListener(
            "click",
            () => {

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
                        "El camino comienza a cruzar el mundo...";
                }


                const start =
                    performance.now();


                const duration =
                    8500;


                function animateRoute(
                    time
                ) {

                    const progress =
                        Math.min(
                            (
                                time -
                                start
                            ) /
                            duration,
                            1
                        );


                    routeProgress =
                        progress;


                    if (
                        progress < 0.3
                    ) {

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


                    /* Camera effect */

                    targetZoom =
                        1 +
                        progress *
                        0.15;


                    if (
                        progress < 1
                    ) {

                        requestAnimationFrame(
                            animateRoute
                        );

                    } else {

                        finishJourney();
                    }
                }


                requestAnimationFrame(
                    animateRoute
                );
            }
        );
    }


    /* =====================================================
       FINISH
       ===================================================== */

    function finishJourney() {

        routeFinished =
            true;


        if (storyText) {

            storyText.textContent =
                "Finalmente... el camino llega hasta Honduras.";
        }


        travelButton.disabled =
            false;


        travelButton.textContent =
            "Continuar";


        travelButton.onclick =
            () => {

                earthScene.classList.remove(
                    "active"
                );


                finalScene.classList.add(
                    "active"
                );
            };
    }

});
