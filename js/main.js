/* ==========================================================================
   Entre Dos Mundos - Main WebGL & Cinematic Globe Application
   ========================================================================== */

// --- 1. Real Geographic Coordinates ---
const EGYPT_COORDS = { lat: 26.8206, lng: 30.8025, name: 'EGIPTO' };
const HONDURAS_COORDS = { lat: 14.0723, lng: -86.2419, name: 'HONDURAS' };

// Global Variables & State
let world;
let isAnimatingPath = false;

// --- 2. Haversine Distance Calculation ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

// --- 3. WebGL Support Detection ---
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

// --- 4. Initialize 3D Globe ---
function initGlobe() {
  if (!checkWebGLSupport()) {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('errorScreen').classList.remove('hidden');
    return;
  }

  const container = document.getElementById('globeViz');

  // Markers Data
  const htmlMarkersData = [
    { ...EGYPT_COORDS, color: '#d4af37', label: 'Egipto 🇪🇬' },
    { ...HONDURAS_COORDS, color: '#e63946', label: 'Honduras 🇭🇳' }
  ];

  // Instantiating Globe.gl
  world = Globe()(container)
    // High Quality Textures (Natural Earth / Blue Marble open source)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    // Atmosphere & Lighting
    .showAtmosphere(true)
    .atmosphereColor('#3a7bd5')
    .atmosphereAltitude(0.22)
    // Auto Rotation
    .autoRotate(true)
    .autoRotateSpeed(0.5)
    // Dynamic 3D HTML Markers tied to Globe
    .htmlElementsData(htmlMarkersData)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          pointer-events: none;
        ">
          <span style="
            color: #ffffff;
            font-family: 'Cinzel', serif;
            font-size: 11px;
            font-weight: 600;
            background: rgba(12, 16, 26, 0.85);
            padding: 3px 8px;
            border-radius: 12px;
            border: 1px solid ${d.color};
            box-shadow: 0 0 10px ${d.color};
            white-space: nowrap;
            margin-bottom: 4px;
          ">${d.label}</span>
          <div style="
            width: 12px;
            height: 12px;
            background-color: ${d.color};
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px ${d.color};
          "></div>
        </div>
      `;
      return el;
    });

  // Adjust Device Pixel Ratio for optimized Mobile Performance
  world.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Enable Camera Controls Inertia
  const controls = world.controls();
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 0.8;

  // Add Cloud Layer Mesh
  addCloudLayer();

  // Initial Camera View (Focusing Atlantic Ocean overview)
  world.pointOfView({ lat: 20, lng: -25, altitude: 2.5 }, 0);

  // Hide Loading Screen when Texture is loaded
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
  }, 1200);

  // Handle Resize
  window.addEventListener('resize', () => {
    world.width(window.innerWidth);
    world.height(window.innerHeight);
  });
}

// --- 5. Add Realistic Cloud Layer Mesh ---
function addCloudLayer() {
  const CLOUDS_IMG_URL = 'https://unpkg.com/three-globe/example/img/earth-clouds.png';
  const CLOUDS_ALT = 0.008;
  const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

  new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(world.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
      new THREE.MeshPhantomMaterial ? new THREE.MeshPhantomMaterial({ map: cloudsTexture, transparent: true }) :
      new THREE.MeshStandardMaterial({ map: cloudsTexture, transparent: true, opacity: 0.4 })
    );
    world.scene().add(clouds);

    (function rotateClouds() {
      clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
      requestAnimationFrame(rotateClouds);
    })();
  });
}

// --- 6. Arc Path Rendering ---
function renderPathArc() {
  const arcData = [{
    startLat: EGYPT_COORDS.lat,
    startLng: EGYPT_COORDS.lng,
    endLat: HONDURAS_COORDS.lat,
    endLng: HONDURAS_COORDS.lng,
    color: ['#d4af37', '#e63946']
  }];

  world
    .arcsData(arcData)
    .arcColor('color')
    .arcAltitude(0.35)
    .arcStroke(1.8)
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(2000);
}

// --- 7. Cinematic 8-Stage Camera Fly Sequence ---
function triggerCinematicSequence() {
  if (isAnimatingPath) return;
  isAnimatingPath = true;

  const btnShowPath = document.getElementById('btnShowPath');
  const btnContinue = document.getElementById('btnContinue');
  const storyOverlay = document.getElementById('storyOverlay');
  const storyText = document.getElementById('storyText');

  btnShowPath.classList.add('hidden');
  world.controls().autoRotate = false;

  // Render glowing animated arc
  renderPathArc();

  // Helper function for updating story text smoothly
  function updateStory(text) {
    storyOverlay.classList.remove('hidden');
    storyText.style.opacity = 0;
    setTimeout(() => {
      storyText.innerText = text;
      storyText.style.opacity = 1;
    }, 300);
  }

  // 8-Stage Sequence Timeline
  // 1. Zoom to Egypt
  updateStory("El camino comienza a cruzar el mundo...");
  world.pointOfView({ lat: EGYPT_COORDS.lat, lng: EGYPT_COORDS.lng, altitude: 1.2 }, 2500);

  // 2. Ascend over Atlantic
  setTimeout(() => {
    updateStory("Miles de kilómetros entre dos corazones...");
    world.pointOfView({ lat: 20, lng: -25, altitude: 2.2 }, 3500);
  }, 3500);

  // 3. Travel toward Honduras
  setTimeout(() => {
    updateStory("Y aun así, el mundo parece un poco más pequeño.");
    world.pointOfView({ lat: HONDURAS_COORDS.lat, lng: HONDURAS_COORDS.lng, altitude: 1.2 }, 3500);
  }, 7500);

  // 4. Focus on Honduras & Show Continue Button
  setTimeout(() => {
    updateStory("Finalmente... el camino llega hasta Honduras.");
    btnContinue.classList.remove('hidden');
    isAnimatingPath = false;
  }, 11500);
}

// --- 8. Event Listeners & Scene Switching ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize WebGL Globe
  initGlobe();

  // Calculate & Set Distance
  const distance = calculateDistance(
    EGYPT_COORDS.lat, EGYPT_COORDS.lng,
    HONDURAS_COORDS.lat, HONDURAS_COORDS.lng
  );
  document.getElementById('distanceValue').innerText = `${distance.toLocaleString()} km`;

  // UI Navigation Buttons
  const btnDiscover = document.getElementById('btnDiscover');
  const btnShowPath = document.getElementById('btnShowPath');
  const btnContinue = document.getElementById('btnContinue');
  const btnRestart = document.getElementById('btnRestart');

  const introScene = document.getElementById('introScene');
  const mainExperienceUI = document.getElementById('mainExperienceUI');
  const finalScene = document.getElementById('finalScene');

  // Discover Button Click
  btnDiscover.addEventListener('click', () => {
    introScene.classList.add('hidden');
    mainExperienceUI.classList.remove('hidden');
  });

  // Show Path Click
  btnShowPath.addEventListener('click', triggerCinematicSequence);

  // Continue to Final Scene Click
  btnContinue.addEventListener('click', () => {
    mainExperienceUI.classList.add('hidden');
    finalScene.classList.remove('hidden');
  });

  // Restart Experience Click
  btnRestart.addEventListener('click', () => {
    finalScene.classList.add('hidden');
    introScene.classList.remove('hidden');
    
    // Reset Globe State
    world.arcsData([]);
    world.controls().autoRotate = true;
    world.pointOfView({ lat: 20, lng: -25, altitude: 2.5 }, 1500);
    
    document.getElementById('btnShowPath').classList.remove('hidden');
    document.getElementById('btnContinue').classList.add('hidden');
    document.getElementById('storyOverlay').classList.add('hidden');
    isAnimatingPath = false;
  });
});
