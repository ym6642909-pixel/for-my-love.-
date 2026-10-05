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
        lat: 26.8206,
        lng: 30.8025
    };

    const honduras = {
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

        const R = 6371;

        const dLat =
            (lat2 - lat1) *
            Math.PI / 180;

        const dLon =
            (lon2 - lon1) *
            Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(
                lat1 * Math.PI / 180
            ) *
            Math.cos(
                lat2 * Math.PI / 180
            ) *
            Math.sin(dLon / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
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
       CANVAS
       ===================================================== */

    if (!earthContainer) {
        return;
    }


    const canvas =
        document.createElement("canvas");


    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";


    earthContainer.innerHTML = "";


    earthContainer.appendChild(
        canvas
    );


    const ctx =
        canvas.getContext("2d");


    if (!ctx) {

        if (earthLoading) {

            earthLoading.innerHTML =
                "<span>No se pudo iniciar el mundo 3D.</span>";
        }

        return;
    }


    /* =====================================================
       CANVAS SIZE
       ===================================================== */

    let width = 0;
    let height = 0;

    let pixelRatio = 1;


    function resize() {

        width =
            earthContainer.clientWidth;

        height =
            earthContainer.clientHeight;


        pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            width * pixelRatio;

        canvas.height =
            height * pixelRatio;


        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";


        ctx.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
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

    let rotation = -0.55;

    let targetRotation = -0.55;

    let zoom = 1;

    let targetZoom = 1;


    let dragging = false;

    let lastX = 0;


    let routeProgress = 0;

    let routeStarted = false;

    let routeFinished = false;


    /* =====================================================
       PROJECT LAT/LNG TO GLOBE
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


        const relativeLng =
            (
                lng *
                Math.PI /
                180
            ) +
            rotation;


        const x =
            Math.cos(latRad) *
            Math.sin(relativeLng);


        const y =
            Math.sin(latRad);


        const z =
            Math.cos(latRad) *
            Math.cos(relativeLng);


        return {
            x: x * radius,
            y: y * radius,
            z: z
        };
    }


    /* =====================================================
       GREAT CIRCLE
       ===================================================== */

    function createRoutePoints() {

        const points = [];

        const lat1 =
            egypt.lat *
            Math.PI /
            180;

        const lon1 =
            egypt.lng *
            Math.PI /
            180;

        const lat2 =
            honduras.lat *
            Math.PI /
            180;

        const lon2 =
            honduras.lng *
            Math.PI /
            180;


        function vector(
            lat,
            lon
        ) {

            return {

                x:
                    Math.cos(lat) *
                    Math.cos(lon),

                y:
                    Math.sin(lat),

                z:
                    Math.cos(lat) *
                    Math.sin(lon)
            };
        }


        const a =
            vector(
                lat1,
                lon1
            );


        const b =
            vector(
                lat2,
                lon2
            );


        const dot =
            Math.max(
                -1,
                Math.min(
                    1,
                    a.x * b.x +
                    a.y * b.y +
                    a.z * b.z
                )
            );


        const angle =
            Math.acos(dot);


        for (
            let i = 0;
            i <= 160;
            i++
        ) {

            const t =
                i / 160;


            const sinAngle =
                Math.sin(angle);


            const A =
                Math.sin(
                    (1 - t) *
                    angle
                ) /
                sinAngle;


            const B =
                Math.sin(
                    t *
                    angle
                ) /
                sinAngle;


            let x =
                A * a.x +
                B * b.x;


            let y =
                A * a.y +
                B * b.y;


            let z =
                A * a.z +
                B * b.z;


            const length =
                Math.sqrt(
                    x * x +
                    y * y +
                    z * z
                );


            x /= length;
            y /= length;
            z /= length;


            const lat =
                Math.asin(y);


            const lon =
                Math.atan2(
                    z,
                    x
                );


            points.push({
                lat:
                    lat *
                    180 /
                    Math.PI,

                lng:
                    lon *
                    180 /
                    Math.PI
            });
        }


        return points;
    }


    const routePoints =
        createRoutePoints();


    /* =====================================================
       DRAW BACKGROUND
       ===================================================== */

    function drawBackground() {

        const gradient =
            ctx.createRadialGradient(
                width / 2,
                height / 2,
                0,
                width / 2,
                height / 2,
                Math.max(width, height)
            );


        gradient.addColorStop(
            0,
            "#071426"
        );


        gradient.addColorStop(
            0.5,
            "#020712"
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

    const stars = [];


    for (
        let i = 0;
        i < 180;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                width,

            y:
                Math.random() *
                height,

            size:
                Math.random() *
                1.5 +
                0.3,

            opacity:
                Math.random() *
                0.6 +
                0.2
        });
    }


    function drawStars() {

        stars.forEach(
            star => {

                ctx.beginPath();

                ctx.arc(
                    star.x,
                    star.y,
                    star.size,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(255,255,255,${star.opacity})`;


                ctx.fill();
            }
        );
    }


    /* =====================================================
       DRAW EARTH
       ===================================================== */

    function drawEarth() {

        const radius =
            Math.min(
                width,
                height
            ) *
            0.36 *
            zoom;


        const centerX =
            width / 2;


        const centerY =
            height / 2;


        /* =========================
           ATMOSPHERE
           ========================= */

        const atmosphere =
            ctx.createRadialGradient(
                centerX,
                centerY,
                radius * 0.85,
                centerX,
                centerY,
                radius * 1.25
            );


        atmosphere.addColorStop(
            0,
            "rgba(30,100,190,0)"
        );


        atmosphere.addColorStop(
            0.75,
            "rgba(70,160,255,0.16)"
        );


        atmosphere.addColorStop(
            1,
            "rgba(60,140,255,0)"
        );


        ctx.beginPath();


        ctx.arc(
            centerX,
            centerY,
            radius * 1.18,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            atmosphere;


        ctx.fill();


        /* =========================
           EARTH
           ========================= */

        const earthGradient =
            ctx.createRadialGradient(
                centerX -
                radius * 0.35,
                centerY -
                radius * 0.35,
                radius * 0.1,

                centerX,
                centerY,
                radius
            );


        earthGradient.addColorStop(
            0,
            "#58a9d8"
        );


        earthGradient.addColorStop(
            0.35,
            "#176aa3"
        );


        earthGradient.addColorStop(
            0.72,
            "#073c68"
        );


        earthGradient.addColorStop(
            1,
            "#020d1c"
        );


        ctx.beginPath();


        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            earthGradient;


        ctx.fill();


        /* =========================
           CONTINENTS — STYLIZED
           ========================= */

        drawContinents(
            centerX,
            centerY,
            radius
        );


        /* =========================
           EARTH EDGE
           ========================= */

        ctx.beginPath();


        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "rgba(100,190,255,0.45)";


        ctx.lineWidth =
            1.5;


        ctx.stroke();
    }


    /* =====================================================
       STYLIZED CONTINENTS
       ===================================================== */

    function drawContinents(
        cx,
        cy,
        radius
    ) {

        const continents = [

            [
                [-20, 40],
                [5, 45],
                [20, 30],
                [15, 10],
                [0, -5],
                [-15, 5],
                [-25, 25]
            ],

            [
                [-75, 25],
                [-55, 35],
                [-40, 20],
                [-48, -5],
                [-60, -25],
                [-70, -45],
                [-80, -20]
            ],

            [
                [20, 55],
                [40, 45],
                [55, 30],
                [48, 10],
                [35, 0],
                [20, 10]
            ],

            [
                [5, -5],
                [25, -10],
                [40, -25],
                [35, -45],
                [15, -55],
                [0, -35]
            ],

            [
                [80, 40],
                [110, 45],
                [140, 30],
                [150, 10],
                [130, 0],
                [100, 15]
            ]
        ];


        continents.forEach(
            continent => {

                ctx.beginPath();


                continent.forEach(
                    (point, index) => {

                        const lat =
                            point[1] *
                            Math.PI /
                            180;


                        const lon =
                            point[0] *
                            Math.PI /
                            180 +
                            rotation;


                        const x =
                            Math.cos(lat) *
                            Math.sin(lon);


                        const y =
                            Math.sin(lat);


                        const z =
                            Math.cos(lat) *
                            Math.cos(lon);


                        if (z <= 0) {
                            return;
                        }


                        const screenX =
                            cx +
                            x *
                            radius;


                        const screenY =
                            cy -
                            y *
                            radius;


                        if (index === 0) {

                            ctx.moveTo(
                                screenX,
                                screenY
                            );

                        } else {

                            ctx.lineTo(
                                screenX,
                                screenY
                            );
                        }
                    }
                );


                ctx.closePath();


                ctx.fillStyle =
                    "rgba(75,150,85,0.7)";


                ctx.fill();
            }
        );
    }


    /* =====================================================
       DRAW COUNTRY MARKER
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
                radius
            );


        if (p.z <= 0) {
            return;
        }


        const x =
            cx + p.x;


        const y =
            cy - p.y;


        const pulse =
            4 +
            Math.sin(
                performance.now() *
                0.004
            ) *
            1.5;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            pulse,
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
            "600 11px Arial";


        ctx.fillStyle =
            "rgba(255,255,255,0.9)";


        ctx.textAlign =
            "center";


        ctx.fillText(
            label,
            x,
            y - 12
        );
    }


    /* =====================================================
       DRAW ROUTE
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
                    radius * 1.01
                );


            if (p.z <= 0) {
                continue;
            }


            const x =
                cx + p.x;


            const y =
                cy - p.y;


            if (i === 0) {

                ctx.moveTo(
                    x,
                    y
                );

            } else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }


        ctx.strokeStyle =
            "#ffffff";


        ctx.lineWidth =
            2;


        ctx.shadowBlur =
            10;


        ctx.shadowColor =
            "#ffffff";


        ctx.stroke();


        ctx.shadowBlur =
            0;


        if (
            count <
            routePoints.length
        ) {

            const point =
                routePoints[
                    count - 1
                ];


            const p =
                project(
                    point.lat,
                    point.lng,
                    radius * 1.02
                );


            if (p.z > 0) {

                const x =
                    cx + p.x;


                const y =
                    cy - p.y;


                ctx.beginPath();


                ctx.arc(
                    x,
                    y,
                    6,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "#ffffff";


                ctx.fill();
            }
        }
    }


    /* =====================================================
       MAIN DRAW
       ===================================================== */

    function draw() {

        drawBackground();

        drawStars();


        rotation +=
            (
                targetRotation -
                rotation
            ) * 0.08;


        zoom +=
            (
                targetZoom -
                zoom
            ) * 0.08;


        const radius =
            Math.min(
                width,
                height
            ) *
            0.36 *
            zoom;


        const cx =
            width / 2;


        const cy =
            height / 2;


        drawEarth();


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
            "EGIPTO"
        );


        drawMarker(
            honduras,
            radius,
            cx,
            cy,
            "HONDURAS"
        );


        requestAnimationFrame(
            draw
        );
    }


    draw();


    /* =====================================================
       HIDE LOADING
       ===================================================== */

    setTimeout(
        () => {

            if (earthLoading) {

                earthLoading.classList.add(
                    "hidden"
                );
            }

        },
        700
    );


    /* =====================================================
       DRAG
       ===================================================== */

    earthContainer.addEventListener(
        "pointerdown",
        event => {

            dragging = true;

            lastX =
                event.clientX;
        }
    );


    earthContainer.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {
                return;
            }


            const delta =
                event.clientX -
                lastX;


            lastX =
                event.clientX;


            targetRotation +=
                delta *
                0.008;
        }
    );


    earthContainer.addEventListener(
        "pointerup",
        () => {

            dragging = false;
        }
    );


    earthContainer.addEventListener(
        "pointercancel",
        () => {

            dragging = false;
        }
    );


    /* =====================================================
       ZOOM
       ===================================================== */

    earthContainer.addEventListener(
        "wheel",
        event => {

            targetZoom +=
                event.deltaY *
                -0.001;


            targetZoom =
                Math.max(
                    0.7,
                    Math.min(
                        1.5,
                        targetZoom
                    )
                );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       ROUTE BUTTON
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


                const startTime =
                    performance.now();


                const duration =
                    8000;


                function animateRoute(
                    time
                ) {

                    const progress =
                        Math.min(
                            (
                                time -
                                startTime
                            ) /
                            duration,
                            1
                        );


                    routeProgress =
                        progress;


                    if (progress < 0.35) {

                        storyText.textContent =
                            "Un camino comienza a cruzar el mundo...";

                    } else if (
                        progress < 0.75
                    ) {

                        storyText.textContent =
                            "Miles de kilómetros entre dos corazones...";

                    } else {

                        storyText.textContent =
                            "Y aun así, el mundo parece un poco más pequeño.";
                    }


                    if (progress < 1) {

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


        travelButton.disabled =
            false;


        travelButton.textContent =
            "Continuar";


        storyText.textContent =
            "Finalmente... el camino llega hasta Honduras.";


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
