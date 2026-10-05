/* =========================================================
   ENTRE DOS MUNDOS
   main.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const introScene = document.getElementById("intro");
    const mapScene = document.getElementById("mapScene");
    const finalScene = document.getElementById("finalScene");

    const startJourneyButton = document.getElementById("startJourney");
    const travelButton = document.getElementById("travelButton");

    const distanceElement = document.getElementById("distance");
    const storyText = document.getElementById("storyText");


    /* =====================================================
       LOCATIONS
       ===================================================== */

    // Punto representativo de Egipto
    const egypt = {
        name: "Egipto",
        lat: 26.8206,
        lng: 30.8025
    };

    // Punto representativo de Honduras
    const honduras = {
        name: "Honduras",
        lat: 14.0723,
        lng: -86.2419
    };


    /* =====================================================
       VARIABLES
       ===================================================== */

    let map = null;

    let egyptMarker = null;
    let hondurasMarker = null;

    let routeLine = null;
    let movingPoint = null;

    let journeyStarted = false;
    let animationFrame = null;

    let routePoints = [];

    let totalDistance = 0;


    /* =====================================================
       SCENE CONTROL
       ===================================================== */

    function showScene(scene) {

        if (!scene) return;

        document.querySelectorAll(".scene").forEach((currentScene) => {
            currentScene.classList.remove("active");
        });

        scene.classList.add("active");
    }


    /* =====================================================
       DISTANCE CALCULATION
       HAVERSINE FORMULA
       ===================================================== */

    function calculateDistance(lat1, lon1, lat2, lon2) {

        const earthRadius = 6371;

        const toRadians = (degrees) => {
            return degrees * Math.PI / 180;
        };

        const latitude1 = toRadians(lat1);
        const latitude2 = toRadians(lat2);

        const deltaLatitude = toRadians(lat2 - lat1);
        const deltaLongitude = toRadians(lon2 - lon1);

        const a =
            Math.sin(deltaLatitude / 2) ** 2 +
            Math.cos(latitude1) *
            Math.cos(latitude2) *
            Math.sin(deltaLongitude / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadius * c;
    }


    /* =====================================================
       DISTANCE FORMAT
       ===================================================== */

    function formatDistance(distance) {

        return Math.round(distance).toLocaleString("es-ES") + " km";
    }


    /* =====================================================
       GREAT CIRCLE ROUTE
       ===================================================== */

    function createGreatCircleRoute(start, end, steps = 180) {

        const points = [];

        const lat1 = start.lat * Math.PI / 180;
        const lon1 = start.lng * Math.PI / 180;

        const lat2 = end.lat * Math.PI / 180;
        const lon2 = end.lng * Math.PI / 180;


        /*
         * Convert geographic coordinates
         * into 3D Cartesian coordinates.
         */

        const x1 = Math.cos(lat1) * Math.cos(lon1);
        const y1 = Math.cos(lat1) * Math.sin(lon1);
        const z1 = Math.sin(lat1);

        const x2 = Math.cos(lat2) * Math.cos(lon2);
        const y2 = Math.cos(lat2) * Math.sin(lon2);
        const z2 = Math.sin(lat2);


        /*
         * Angular distance between the two points.
         */

        const dot =
            x1 * x2 +
            y1 * y2 +
            z1 * z2;

        const clampedDot = Math.max(
            -1,
            Math.min(1, dot)
        );

        const angle = Math.acos(clampedDot);


        /*
         * If both points are almost identical,
         * return a simple line.
         */

        if (angle < 0.000001) {

            for (let i = 0; i <= steps; i++) {

                const progress = i / steps;

                const lat =
                    start.lat +
                    (end.lat - start.lat) * progress;

                const lng =
                    start.lng +
                    (end.lng - start.lng) * progress;

                points.push([lat, lng]);
            }

            return points;
        }


        const sinAngle = Math.sin(angle);


        /*
         * Spherical Linear Interpolation
         * creates a real great-circle path.
         */

        for (let i = 0; i <= steps; i++) {

            const progress = i / steps;

            const a =
                Math.sin((1 - progress) * angle) /
                sinAngle;

            const b =
                Math.sin(progress * angle) /
                sinAngle;


            const x =
                a * x1 +
                b * x2;

            const y =
                a * y1 +
                b * y2;

            const z =
                a * z1 +
                b * z2;


            const latitude =
                Math.atan2(
                    z,
                    Math.sqrt(x * x + y * y)
                );

            const longitude =
                Math.atan2(y, x);


            points.push([
                latitude * 180 / Math.PI,
                longitude * 180 / Math.PI
            ]);
        }

        return points;
    }


    /* =====================================================
       CREATE CUSTOM MARKER
       ===================================================== */

    function createMarkerIcon() {

        return L.divIcon({

            className: "custom-country-marker",

            html: `
                <div class="country-marker">
                    <span></span>
                </div>
            `,

            iconSize: [24, 24],

            iconAnchor: [12, 12]
        });
    }


    /* =====================================================
       CREATE MAP
       ===================================================== */

    function createMap() {

        if (map) {

            setTimeout(() => {
                map.invalidateSize(true);
            }, 300);

            return;
        }


        /*
         * Create Leaflet map.
         */

        map = L.map("map", {

            zoomControl: true,

            minZoom: 2,

            maxZoom: 7,

            worldCopyJump: false,

            attributionControl: true,

            zoomSnap: 0.5,

            zoomDelta: 0.5
        });


        /* =================================================
           OPENSTREETMAP
           ================================================= */

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            }
        ).addTo(map);


        /* =================================================
           INITIAL VIEW
           ================================================= */

        map.setView(
            [22, -25],
            2
        );


        /* =================================================
           MARKER ICON
           ================================================= */

        const markerIcon = createMarkerIcon();


        /* =================================================
           EGYPT MARKER
           ================================================= */

        egyptMarker = L.marker(
            [egypt.lat, egypt.lng],
            {
                icon: markerIcon,

                keyboard: false
            }
        )
        .addTo(map)
        .bindTooltip(
            "Egipto",
            {
                permanent: true,
                direction: "top",
                offset: [0, -10],
                className: "country-tooltip"
            }
        );


        /* =================================================
           HONDURAS MARKER
           ================================================= */

        hondurasMarker = L.marker(
            [honduras.lat, honduras.lng],
            {
                icon: markerIcon,

                keyboard: false
            }
        )
        .addTo(map)
        .bindTooltip(
            "Honduras",
            {
                permanent: true,
                direction: "top",
                offset: [0, -10],
                className: "country-tooltip"
            }
        );


        /* =================================================
           DISTANCE
           ================================================= */

        totalDistance = calculateDistance(
            egypt.lat,
            egypt.lng,
            honduras.lat,
            honduras.lng
        );


        if (distanceElement) {

            distanceElement.textContent =
                formatDistance(totalDistance);
        }


        /* =================================================
           GREAT CIRCLE ROUTE
           ================================================= */

        routePoints = createGreatCircleRoute(
            egypt,
            honduras,
            220
        );


        /*
         * IMPORTANT:
         * Start with an empty line.
         * It will be drawn only when the journey begins.
         */

        routeLine = L.polyline(
            [],
            {
                color: "#ffffff",

                weight: 2.5,

                opacity: 0.9,

                dashArray: "7 10",

                lineCap: "round",

                lineJoin: "round",

                className: "route-line"
            }
        ).addTo(map);


        /* =================================================
           MOVING POINT
           ================================================= */

        const movingIcon = L.divIcon({

            className: "moving-point-wrapper",

            html: `
                <div class="moving-point">
                    <div class="moving-point-core"></div>
                </div>
            `,

            iconSize: [22, 22],

            iconAnchor: [11, 11]
        });


        movingPoint = L.marker(
            [egypt.lat, egypt.lng],
            {
                icon: movingIcon,

                opacity: 0
            }
        ).addTo(map);


        /* =================================================
           MAP READY
           ================================================= */

        setTimeout(() => {

            if (map) {

                map.invalidateSize(true);
            }

        }, 500);
    }


    /* =====================================================
       ANIMATE ROUTE
       ===================================================== */

    function animateRoute() {

        if (!map || !routeLine || !routePoints.length) {
            return;
        }


        /*
         * Cancel previous animation.
         */

        if (animationFrame) {

            cancelAnimationFrame(animationFrame);

            animationFrame = null;
        }


        let progress = 0;

        const duration = 9000;

        const startTime = performance.now();


        routeLine.setLatLngs([]);

        routeLine.setStyle({
            opacity: 0.9
        });


        if (movingPoint) {

            movingPoint.setOpacity(1);

            movingPoint.setLatLng(
                routePoints[0]
            );
        }


        function animate(currentTime) {

            const elapsed =
                currentTime - startTime;

            progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
             * Ease in/out
             */

            const easedProgress =
                progress < 0.5

                    ? 2 * progress * progress

                    : 1 -
                      Math.pow(
                          -2 * progress + 2,
                          2
                      ) / 2;


            const currentIndex =
                Math.floor(
                    easedProgress *
                    (routePoints.length - 1)
                );


            const visiblePoints =
                routePoints.slice(
                    0,
                    currentIndex + 1
                );


            routeLine.setLatLngs(
                visiblePoints
            );


            if (movingPoint && visiblePoints.length) {

                const currentPosition =
                    visiblePoints[
                        visiblePoints.length - 1
                    ];

                movingPoint.setLatLng(
                    currentPosition
                );
            }


            /*
             * Move the map gently with the journey.
             */

            if (
                currentIndex > 0 &&
                currentIndex < routePoints.length - 1
            ) {

                if (currentIndex % 8 === 0) {

                    const currentPosition =
                        routePoints[currentIndex];

                    map.panTo(
                        currentPosition,
                        {
                            animate: true,

                            duration: 0.4
                        }
                    );
                }
            }


            if (progress < 1) {

                animationFrame =
                    requestAnimationFrame(
                        animate
                    );

            } else {

                animationFrame = null;

                finishJourney();
            }
        }


        animationFrame =
            requestAnimationFrame(
                animate
            );
    }


    /* =====================================================
       FINISH JOURNEY
       ===================================================== */

    function finishJourney() {

        if (!map) return;


        if (movingPoint) {

            movingPoint.setOpacity(0);
        }


        /*
         * Make sure the entire route is visible.
         */

        routeLine.setLatLngs(
            routePoints
        );


        const bounds =
            L.latLngBounds(routePoints);


        setTimeout(() => {

            map.fitBounds(
                bounds,
                {
                    paddingTopLeft: [50, 130],

                    paddingBottomRight: [50, 190],

                    maxZoom: 3.2,

                    animate: true,

                    duration: 2
                }
            );

        }, 300);


        if (storyText) {

            storyText.textContent =
                "Y finalmente... el camino nos lleva hasta Honduras.";
        }


        setTimeout(() => {

            if (!travelButton) return;


            travelButton.disabled = false;

            travelButton.style.opacity = "1";

            travelButton.textContent =
                "Continuar";


            travelButton.onclick = () => {

                showScene(finalScene);
            };

        }, 2500);
    }


    /* =====================================================
       START JOURNEY BUTTON
       ===================================================== */

    if (startJourneyButton) {

        startJourneyButton.addEventListener(
            "click",
            () => {

                showScene(mapScene);

                /*
                 * Wait until the map scene becomes visible.
                 * Leaflet needs a visible container.
                 */

                setTimeout(() => {

                    createMap();

                    if (map) {

                        map.invalidateSize(true);
                    }

                }, 350);
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

                /*
                 * Ignore this event after the first journey.
                 */

                if (journeyStarted) {
                    return;
                }


                journeyStarted = true;


                travelButton.disabled = true;

                travelButton.style.opacity = "0.5";

                travelButton.textContent =
                    "Viajando...";


                if (storyText) {

                    storyText.textContent =
                        "Comenzamos el viaje...";
                }


                /*
                 * Move toward Egypt first.
                 */

                map.flyTo(
                    [egypt.lat, egypt.lng],
                    3.5,
                    {
                        duration: 2
                    }
                );


                setTimeout(() => {

                    if (storyText) {

                        storyText.textContent =
                            "Un camino atraviesa el mundo entre nosotros...";
                    }


                    animateRoute();

                }, 2200);
            }
        );
    }


    /* =====================================================
       WINDOW RESIZE
       ===================================================== */

    let resizeTimer = null;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(resizeTimer);


            resizeTimer = setTimeout(
                () => {

                    if (map) {

                        map.invalidateSize(true);
                    }

                },
                250
            );
        }
    );


    /* =====================================================
       VISIBILITY CHANGE
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                !document.hidden &&
                map
            ) {

                setTimeout(() => {

                    map.invalidateSize(true);

                }, 300);
            }
        }
    );


    /* =====================================================
       MOBILE TOUCH
       ===================================================== */

    document.addEventListener(
        "touchmove",
        (event) => {

            /*
             * Do NOT block touch gestures inside Leaflet.
             */

            if (
                event.target.closest("#map")
            ) {
                return;
            }

            /*
             * Only prevent unwanted page movement
             * outside the map.
             */

            event.preventDefault();

        },
        {
            passive: false
        }
    );


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    showScene(introScene);

});
