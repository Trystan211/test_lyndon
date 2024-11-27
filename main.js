import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // Dark background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0xffffff, 10, 50); // Fog color changed to white

// Moonlight
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); 
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

// Ambient light
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
    snowman.scale.set(0.1, 0.1, 0.1);
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

// Trees (White leaves and shorter brown trunks)
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

// Mushrooms
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

// Fireflies
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

// Snow Particles
const snowParticles = new THREE.Geometry();
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  opacity: 0.8,
  transparent: true,
});

for (let i = 0; i < 5000; i++) {
  const snowflake = new THREE.Vector3(
    Math.random() * 50 - 25,
    Math.random() * 30 + 5,
    Math.random() * 50 - 25
  );
  snowParticles.vertices.push(snowflake);
}

const snow = new THREE.Points(snowParticles, snowMaterial);
scene.add(snow);

// Animation
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Animate snowman
  if (snowmanMixer) snowmanMixer.update(clock.getDelta());

  // Update fireflies
  fireflies.forEach(({ light, velocity }) => {
    light.position.add(velocity);
    if (light.position.y < 1 || light.position.y > 6) velocity.y *= -1;
    if (light.position.x < -20 || light.position.x > 20) velocity.x *= -1;
    if (light.position.z < -20 || light.position.z > 20) velocity.z *= -1;
  });

  // Update snow particles
  snowParticles.vertices.forEach((snowflake) => {
    snowflake.y -= 0.05;
    if (snowflake.y < 0) snowflake.y = 30;
  });

  // Notify the system to update particles
  snowParticles.verticesNeedUpdate = true;

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
