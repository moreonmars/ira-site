const container = document.getElementById("container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = window.innerWidth < 600 ? 7 : 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const isMobile = window.innerWidth < 600;
const radius = isMobile ? 0.85 : 1.3;
const geometry = new THREE.SphereGeometry(radius, isMobile ? 56 : 80, isMobile ? 40 : 56);
const material = new THREE.MeshPhysicalMaterial({
  color: 0xf7f7f7,
  roughness: 0.2,
  metalness: 0,
  clearcoat: 0.7,
  clearcoatRoughness: 0.16,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const fillLight = new THREE.HemisphereLight(0xffffff, 0x171717, 2.3);
scene.add(fillLight);
const keyLight = new THREE.PointLight(0xffffff, 18, 9, 2);
keyLight.position.set(-2.8, 2.8, 4.2);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xff5cad, 8, 7, 2);
rimLight.position.set(3, -1.8, 2.5);
scene.add(rimLight);

const position = geometry.attributes.position;
const base = new Float32Array(position.array);
const velocity = new Float32Array(position.count * 3);
const impact = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(0, 0);
let hasPointer = false;
let pressure = 0;
let targetPressure = 0;
let pointerX = 0;
let pointerY = 0;

function movePointer(x, y) {
  pointer.x = (x / window.innerWidth) * 2 - 1;
  pointer.y = -(y / window.innerHeight) * 2 + 1;
  pointerX = (x / window.innerWidth - 0.5) * 0.12;
  pointerY = -(y / window.innerHeight - 0.5) * 0.12;
  hasPointer = true;
  targetPressure = 1;
}

window.addEventListener("pointermove", (event) => movePointer(event.clientX, event.clientY), { passive: true });
window.addEventListener("pointerleave", () => { targetPressure = 0; }, { passive: true });

function updateImpact() {
  if (!hasPointer) return false;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(sphere, false);
  if (!hits.length) return false;
  impact.copy(hits[0].point);
  sphere.worldToLocal(impact);
  return true;
}

function deformSurface(hit) {
  pressure += (targetPressure - pressure) * 0.1;
  const influence = radius * 0.72;
  const maxIndent = radius * 0.28 * pressure;

  for (let index = 0; index < position.count; index += 1) {
    const offset = index * 3;
    const x = base[offset];
    const y = base[offset + 1];
    const z = base[offset + 2];
    const distance = hit ? Math.hypot(x - impact.x, y - impact.y, z - impact.z) : Infinity;
    const falloff = distance < influence ? Math.pow(1 - distance / influence, 2) : 0;
    const targetX = hit ? -(x / radius) * maxIndent * falloff : 0;
    const targetY = hit ? -(y / radius) * maxIndent * falloff : 0;
    const targetZ = hit ? -(z / radius) * maxIndent * falloff : 0;

    velocity[offset] += (targetX - (position.array[offset] - x)) * 0.11;
    velocity[offset + 1] += (targetY - (position.array[offset + 1] - y)) * 0.11;
    velocity[offset + 2] += (targetZ - (position.array[offset + 2] - z)) * 0.11;
    velocity[offset] *= 0.86;
    velocity[offset + 1] *= 0.86;
    velocity[offset + 2] *= 0.86;
    position.array[offset] += velocity[offset];
    position.array[offset + 1] += velocity[offset + 1];
    position.array[offset + 2] += velocity[offset + 2];
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

function animate() {
  requestAnimationFrame(animate);
  const hit = updateImpact();
  deformSurface(hit);
  sphere.rotation.y += 0.0025;
  sphere.position.x += (pointerX - sphere.position.x) * 0.045;
  sphere.position.y += (pointerY - sphere.position.y) * 0.045;
  keyLight.position.x += ((pointerX * 8 - keyLight.position.x) * 0.02);
  keyLight.position.y += ((pointerY * 8 + 2.8 - keyLight.position.y) * 0.02);
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = window.innerWidth < 600 ? 7 : 5;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
});
