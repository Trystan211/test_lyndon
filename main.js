import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022); // Darker background for the scene

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Snow particles
const snowGeometry = new THREE.BufferGeometry();
const snowCount = 1000;
const snowPositions = [];
for (let i = 0; i < snowCount; i++) {
  snowPositions.push(Math.random() * 60 - 30, Math.random() * 10 + 5, Math.random() * 60 - 30);
}
snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
const snowMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.3, // Increased snow particle size
  transparent: true,
});
const snow = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snow);

// Snow movement (falling downwards)
const snowVelocity = [];
for (let i = 0; i < snowCount; i++) {
  snowVelocity.push(0, -Math.random() * 0.05 - 0.1, 0); // Falling downwards
}

// Handle Snow animation
function animateSnow() {
  const positions = snow.geometry.attributes.position.array;
  for (let i = 0; i < snowCount; i++) {
    positions[i * 3 + 1] += snowVelocity[i * 3 + 1];
    if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 10; // Reset snowflake position if it falls below ground
  }
  snow.geometry.attributes.position.needsUpdate = true;
}

// Ground (White floor for snow)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 80), // Slightly wider ground
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Define model URL at the top
const modelUrl = 'https://trystan211.github.io/ite18_Activity_3/low_poly_fox_by_pixelmannen_animated.glb';

// Load the Fox Model
const loader = new GLTFLoader();
let foxMixer = null; // Animation mixer for the fox
let fox = null; // Reference to the fox object

loader.load(
  modelUrl,
  (gltf) => {
    fox = gltf.scene;
    fox.position.set(0, 0, 0); // Initial position
    fox.scale.set(0.1, 0.1, 0.1); // Significantly smaller fox

    scene.add(fox);

    // Handle animations if available
    if (gltf.animations && gltf.animations.length > 0) {
      foxMixer = new THREE.AnimationMixer(fox);
      const action = foxMixer.clipAction(gltf.animations[0]); // Assuming the first animation is walking
      action.play();
    }
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the fox model:", error);
  }
);

// Fog
scene.fog = new THREE.Fog(0x000022, 10, 50);

// Lights
const moonLight = new THREE.DirectionalLight(0x6666ff, 0.4); // Moonlight
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6); // Soft ambient light
scene.add(ambientLight);

// Trees (White leaves and brown trunks)
const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown trunk
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White leaves
for (let i = 0; i < 40; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 6, 16),
    trunkMaterial
  );
  trunk.position.set(x, 3, z);
  trunk.castShadow = true;

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(2, 4, 16), // Cone-shaped tree
    leafMaterial
  );
  foliage.position.set(x, 6, z);
  foliage.castShadow = true;

  scene.add(trunk);
  scene.add(foliage);
}

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation
const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta(); // Time elapsed since the last frame

  // Update fox animation if the fox is loaded
  if (foxMixer) {
    foxMixer.update(delta); // Update fox animation
  }

  animateSnow(); // Animate snowflakes falling

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
