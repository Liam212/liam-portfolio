import * as THREE from 'three';

// Minimal standalone copy of the animation used on the main site
const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// Match initial dark background used on the site
renderer.setClearColor(0x0e0e0e);

const nodeCount = 150;
const positions = new Float32Array(nodeCount * 3);
for (let i = 0; i < nodeCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}
const nodesGeometry = new THREE.BufferGeometry();
nodesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const nodesMaterial = new THREE.PointsMaterial({
  color: 0x00ffcc,
  size: 0.04,
});
const nodes = new THREE.Points(nodesGeometry, nodesMaterial);
scene.add(nodes);

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0077ff, transparent: true, opacity: 0.3 });
const lineGeometry = new THREE.BufferGeometry();
const linePositions = [];
for (let i = 0; i < nodeCount; i++) {
  for (let j = i + 1; j < nodeCount; j++) {
    const ix = i * 3, jx = j * 3;
    const dx = positions[ix] - positions[jx];
    const dy = positions[ix + 1] - positions[jx + 1];
    const dz = positions[ix + 2] - positions[jx + 2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 1.5) {
      linePositions.push(
        positions[ix], positions[ix + 1], positions[ix + 2],
        positions[jx], positions[jx + 1], positions[jx + 2]
      );
    }
  }
}
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

let animId;
let paused = false;

function animate() {
  if (!paused) {
    animId = requestAnimationFrame(animate);
    nodes.rotation.x += 0.0005;
    nodes.rotation.y += 0.001;
    lines.rotation.x += 0.0005;
    lines.rotation.y += 0.001;
  }
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Respect theme from body class if present (so background color matches site)
function applyThemeFromBody() {
  const isLight = document.body.classList.contains('light-theme');
  renderer.setClearColor(isLight ? 0xffffff : 0x0e0e0e);
  renderer.render(scene, camera);
}

// Run once in case the template includes a theme class
applyThemeFromBody();

// Observe body class changes (so if the user toggles theme from a script, 404 updates)
const bodyObserver = new MutationObserver(mutations => {
  for (const m of mutations) {
    if (m.type === 'attributes' && m.attributeName === 'class') {
      applyThemeFromBody();
    }
  }
});
bodyObserver.observe(document.body, { attributes: true });

// Expose a small API for toggling pause if needed (not required, but helpful)
window._404Animation = {
  pause() { paused = true; cancelAnimationFrame(animId); renderer.render(scene, camera); },
  resume() { if (paused) { paused = false; animate(); } },
};
