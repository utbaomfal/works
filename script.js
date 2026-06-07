const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("game")
});

renderer.setSize(window.innerWidth, window.innerHeight);

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff, 1));

// GROUND
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshBasicMaterial({ color: 0x55aa55 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// RANDOM BLOCKS
for (let i = 0; i < 25; i++) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
  );

  box.position.set(
    (Math.random() - 0.5) * 60,
    1,
    (Math.random() - 0.5) * 60
  );

  scene.add(box);
}

/* =========================
   👤 PLAYER (ROBLOX STYLE)
========================= */

const player = new THREE.Group();
scene.add(player);

const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });

const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), bodyMat);
const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), bodyMat);
const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), bodyMat);
const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.3), bodyMat);
const legL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.4), bodyMat);
const legR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.4), bodyMat);

player.add(body, head, armL, armR, legL, legR);

let pos = new THREE.Vector3(0, 2, 5);
let velY = 0;
let grounded = false;

camera.position.set(0, 2, 5);

/* =========================
   CONTROLS
========================= */

const keys = {};
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

/* mouse look */
let yaw = 0;
let pitch = 0;

document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-1.2, Math.min(1.2, pitch));
  }
});

/* jump */
document.addEventListener("keydown", e => {
  if (e.code === "Space" && grounded) {
    velY = 0.25;
    grounded = false;
  }
});

/* =========================
   GAME LOOP
========================= */

let t = 0;

function animate() {
  requestAnimationFrame(animate);
  t += 0.1;

  // gravity
  velY -= 0.01;
  pos.y += velY;

  if (pos.y < 2) {
    pos.y = 2;
    velY = 0;
    grounded = true;
  }

  // movement
  const speed = 0.15;

  if (keys["w"]) {
    pos.x -= Math.sin(yaw) * speed;
    pos.z -= Math.cos(yaw) * speed;
  }
  if (keys["s"]) {
    pos.x += Math.sin(yaw) * speed;
    pos.z += Math.cos(yaw) * speed;
  }
  if (keys["a"]) {
    pos.x -= Math.cos(yaw) * speed;
    pos.z += Math.sin(yaw) * speed;
  }
  if (keys["d"]) {
    pos.x += Math.cos(yaw) * speed;
    pos.z -= Math.sin(yaw) * speed;
  }

  /* camera */
  camera.position.set(pos.x, pos.y + 1, pos.z);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  /* =========================
     AVATAR UPDATE + ANIMATION
  ========================= */

  player.position.set(pos.x, pos.y, pos.z);

  head.position.set(0, 1.2, 0);
  body.position.set(0, 0, 0);

  armL.position.set(-0.8, 0.3, 0);
  armR.position.set(0.8, 0.3, 0);

  legL.position.set(-0.3, -1, 0);
  legR.position.set(0.3, -1, 0);

  // walk animation
  const moving = keys["w"] || keys["a"] || keys["s"] || keys["d"];

  if (moving) {
    armL.rotation.x = Math.sin(t) * 0.6;
    armR.rotation.x = -Math.sin(t) * 0.6;
    legL.rotation.x = -Math.sin(t) * 0.6;
    legR.rotation.x = Math.sin(t) * 0.6;
  } else {
    armL.rotation.x = armR.rotation.x = 0;
    legL.rotation.x = legR.rotation.x = 0;
  }

  renderer.render(scene, camera);
}

animate();

/* resize */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
