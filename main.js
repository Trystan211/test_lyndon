import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup ni don
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // Para ngit2

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls para sa camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth damping
controls.dampingFactor = 0.25;  // Speed sa damping
controls.screenSpacePanning = false;  // Disable panning sa screen

// Ground na snow
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog ni
scene.fog = new THREE.Fog(0xffffff, 10, 50); // Tae na white

// Moonlight
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); 
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

// Ambient na light
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

// Snowman Model
const loader = new GLTFLoader();
let snowmanMixer = null;
let snowman = null;

const modelUrl = 'https://trystan211.github.io/test_lyndon/snowman.glb';

loader.load(
  modelUrl,
  (gltf) => {
    snowman = gltf.scene;
    snowman.position.set(0, 0, 0);
    snowman.scale.set(5, 5, 5);
    scene.add(snowman);

    // Handle animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      snowmanMixer = new THREE.AnimationMixer(snowman);
      const action = snowmanMixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the snowman model:', error);
  }
);

// Trees ni
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

for (let i = 0; i < 40; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 4, 16),
    trunkMaterial
  );
  trunk.position.set(x, 2, z);
  trunk.castShadow = true;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(2, 6, 16),
    leafMaterial
  );
  foliage.position.set(x, 5, z);
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Mushrooms ni
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ emissive: 0xff2222 });
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;

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

// Fireflies ni
const fireflies = [];
for (let i = 0; i < 15; i++) {
  const firefly = new THREE.PointLight(0xffff00, 2, 7);
  firefly.position.set(
    Math.random() * 40 - 20,
    Math.random() * 5 + 1,
    Math.random() * 40 - 20
  );
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

// Snow Particles gamit ang BufferGeometry
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

// Use BufferAttribute para ma store ang positions
snowParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const snow = new THREE.Points(snowParticles, snowMaterial);
scene.add(snow);

// Update ang snow particles para sa falling na effect
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update ang positions sa snow particles
  const positionsArray = snowParticles.attributes.position.array;
  for (let i = 0; i < positionsArray.length; i += 3) {
    positionsArray[i + 1] -= 0.05; // Nagpatagak sa snowflakes

    if (positionsArray[i + 1] < 0) {
      positionsArray[i + 1] = 30; // Nag reset pabalik sa taas
    }
  }

  snowParticles.attributes.position.needsUpdate = true;

  // Update sa OrbitControls
  controls.update(); // Only required if ang controls.enableDamping = true, or kung ang if controls.auto-rotation kay na enabled

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
