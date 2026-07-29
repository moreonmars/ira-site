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
const tearPoint = new THREE.Vector3(0, 0, 1);
const tearUniforms = { tearAmount: { value: 0 }, tearPoint: { value: tearPoint } };
material.onBeforeCompile = (shader) => {
  shader.uniforms.tearAmount = tearUniforms.tearAmount;
  shader.uniforms.tearPoint = tearUniforms.tearPoint;
  shader.vertexShader = `varying vec3 vLocalPosition;\n${shader.vertexShader}`;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    "#include <begin_vertex>\n vLocalPosition = transformed;"
  );
  shader.fragmentShader = `varying vec3 vLocalPosition;\nuniform float tearAmount;\nuniform vec3 tearPoint;\n${shader.fragmentShader}`;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <clipping_planes_fragment>",
    `#include <clipping_planes_fragment>
      float tearDot = dot(normalize(vLocalPosition), normalize(tearPoint));
      float tearNoise = sin(vLocalPosition.x * 17.0 + vLocalPosition.y * 23.0) * 0.018;
      float tearLimit = mix(1.12, 0.76, tearAmount) + tearNoise;
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

const fragmentCount = isMobile ? 8 : 14;
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
    -0.18, -0.065, 0,
    0.16, -0.075, 0,
    0.08, 0.09, 0,
  ], 3));
  shardGeometry.computeVertexNormals();
  const shard = new THREE.Mesh(shardGeometry, fragmentMaterial);
  shard.visible = false;
  fragmentGroup.add(shard);
  fragmentShards.push({ mesh: shard, velocity: new THREE.Vector3(), normal: new THREE.Vector3(), scale: 1, spin: 0 });
}
fragmentGroup.visible = false;
scene.add(fragmentGroup);

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

  for (let index = 0; index < fragmentCount; index += 1) {
    const side = new THREE.Vector3(-tearPoint.y, tearPoint.x, 0).normalize();
    const offsetAlongTear = (index / Math.max(1, fragmentCount - 1) - 0.5) * 0.28;
    const x = (tearPoint.x + side.x * offsetAlongTear) * radius * inflation;
    const y = (tearPoint.y + side.y * offsetAlongTear) * radius * inflation;
    const z = (tearPoint.z + side.z * offsetAlongTear) * radius * inflation;
    const length = Math.max(0.001, Math.hypot(x, y, z));
    const directionX = x / length;
    const directionY = y / length;
    const directionZ = z / length;
    const speed = 0.45 + (Math.sin(index * 7.31) * 0.5 + 0.5) * 0.7;

    const shard = fragmentShards[index];
    shard.normal.set(directionX, directionY, directionZ);
    shard.mesh.position.set(x * inflation, y * inflation, z * inflation);
    shard.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), shard.normal);
    shard.scale = 0.42 + (Math.sin(index * 3.17) * 0.5 + 0.5) * 0.72;
    shard.mesh.scale.set(shard.scale * (0.95 + Math.sin(index) * 0.12), shard.scale * (0.55 + Math.cos(index * 1.7) * 0.16), 1);
    shard.mesh.rotation.z = index * 1.83;
    shard.mesh.visible = true;
    shard.velocity.set(
      directionX * speed + Math.sin(index * 2.7) * 0.35,
      directionY * speed + Math.cos(index * 4.1) * 0.35,
      directionZ * speed + Math.sin(index * 5.3) * 0.35
    );
    shard.spin = (Math.sin(index * 8.4) * 0.5 + 0.5) * 3.5 - 1.75;
  }
}

function updateFragments(delta) {
  if (!burstActive) return;
  for (const shard of fragmentShards) {
    shard.velocity.y -= delta * 0.55;
    shard.velocity.multiplyScalar(0.996);
    shard.mesh.position.addScaledVector(shard.velocity, delta);
    shard.mesh.rotateX(shard.spin * delta);
    shard.mesh.rotateY(shard.spin * 0.7 * delta);
    const stretch = 1 + burstProgress * 1.4;
    shard.mesh.scale.x = shard.scale * stretch;
  }
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
    tearUniforms.tearAmount.value = Math.min(1, burstProgress * 1.8);
    material.opacity = Math.max(0, 1 - Math.max(0, burstProgress - 0.28) * 1.4);
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
    const burstNoise = Math.sin(index * 12.9898) * 0.5 + 0.5;
    const burstForce = burstActive ? burstProgress * burstNoise * 0.24 : 0;
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
