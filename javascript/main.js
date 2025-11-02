import * as THREE from "three";

const canvas = document.querySelector("#bg");
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
renderer.setClearColor(0x0e0e0e);

const nodeCount = 150;
const positions = new Float32Array(nodeCount * 3);
for (let i = 0; i < nodeCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
}
const nodesGeometry = new THREE.BufferGeometry();
nodesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

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
lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
);
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

let animationFrameId;
let isAnimationPaused = false;

function animate() {
    if (!isAnimationPaused) {
        animationFrameId = requestAnimationFrame(animate);
        nodes.rotation.x += 0.0005;
        nodes.rotation.y += 0.001;
        lines.rotation.x += 0.0005;
        lines.rotation.y += 0.001;
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Theme toggle logic

const themeToggleButton = document.getElementById('theme-toggle')
const animationToggleButton = document.getElementById('animation-toggle')
const pauseIcon = document.getElementById('pause-icon')
const playIcon = document.getElementById('play-icon')
const githubIcon = document.getElementById('github-icon')

function updateTheme() {
    const isLightTheme = document.body.classList.contains('light-theme')
    renderer.setClearColor(isLightTheme ? 0xffffff : 0x0e0e0e)

    renderer.render(scene, camera)
}

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('light-theme')

    githubIcon.src = document.body.classList.contains('light-theme')
        ? 'assets/github-mark.svg'
        : 'assets/github-mark-white.svg'

    pauseIcon.style = document.body.classList.contains('light-theme') ? 'filter: invert(0);' : 'filter: invert(1);'
    playIcon.style = document.body.classList.contains('light-theme') ? 'filter: invert(0);' : 'filter: invert(1);'

    updateTheme()
})

// Animation toggle logic
animationToggleButton.addEventListener('click', () => {
    isAnimationPaused = !isAnimationPaused;
    document.body.classList.toggle('animation-paused');

    if (!isAnimationPaused) {
        animate();
    } else {
        cancelAnimationFrame(animationFrameId);
    }
});

pauseIcon.style = document.body.classList.contains('light-theme') ? 'filter: invert(0);' : 'filter: invert(1);'
playIcon.style = document.body.classList.contains('light-theme') ? 'filter: invert(0);' : 'filter: invert(1);'