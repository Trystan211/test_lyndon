import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // Dark background for the scene

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth damping for camera movement
controls.dampingFactor = 0.25;  // Speed of damping
controls.screenSpacePanning = false;  // Disable screen panning

// Ground (Snowy Surface)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xFFFFFF })  // White color to simulate snow
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog for atmosphere
scene.fog = new THREE.Fog(0xffffff, 10, 50); // White fog effect

// Moonlight (Directional Light)
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); // Light color and intensity
moonLight.position.set(10, 30, -10); // Position the light in the scene
moonLight.castShadow = true;
scene.add(moonLight);

// Ambient light (General light)
const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Subtle ambient light
scene.add(ambientLight);

// Define a safe radius around the snowman where no objects can be placed
const safeRadius = 5; // Safe area radius around the snowman
const snowmanPosition = new THREE.Vector3(0, 0, 0); // Snowman's position in the scene

// Helper function to check if a position is within the safe radius
const isOutsideSafeRadius = (x, y, z) => {
  const position = new THREE.Vector3(x, y, z);
  return snowmanPosition.distanceTo(position) >= safeRadius;
};

// Load Snowman Model using GLTFLoader
const loader = new THREE.GLTFLoader();
let snowman = null;

const modelUrl = 'https://trystan211.github.io/test_lyndon/snowman.glb'; // URL to the snowman model

loader.load(
  modelUrl,
  (gltf) => {
    snowman = gltf.scene;
    snowman.position.set(0, 0, 0);  // Position the snowman in the scene
    snowman.scale.set(5, 5, 5);  // Scale the snowman
    scene.add(snowman);
  },
  undefined,
  (error) => {
    console.error('Error loading snowman model:', error);
  }
);

// Create Trees
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color for tree trunks
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White leaves for snowy effect

for (let i = 0; i < 10; i++) { // Reduced tree count to 10 for a less crowded scene
  let x, z;

  // Ensure trees are outside the safe radius around the snowman
  do {
    x = Math.random() * 40 - 20;
    z = Math.random() * 40 - 20;
  } while (!isOutsideSafeRadius(x, 0, z)); // Keep trees at least `safeRadius` units away from snowman

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 4, 16),
    trunkMaterial
  );
  trunk.position.set(x, 2, z); // Position the trunk at y = 2
  trunk.castShadow = true;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(2, 6, 16),  // Cone-shaped foliage
    leafMaterial
  );
  foliage.position.set(x, 5, z); // Position foliage above the trunk
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Create Mushrooms
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red caps for mushrooms
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White stems

for (let i = 0; i < 50; i++) {
  let x, z;

  // Ensure mushrooms are outside the safe radius
  do {
    x = Math.random() * 40 - 20;
    z = Math.random() * 40 - 20;
  } while (!isOutsideSafeRadius(x, 0.25, z)); // Ensure mushrooms are outside the snowman's safe radius

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.2, 0.5),
    mushroomStemMaterial
  );
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.3, 8),
    mushroomCapMaterial
  );
  stem.position.set(x, 0.25, z);
  cap.position.set(x, 0.55, z);

  stem.castShadow = true;
  cap.castShadow = true;

  scene.add(stem);
  scene.add(cap);
}

// Create Fireflies
const fireflies = [];
for (let i = 0; i < 15; i++) {
  let x, y, z;

  // Ensure fireflies are outside the safe radius
  do {
    x = Math.random() * 40 - 20;
    y = Math.random() * 5 + 1;
    z = Math.random() * 40 - 20;
  } while (!isOutsideSafeRadius(x, y, z));

  const firefly = new THREE.PointLight(0xffff00, 2, 7);  // Yellow firefly light
  firefly.position.set(x, y, z);
  scene.add(firefly);

  fireflies.push({
    light: firefly,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    ),
  });
}

// Snowfall using BufferGeometry (snowflakes)
const snowParticles = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  opacity: 0.8,
  transparent: true,
});

const snowflakeCount = 5000;
const positions = new Float32Array(snowflakeCount * 3);

for (let i = 0; i < snowflakeCount; i++) {
  positions[i * 3] = Math.random() * 50 - 25; // x position
  positions[i * 3 + 1] = Math.random() * 30 + 5; // y position
  positions[i * 3 + 2] = Math.random() * 50 - 25; // z position
}

snowParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const snow = new THREE.Points(snowParticles, snowMaterial);
scene.add(snow);

// Animation loop
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update snow particles for falling effect
  const positionsArray = snowParticles.attributes.position.array;
  for (let i = 0; i < positionsArray.length; i += 3) {
    positionsArray[i + 1] -= 0.05;  // Snowflakes falling down

    if (positionsArray[i + 1] < 0) {
      positionsArray[i + 1] = 30;  // Reset snowflakes to the top
    }
  }

  snowParticles.attributes.position.needsUpdate = true;

  controls.update(); // Update camera controls if damping is enabled

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
