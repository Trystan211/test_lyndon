import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000022);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(10, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Ground (Snow)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Fog
scene.fog = new THREE.Fog(0xaaaaaa, 10, 50);

// Moonlight
const moonLight = new THREE.DirectionalLight(0xccccff, 0.5); // Slightly bluish light
moonLight.position.set(10, 30, -10);
moonLight.castShadow = true;
scene.add(moonLight);

// Ambient light
const ambientLight = new THREE.AmbientLight(0x888888, 0.4);
scene.add(ambientLight);

// Define a restricted area around the snowman where no objects should overlap
const snowmanBounds = new THREE.Box3(
  new THREE.Vector3(-2, 0, -2), // Min (x, y, z)
  new THREE.Vector3(2, 4, 2)    // Max (x, y, z)
);

// Helper function to check if a position is within the snowman bounds
const isPositionInSnowmanArea = (x, y, z) => {
  const position = new THREE.Vector3(x, y, z);
  return snowmanBounds.containsPoint(position);
};

// Trees (White Trunks and Frosted Leaves)
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;
  
  if (!isPositionInSnowmanArea(x, 3, z)) {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 6, 16),
      treeMaterial
    );
    trunk.position.set(x, 3, z);
    trunk.castShadow = true;

    const foliage = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      leafMaterial
    );
    foliage.position.set(trunk.position.x, trunk.position.y + 4, trunk.position.z);
    foliage.castShadow = true;

    scene.add(trunk);
    scene.add(foliage);
  }
}

// Mushrooms
const mushroomCapMaterial = new THREE.MeshStandardMaterial({ emissive: 0xff8888 });
const mushroomStemMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

for (let i = 0; i < 50; i++) {
  const x = Math.random() * 40 - 20;
  const z = Math.random() * 40 - 20;

  if (!isPositionInSnowmanArea(x, 0.25, z)) {
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

// Snowman
const snowman = new THREE.Group();

// Snowman Base
const base = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
base.position.y = 1.5;

// Snowman Middle
const middle = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
middle.position.y = 3;

// Snowman Head
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
head.position.y = 4.7;

// Snowman Features (Carrot Nose)
const nose = new THREE.Mesh(
  new THREE.ConeGeometry(0.1, 0.5, 8),
  new THREE.MeshStandardMaterial({ color: 0xff8800 })
);
nose.position.set(0, 4.7, 0.75);
nose.rotation.x = Math.PI / 2;

// Add to Snowman
snowman.add(base, middle, head, nose);
scene.add(snowman);

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Animation
const clock = new THREE.Clock();
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update fireflies
  fireflies.forEach(({ light, velocity }) => {
    light.position.add(velocity);
    if (light.position.y < 1 || light.position.y > 6) velocity.y *= -1;
    if (light.position.x < -20 || light.position.x > 20) velocity.x *= -1;
    if (light.position.z < -20 || light.position.z > 20) velocity.z *= -1;
  });

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

