/* =========================================================
   ENTRE DOS MUNDOS
   Interactive World Map
========================================================= */


/* =========================================================
   1. ELEMENTS
========================================================= */

const introScene = document.getElementById("intro");
const mapScene = document.getElementById("mapScene");
const finalScene = document.getElementById("finalScene");

const startJourneyButton =
    document.getElementById("startJourney");

const travelButton =
    document.getElementById("travelButton");

const distanceElement =
    document.getElementById("distance");

const storyText =
    document.getElementById("storyText");


/* =========================================================
   2. LOCATIONS
========================================================= */

/*
    Cairo, Egypt
    Tegucigalpa, Honduras

    These coordinates are used as representative
    points for the two countries.
*/

const egypt = {
    name: "Egipto",
    lat: 30.0444,
    lng: 31.2357
};

const honduras = {
    name: "Honduras",
    lat: 14.0723,
    lng: -87.1921
};


/* =========================================================
   3. STATE
========================================================= */

let map = null;

let egyptMarker = null;
let hondurasMarker = null;

let routeLine = null;

let journeyStarted = false;

let journeyAnimation = null;


/* =========================================================
   4. SCENE CONTROL
========================================================= */

function showScene(scene) {

    document
        .querySelectorAll(".scene")
        .forEach(currentScene => {

            currentScene.classList.remove("active");

        });

    scene.classList.add("active");
}


/* =========================================================
   5. HAVERSINE DISTANCE
========================================================= */

function calculateDistance(lat1, lon1, lat2, lon2) {

    const earthRadius = 6371;

    const degreesToRadians =
        Math.PI / 180;

    const dLat =
        (lat2 - lat1) * degreesToRadians;

    const dLon =
        (lon2 - lon1) * degreesToRadians;

    const latitude1 =
        lat1 * degreesToRadians;

    const latitude2 =
        lat2 * degreesToRadians;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(latitude1) *
        Math.cos(latitude2) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}


/* =========================================================
   6. FORMAT DISTANCE
========================================================= */

function formatDistance(distance) {

    return Math.round(distance)
        .toLocaleString("en-US") + " km";
}


/* =========================================================
   7. CREATE MAP
========================================================= */

function createMap() {

    if (map) {
        return;
    }


    /* -----------------------------------------
       Create Leaflet map
    ----------------------------------------- */

    map = L.map("map", {

        zoomControl: true,

        minZoom: 2,

        maxZoom: 7,

        worldCopyJump: false,

        attributionControl: true

    });


    /* -----------------------------------------
       OpenStreetMap tiles
    ----------------------------------------- */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);


    /* -----------------------------------------
       Initial world view
    ----------------------------------------- */

    map.setView(
        [22, -20],
        2
    );


    /* -----------------------------------------
       Custom marker icons
    ----------------------------------------- */

    const markerIcon =
        L.divIcon({

            className: "",

            html:
                '<div class="country-marker"></div>',

            iconSize: [18, 18],

            iconAnchor: [9, 9]

        });


    /* -----------------------------------------
       Egypt marker
    ----------------------------------------- */

    egyptMarker =
        L.marker(
            [egypt.lat, egypt.lng],
            {
                icon: markerIcon
            }
        )
        .addTo(map)
        .bindTooltip(
            "Egipto",
            {
                permanent: false,
                direction: "top"
            }
        );


    /* -----------------------------------------
       Honduras marker
    ----------------------------------------- */

    hondurasMarker =
        L.marker(
            [honduras.lat, honduras.lng],
            {
                icon: markerIcon
            }
        )
        .addTo(map)
        .bindTooltip(
            "Honduras",
            {
                permanent: false,
                direction: "top"
            }
        );


    /* -----------------------------------------
       Calculate real geographic distance
    ----------------------------------------- */

    const distance =
        calculateDistance(
            egypt.lat,
            egypt.lng,
            honduras.lat,
            honduras.lng
        );


    distanceElement.textContent =
        formatDistance(distance);


    /* -----------------------------------------
       Create initial route
    ----------------------------------------- */

    routeLine =
        L.polyline(
            [
                [egypt.lat, egypt.lng],
                [honduras.lat, honduras.lng]
            ],
            {
                color: "#ffffff",

                weight: 2,

                opacity: 0.75,

                dashArray: "8 10",

                className: "route-line"
            }
        )
        .addTo(map);


    /*
        Initially show the whole world.
    */

    setTimeout(() => {

        map.invalidateSize();

    }, 300);
}


/* =========================================================
   8. START EXPERIENCE
========================================================= */

startJourneyButton.addEventListener(
    "click",
    () => {

        showScene(mapScene);

        createMap();

        setTimeout(() => {

            map.invalidateSize();

        }, 500);

    }
);


/* =========================================================
   9. BUILD A CURVED ROUTE
========================================================= */

function createCurvedRoute() {

    /*
        Instead of using only two points,
        create intermediate points.

        This gives the journey a cinematic
        flight-route appearance.
    */

    const points = [];

    const startLat = egypt.lat;
    const startLng = egypt.lng;

    const endLat = honduras.lat;
    const endLng = honduras.lng;


    const numberOfPoints = 100;


    for (
        let i = 0;
        i <= numberOfPoints;
        i++
    ) {

        const progress =
            i / numberOfPoints;


        /*
            Linear interpolation
        */

        const lat =
            startLat +
            (endLat - startLat) *
            progress;


        const lng =
            startLng +
            (endLng - startLng) *
            progress;


        /*
            Arc height

            Makes the line slightly curved
            instead of completely straight.
        */

        const arc =
            Math.sin(
                progress * Math.PI
            ) * 12;


        points.push([
            lat + arc,
            lng
        ]);
    }


    return points;
}


/* =========================================================
   10. ANIMATE ROUTE
========================================================= */

function animateRoute() {

    if (!routeLine) {
        return;
    }


    const points =
        createCurvedRoute();


    routeLine.setLatLngs([]);


    let currentPoint = 0;


    /*
        Animation speed
    */

    const speed = 12;


    journeyAnimation =
        setInterval(() => {

            if (
                currentPoint >=
                points.length
            ) {

                clearInterval(
                    journeyAnimation
                );

                journeyAnimation = null;

                finishJourney();

                return;
            }


            const visiblePoints =
                points.slice(
                    0,
                    currentPoint + 1
                );


            routeLine.setLatLngs(
                visiblePoints
            );


            /*
                Follow the route
            */

            if (
                currentPoint % 4 === 0 &&
                map
            ) {

                const point =
                    points[currentPoint];

                map.panTo(
                    point,
                    {
                        animate: true,

                        duration: 0.35
                    }
                );

            }


            currentPoint += 1;

        }, speed);
}


/* =========================================================
   11. START JOURNEY
========================================================= */

travelButton.addEventListener(
    "click",
    () => {

        if (journeyStarted) {
            return;
        }

        journeyStarted = true;

        travelButton.disabled = true;

        travelButton.style.opacity = "0.5";

        storyText.textContent =
            "Comenzamos el viaje...";


        /*
            Zoom toward Egypt first.
        */

        map.flyTo(
            [egypt.lat, egypt.lng],
            4,
            {
                duration: 2
            }
        );


        setTimeout(() => {

            storyText.textContent =
                "Un camino atraviesa el mundo entre nosotros...";

            animateRoute();

        }, 2200);

    }
);


/* =========================================================
   12. FINISH JOURNEY
========================================================= */

function finishJourney() {

    if (!map) {
        return;
    }


    /*
        Show both countries
    */

    const bounds =
        L.latLngBounds([
            [egypt.lat, egypt.lng],
            [honduras.lat, honduras.lng]
        ]);


    map.fitBounds(
        bounds,
        {
            paddingTopLeft: [40, 140],

            paddingBottomRight: [40, 180],

            maxZoom: 3,

            animate: true,

            duration: 2
        }
    );


    storyText.textContent =
        "Y finalmente... llegamos a Honduras.";


    setTimeout(() => {

        travelButton.disabled = false;

        travelButton.style.opacity = "1";

        travelButton.textContent =
            "Continuar";

        travelButton.onclick = () => {

            showScene(finalScene);

        };

    }, 2500);
}


/* =========================================================
   13. MAP RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (map) {

            setTimeout(() => {

                map.invalidateSize();

            }, 200);

        }

    }
);


/* =========================================================
   14. PREVENT ACCIDENTAL PAGE SCROLL
========================================================= */

document.addEventListener(
    "touchmove",
    event => {

        if (
            event.target.closest("#map")
        ) {
            return;
        }

        event.preventDefault();

    },
    {
        passive: false
    }
);


/* =========================================================
   15. INITIAL STATE
========================================================= */

showScene(introScene);
