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
  transparent: true,
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

const fragmentCount = isMobile ? 110 : 220;
const fragmentPosition = new Float32Array(fragmentCount * 3);
const fragmentVelocity = new Float32Array(fragmentCount * 3);
const fragmentGeometry = new THREE.BufferGeometry();
fragmentGeometry.setAttribute("position", new THREE.BufferAttribute(fragmentPosition, 3));
const fragmentMaterial = new THREE.PointsMaterial({
  color: 0xffb8dc,
  size: isMobile ? 0.035 : 0.045,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const fragments = new THREE.Points(fragmentGeometry, fragmentMaterial);
fragments.visible = false;
scene.add(fragments);

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
let performanceTime = 0;
let inflation = 1;
let burstProgress = 0;
let burstActive = false;

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

function resetSurface() {
  for (let index = 0; index < position.array.length; index += 1) {
    position.array[index] = base[index];
    velocity[index] = 0;
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

function triggerBurst() {
  if (burstActive) return;
  burstActive = true;
  burstProgress = 0.001;
  targetPressure = 0;
  fragments.visible = true;
  fragmentMaterial.opacity = 1;

  for (let index = 0; index < fragmentCount; index += 1) {
    const offset = index * 3;
    const source = (index * 17) % position.count;
    const sourceOffset = source * 3;
    const x = base[sourceOffset];
    const y = base[sourceOffset + 1];
    const z = base[sourceOffset + 2];
    const length = Math.max(0.001, Math.hypot(x, y, z));
    const directionX = x / length;
    const directionY = y / length;
    const directionZ = z / length;
    const speed = 1.35 + (Math.sin(index * 7.31) * 0.5 + 0.5) * 2.2;

    fragmentPosition[offset] = x * inflation;
    fragmentPosition[offset + 1] = y * inflation;
    fragmentPosition[offset + 2] = z * inflation;
    fragmentVelocity[offset] = directionX * speed + Math.sin(index * 2.7) * 0.35;
    fragmentVelocity[offset + 1] = directionY * speed + Math.cos(index * 4.1) * 0.35;
    fragmentVelocity[offset + 2] = directionZ * speed + Math.sin(index * 5.3) * 0.35;
  }
  fragmentGeometry.attributes.position.needsUpdate = true;
}

function updateFragments(delta) {
  if (!burstActive) return;
  for (let index = 0; index < fragmentCount; index += 1) {
    const offset = index * 3;
    fragmentVelocity[offset + 1] -= delta * 0.55;
    fragmentVelocity[offset] *= 0.996;
    fragmentVelocity[offset + 1] *= 0.996;
    fragmentVelocity[offset + 2] *= 0.996;
    fragmentPosition[offset] += fragmentVelocity[offset] * delta;
    fragmentPosition[offset + 1] += fragmentVelocity[offset + 1] * delta;
    fragmentPosition[offset + 2] += fragmentVelocity[offset + 2] * delta;
  }
  fragmentGeometry.attributes.position.needsUpdate = true;
  fragmentMaterial.opacity = Math.max(0, 1 - burstProgress * 1.05);
}

function deformSurface(hit, delta) {
  pressure += (targetPressure - pressure) * 0.1;
  const influence = radius * 0.72;
  const maxIndent = radius * 0.28 * pressure;
  const strain = Math.max(0, inflation - 1) / 0.3;
  if (!burstActive) {
    inflation = 1 + Math.min(0.3, performanceTime * 0.008) + Math.sin(performanceTime * 2.2) * 0.006;
    if (inflation > 1.285) triggerBurst();
  } else {
    burstProgress += delta / 1.15;
    material.opacity = Math.max(0, 1 - Math.max(0, burstProgress - 0.16) * 1.2);
    if (burstProgress >= 1) {
      resetSurface();
      burstActive = false;
      burstProgress = 0;
      performanceTime = 0;
      inflation = 1;
      material.opacity = 1;
      fragmentMaterial.opacity = 0;
      fragments.visible = false;
    }
  }

  for (let index = 0; index < position.count; index += 1) {
    const offset = index * 3;
    const x = base[offset];
    const y = base[offset + 1];
    const z = base[offset + 2];
    const distance = hit ? Math.hypot(x - impact.x, y - impact.y, z - impact.z) : Infinity;
    const falloff = distance < influence ? Math.pow(1 - distance / influence, 2) : 0;
    const inflationX = x * (inflation - 1);
    const inflationY = y * (inflation - 1);
    const inflationZ = z * (inflation - 1);
    const burstNoise = Math.sin(index * 12.9898) * 0.5 + 0.5;
    const burstForce = burstActive ? burstProgress * burstNoise * (1 + strain) : 0;
    const targetX = inflationX - (x / radius) * maxIndent * falloff + (x / radius) * burstForce;
    const targetY = inflationY - (y / radius) * maxIndent * falloff + (y / radius) * burstForce;
    const targetZ = inflationZ - (z / radius) * maxIndent * falloff + (z / radius) * burstForce;

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
  const delta = Math.min(0.05, clock.getDelta());
  performanceTime += delta;
  const hit = updateImpact();
  deformSurface(hit, delta);
  updateFragments(delta);
  sphere.rotation.y += 0.0025;
  sphere.position.x += (pointerX - sphere.position.x) * 0.045;
  sphere.position.y += (pointerY - sphere.position.y) * 0.045;
  keyLight.position.x += ((pointerX * 8 - keyLight.position.x) * 0.02);
  keyLight.position.y += ((pointerY * 8 + 2.8 - keyLight.position.y) * 0.02);
  renderer.render(scene, camera);
}

const clock = new THREE.Clock();
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.position.z = window.innerWidth < 600 ? 7 : 5;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
});
