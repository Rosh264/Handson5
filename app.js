import * as THREE from 'three';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Objects
const objects = [];
for (let i = 0; i < 15; i++) {
  const obj = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
  );

  obj.position.set(
    (Math.random() - 0.5) * 20,
    1,
    (Math.random() - 0.5) * 20
  );

  scene.add(obj);
  objects.push(obj);
}

// 🎮 CONTROLS
const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// 🔥 MOUSE LOOK (360°)
let yaw = 0;
let pitch = 0;

document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    // Limit vertical look
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    camera.rotation.set(pitch, yaw, 0);
  }
});

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(objects);

  if (hit.length > 0) {
    hit[0].object.material.color.set(Math.random() * 0xffffff);
  }
});

// Movement + Physics
let velocityY = 0;
let isJumping = false;

function animate() {

  const speed = 0.1;

  // Direction based movement
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, new THREE.Vector3(0,1,0));

  if (keys['w']) camera.position.add(direction.multiplyScalar(speed));
  if (keys['s']) camera.position.add(direction.multiplyScalar(-speed));
  if (keys['a']) camera.position.add(right.multiplyScalar(-speed));
  if (keys['d']) camera.position.add(right.multiplyScalar(speed));

  // Jump
  if (keys[' '] && !isJumping) {
    velocityY = 0.2;
    isJumping = true;
  }

  camera.position.y += velocityY;
  velocityY -= 0.01;

  if (camera.position.y <= 2) {
    camera.position.y = 2;
    isJumping = false;
  }

  // Rotate objects
  objects.forEach(obj => {
    obj.rotation.x += 0.01;
    obj.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});