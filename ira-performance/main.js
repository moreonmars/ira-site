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
  color: 0xf2ece6,
  roughness: 0.32,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.35,
  transparent: true,
});
const tearPoint = new THREE.Vector3(0, 0, 1);
// Frozen copies captured at the instant the burst triggers — the shader reads
// only these, so the tear shape stops drifting even though `tearPoint` keeps
// tracking the live pointer for the press/indent effect.
const tearOrigin = new THREE.Vector3(0, 0, 1);
const tearAxis = new THREE.Vector3(1, 0, 0);
const tearUniforms = {
  tearAmount: { value: 0 },
  tearPoint: { value: tearOrigin },
  tearAxis: { value: tearAxis },
};
material.onBeforeCompile = (shader) => {
  shader.uniforms.tearAmount = tearUniforms.tearAmount;
  shader.uniforms.tearPoint = tearUniforms.tearPoint;
  shader.uniforms.tearAxis = tearUniforms.tearAxis;
  shader.vertexShader = `varying vec3 vLocalPosition;\n${shader.vertexShader}`;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    "#include <begin_vertex>\n vLocalPosition = transformed;"
  );
  shader.fragmentShader = `varying vec3 vLocalPosition;\nuniform float tearAmount;\nuniform vec3 tearPoint;\nuniform vec3 tearAxis;\n${shader.fragmentShader}`;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <clipping_planes_fragment>",
    `#include <clipping_planes_fragment>
      vec3 localDir = normalize(vLocalPosition);
      float tearDot = dot(localDir, normalize(tearPoint));
      float axisAlign = abs(dot(localDir, normalize(tearAxis)));
      float tearNoise = sin(vLocalPosition.x * 17.0 + vLocalPosition.y * 23.0) * 0.02
        + sin(vLocalPosition.x * 43.0 - vLocalPosition.z * 31.0 + vLocalPosition.y * 11.0) * 0.014;
      // Bias the opening lower along tearAxis so the hole elongates into a
      // slit first and only widens into a rounder hole as tearAmount grows,
      // instead of expanding as a perfect circle from frame one.
      float tearLimit = mix(1.12, 0.74, tearAmount) + tearNoise - axisAlign * 0.24 * tearAmount;
      if (tearAmount > 0.01 && tearDot > tearLimit) discard;`
  );
};
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

// Fewer, larger flaps read as torn latex peeling open; many small ones read
// as confetti/starburst — which is exactly the look we're moving away from.
const fragmentCount = isMobile ? 4 : 6;
const fragmentGroup = new THREE.Group();
const fragmentShards = [];
const fragmentMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf3eeee,
  roughness: 0.38,
  clearcoat: 0.22,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  depthWrite: true,
});
for (let index = 0; index < fragmentCount; index += 1) {
  const shardGeometry = new THREE.BufferGeometry();
  shardGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.32, -0.09, 0,
    0.30, -0.11, 0,
    0.16, 0.24, 0,
    -0.14, 0.22, 0,
  ], 3));
  shardGeometry.setIndex([0, 1, 2, 0, 2, 3]);
  shardGeometry.computeVertexNormals();
  const shard = new THREE.Mesh(shardGeometry, fragmentMaterial);
  shard.visible = false;
  fragmentGroup.add(shard);
  fragmentShards.push({
    mesh: shard,
    velocity: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    scale: 1,
    spin: 0,
    startAt: 0,
    curl: 0,
  });
}
fragmentGroup.visible = false;
// Parented to the sphere (not the scene) so the flaps rotate and move with
// it. sphere.rotation.y accumulates for the whole session and is never
// reset between inflate/burst cycles, so world-space shards would drift
// further from the actual tear location with every cycle the page stays open.
sphere.add(fragmentGroup);

const position = geometry.attributes.position;
const base = new Float32Array(position.array);
const velocity = new Float32Array(position.count * 3);

// Stable per-vertex pseudo-noise for subtle latex wrinkles at rest.
// Fades out as the surface stretches tight, so a fully inflated
// balloon reads as smooth/taut rather than wrinkled.
const wrinkleNoise = new Float32Array(position.count);
for (let index = 0; index < position.count; index += 1) {
  const offset = index * 3;
  const x = base[offset];
  const y = base[offset + 1];
  const z = base[offset + 2];
  wrinkleNoise[index] =
    Math.sin(x * 41.3 + y * 27.7 + z * 63.1) * 0.4 +
    Math.sin(x * 83.9 - y * 52.3 + z * 19.7) * 0.3 +
    Math.sin(y * 97.1 + z * 71.3 - x * 34.9) * 0.3;
}
const wrinkleAmplitude = radius * 0.01;
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
  tearPoint.copy(impact).normalize();
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
  fragmentGroup.visible = true;
  fragmentMaterial.opacity = 1;

  tearOrigin.copy(tearPoint);
  tearAxis.set(-tearOrigin.y, tearOrigin.x, 0);
  if (tearAxis.lengthSq() < 1e-6) tearAxis.set(1, 0, 0);
  tearAxis.normalize();

  for (let index = 0; index < fragmentCount; index += 1) {
    const spread = fragmentCount > 1 ? index / (fragmentCount - 1) - 0.5 : 0;
    const jitter = Math.sin(index * 12.37) * 0.05;
    const offsetAlongTear = spread * 0.24 + jitter;
    const x = (tearOrigin.x + tearAxis.x * offsetAlongTear) * radius * inflation;
    const y = (tearOrigin.y + tearAxis.y * offsetAlongTear) * radius * inflation;
    const z = (tearOrigin.z + tearAxis.z * offsetAlongTear) * radius * inflation;
    const length = Math.max(0.001, Math.hypot(x, y, z));
    const directionX = x / length;
    const directionY = y / length;
    const directionZ = z / length;

    const shard = fragmentShards[index];
    shard.normal.set(directionX, directionY, directionZ);
    shard.mesh.position.set(x, y, z);
    shard.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shard.normal);
    shard.scale = 0.55 + (Math.sin(index * 3.17) * 0.5 + 0.5) * 0.5;
    shard.mesh.scale.set(shard.scale * (0.9 + Math.sin(index) * 0.1), shard.scale * (0.7 + Math.cos(index * 1.7) * 0.15), 1);
    shard.mesh.rotation.z = spread * 1.1 + jitter * 2;
    // Stays put and invisible until its own staggered moment — so the flaps
    // peel open one after another as the tear widens, not all at once.
    shard.mesh.visible = false;
    shard.curl = 0;
    shard.startAt = 0.05 + Math.abs(spread) * 0.35 + Math.abs(jitter) * 0.3;
    // Mostly a slow outward drift, not a launch — gravity and curl do the rest.
    shard.velocity.set(
      directionX * 0.1 + Math.sin(index * 2.7) * 0.04,
      directionY * 0.1 - 0.04,
      directionZ * 0.1 + Math.sin(index * 5.3) * 0.04
    );
    shard.spin = (Math.sin(index * 8.4) * 0.5 + 0.5) * 1.7 - 0.6;
  }
}

function updateFragments(delta) {
  if (!burstActive) return;
  for (const shard of fragmentShards) {
    if (burstProgress < shard.startAt) continue;
    shard.mesh.visible = true;
    shard.curl = Math.min(1, shard.curl + delta * 1.1);
    shard.velocity.y -= delta * 1.1;
    shard.velocity.multiplyScalar(0.97);
    shard.mesh.position.addScaledVector(shard.velocity, delta);
    // Curling fold: rotates faster right after detaching, then settles.
    shard.mesh.rotateX(shard.spin * delta * (0.5 + shard.curl));
    shard.mesh.rotateY(shard.spin * 0.5 * delta);
    shard.mesh.scale.x = shard.scale * (1 - shard.curl * 0.3);
    shard.mesh.scale.y = shard.scale * (1 + shard.curl * 0.1);
  }
  fragmentMaterial.opacity = Math.max(0, 1 - Math.max(0, burstProgress - 0.5) * 2.2);
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
    burstProgress += delta / 1.6;
    // Eased curve (exponent > 1): the rip starts slow — like the initial
    // puncture — then accelerates as it tears open, instead of reaching full
    // size less than a third of the way through the burst.
    tearUniforms.tearAmount.value = Math.min(1, Math.pow(burstProgress, 1.6));
    material.opacity = Math.max(0, 1 - Math.max(0, burstProgress - 0.6) * 2.2);
    if (burstProgress >= 1) {
      resetSurface();
      burstActive = false;
      burstProgress = 0;
      performanceTime = 0;
      inflation = 1;
      material.opacity = 1;
      sphere.visible = true;
      tearUniforms.tearAmount.value = 0;
      fragmentMaterial.opacity = 0;
      fragmentGroup.visible = false;
      fragmentShards.forEach((shard) => { shard.mesh.visible = false; });
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
    // Bulge only near the tear itself, using the same smooth spatial noise as
    // the wrinkles. The old version used Math.sin(index * 12.9898), which is
    // essentially uncorrelated between neighboring vertices and — worse —
    // applied to the whole sphere, not just the rip. That's what made the
    // entire shell shred into incoherent jagged ribbons instead of tearing
    // locally.
    const tearDistance = burstActive
      ? Math.hypot(x - tearOrigin.x * radius, y - tearOrigin.y * radius, z - tearOrigin.z * radius)
      : Infinity;
    const tearFalloff = tearDistance < influence ? Math.pow(1 - tearDistance / influence, 2) : 0;
    const burstNoise = wrinkleNoise[index] * 0.5 + 0.5;
    const burstForce = burstActive ? burstProgress * burstNoise * 0.24 * tearFalloff : 0;
    const wrinkleFade = burstActive ? 0 : Math.max(0, 1 - strain);
    const wrinkle = wrinkleNoise[index] * wrinkleAmplitude * wrinkleFade;
    const targetX = inflationX - (x / radius) * maxIndent * falloff + (x / radius) * burstForce + (x / radius) * wrinkle;
    const targetY = inflationY - (y / radius) * maxIndent * falloff + (y / radius) * burstForce + (y / radius) * wrinkle;
    const targetZ = inflationZ - (z / radius) * maxIndent * falloff + (z / radius) * burstForce + (z / radius) * wrinkle;

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
