/* ==========================================================================
   Entre Dos Mundos - Main JavaScript Application
   ========================================================================== */

// --- 1. Cesium Ion Token Configuration ---
// احصل على مفتاحك المجاني من: https://cesium.com/ion/
// استبدل النص التالي بمفتاحك الخاص للحصول على أعلى دقة صور أقمار صناعية وتضاريس ثلاثية الأبعاد
Cesium.Ion.defaultAccessToken = 'YOUR_CESIUM_ION_TOKEN';

// --- 2. Geographic Coordinates ---
const EGYPT = {
  name: 'Egipto',
  lon: 31.2357,
  lat: 30.0444,
  height: 0
};

const HONDURAS = {
  name: 'Honduras',
  lon: -87.2068,
  lat: 14.0818,
  height: 0
};

let viewer;

// --- 3. Initialize Cesium 3D Globe ---
function initGlobe() {
  viewer = new Cesium.Viewer('cesiumContainer', {
    // Basic Providers & UI Options
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    animation: false,
    fullscreenButton: false,
    navigationHelpButton: false,
    vrButton: false,

    // High quality imagery base layer
    imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    }),
    
    // Enable atmosphere and lighting engine
    skyAtmosphere: new Cesium.SkyAtmosphere(),
    contextOptions: {
      webgl: {
        alpha: false,
        antialias: true,
        preserveDrawingBuffer: true
      }
    }
  });

  // --- Atmospheric & Realistic Visual Enhancements ---
  const scene = viewer.scene;
  const globe = scene.globe;

  // Enable Sun lighting & Dynamic Shadow Effects
  globe.enableLighting = true;
  globe.showWaterEffect = true;
  globe.atmosphereLightIntensity = 10.0;
  
  // Fog and atmospheric depth effects
  scene.fog.enabled = true;
  scene.fog.density = 0.0002;
  scene.fog.screenSpaceErrorFactor = 2.0;

  // Smooth interaction settings
  scene.screenSpaceCameraController.enableLook = true;
  scene.screenSpaceCameraController.enableRotate = true;
  scene.screenSpaceCameraController.enableZoom = true;
  scene.screenSpaceCameraController.inertiaSpin = 0.9;
  scene.screenSpaceCameraController.inertiaTranslate = 0.9;
  scene.screenSpaceCameraController.inertiaZoom = 0.8;

  // Add Terrain (3D Earth Elevation) if Token is valid
  try {
    globe.depthTestAgainstTerrain = false;
  } catch (e) {
    console.log("Terrain default active");
  }

  // Render markers and animated arc
  setupMarkers();
  drawAnimatedPath();
  calculateAndDisplayDistance();

  // Set initial camera view showing both continents
  resetView();
}

// --- 4. Create Location Markers ---
function setupMarkers() {
  // SVG Marker Canvas Helper
  function createPinCanvas(colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    // Outer Glow Circle
    ctx.beginPath();
    ctx.arc(24, 24, 20, 0, 2 * Math.PI, false);
    ctx.fillStyle = colorHex + '33';
    ctx.fill();

    // Inner Solid Circle
    ctx.beginPath();
    ctx.arc(24, 24, 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    return canvas;
  }

  // Egypt Pin
  viewer.entities.add({
    name: EGYPT.name,
    position: Cesium.Cartesian3.fromDegrees(EGYPT.lon, EGYPT.lat, EGYPT.height),
    billboard: {
      image: createPinCanvas('#d4af37'), // Gold
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      scale: 1.0,
      width: 40,
      height: 40
    },
    label: {
      text: 'Egipto ♥',
      font: '600 16px Montserrat, sans-serif',
      style: Cesium.LabelStyle.FILL_AND_STROKE,
      fillColor: Cesium.Color.fromCssColorString('#ffffff'),
      outlineColor: Cesium.Color.fromCssColorString('#000000'),
      outlineWidth: 3,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -25)
    }
  });

  // Honduras Pin
  viewer.entities.add({
    name: HONDURAS.name,
    position: Cesium.Cartesian3.fromDegrees(HONDURAS.lon, HONDURAS.lat, HONDURAS.height),
    billboard: {
      image: createPinCanvas('#e63946'), // Crimson Red
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      scale: 1.0,
      width: 40,
      height: 40
    },
    label: {
      text: 'Honduras ♥',
      font: '600 16px Montserrat, sans-serif',
      style: Cesium.LabelStyle.FILL_AND_STROKE,
      fillColor: Cesium.Color.fromCssColorString('#ffffff'),
      outlineColor: Cesium.Color.fromCssColorString('#000000'),
      outlineWidth: 3,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -25)
    }
  });
}

// --- 5. Draw Glowing & Animated Geodesic Arc ---
function drawAnimatedPath() {
  const startCartographic = Cesium.Cartographic.fromDegrees(EGYPT.lon, EGYPT.lat);
  const endCartographic = Cesium.Cartographic.fromDegrees(HONDURAS.lon, HONDURAS.lat);

  // Calculate intermediate geodesic points for smooth elevated arc
  const geodesic = new Cesium.EllipsoidGeodesic(startCartographic, endCartographic);
  const numPoints = 100;
  const positions = [];

  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const cartographic = geodesic.interpolateUsingFraction(fraction);
    
    // Create parabolic altitude curve maxing out in the upper atmosphere
    const height = Math.sin(fraction * Math.PI) * 1200000; // 1,200 km peak height
    
    positions.push(
      Cesium.Cartesian3.fromDegrees(
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        height
      )
    );
  }

  // Draw Dynamic Glowing Curved Line
  viewer.entities.add({
    name: 'El Camino',
    polyline: {
      positions: positions,
      width: 4,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.35,
        taperPower: 0.1,
        color: Cesium.Color.fromCssColorString('#d4af37')
      })
    }
  });
}

// --- 6. Calculate Great-Circle Real Distance ---
function calculateAndDisplayDistance() {
  const p1 = Cesium.Cartographic.fromDegrees(EGYPT.lon, EGYPT.lat);
  const p2 = Cesium.Cartographic.fromDegrees(HONDURAS.lon, HONDURAS.lat);

  const geodesic = new Cesium.EllipsoidGeodesic(p1, p2);
  const distanceInMeters = geodesic.surfaceDistance;
  const distanceInKm = Math.round(distanceInMeters / 1000);

  // Format and insert into UI
  const distanceElement = document.getElementById('distanceValue');
  if (distanceElement) {
    distanceElement.innerText = `${distanceInKm.toLocaleString()} km`;
  }
}

// --- 7. Cinematic Fly-To Animation ---
function flyCinematicPath() {
  const btnFly = document.getElementById('btnFly');
  if (btnFly) btnFly.disabled = true;

  // Phase 1: Focus on Egypt
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(EGYPT.lon, EGYPT.lat, 1500000),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-45.0),
      roll: 0.0
    },
    duration: 3,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    complete: function () {
      
      // Phase 2: Ascend and curve across the Atlantic toward Honduras
      const midLon = (EGYPT.lon + HONDURAS.lon) / 2;
      const midLat = (EGYPT.lat + HONDURAS.lat) / 2;

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(midLon, midLat, 12000000), // Orbital Altitude
        orientation: {
          heading: Cesium.Math.toRadians(-60.0),
          pitch: Cesium.Math.toRadians(-85.0),
          roll: 0.0
        },
        duration: 4,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
        complete: function () {

          // Phase 3: Descend cinematically over Honduras
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(HONDURAS.lon, HONDURAS.lat, 1500000),
            orientation: {
              heading: Cesium.Math.toRadians(-30.0),
              pitch: Cesium.Math.toRadians(-40.0),
              roll: 0.0
            },
            duration: 3,
            easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
            complete: function () {
              if (btnFly) btnFly.disabled = false;
            }
          });
        }
      });
    }
  });
}

// --- 8. Reset View to Global Overview ---
function resetView() {
  const midLon = (EGYPT.lon + HONDURAS.lon) / 2;
  const midLat = (EGYPT.lat + HONDURAS.lat) / 2;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(midLon, midLat, 16000000),
    orientation: {
      heading: 0.0,
      pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0
    },
    duration: 2.5,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT
  });
}

// --- 9. Event Listeners & Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initGlobe();

  const btnFly = document.getElementById('btnFly');
  const btnReset = document.getElementById('btnReset');

  if (btnFly) {
    btnFly.addEventListener('click', flyCinematicPath);
  }

  if (btnReset) {
    btnReset.addEventListener('click', resetView);
  }
});
