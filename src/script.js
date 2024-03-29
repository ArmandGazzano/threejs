import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Variables
let animationbool = false;
let wireframebool = false;
let meshbool = false;
let meshmaterialbool = false;
let meshtexturematerialbool = false;
let importbool = false;
let physicsbool = false;

let ship = null;

THREE.ColorManagement.enabled = false;

// BASE
const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const gltfloader = new GLTFLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

gltfloader.load("starwarsship/source/ship.gltf", (gltf) => {
  ship = gltf.scene;
  ship.scale.set(0.25, 0.25, 0.25);
});

// Physics
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, -9.82, 0);

// Default material
const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.defaultContactMaterial = defaultContactMaterial;

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/**
 * Utils
 */
let objectsToUpdate = [];

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const createSphere = (radius, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Sphere(radius);

  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  // body.addEventListener("collide", playHitSound);
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
};

// Create box
const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
const boxMaterial = new THREE.MeshStandardMaterial({});
const boxPhongMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
var texture = textureLoader.load("textures/diamond.png");
const textureMaterial = new THREE.MeshLambertMaterial({
  map: texture,
});

const createBox = (width, height, depth, position) => {
  // Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  // Cannon.js body
  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );

  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: shape,
    material: defaultMaterial,
  });
  body.position.copy(position);
  world.addBody(body);

  // Save in objects
  objectsToUpdate.push({ mesh, body });
};

// createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })

const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
// mesh.position.y += 0.5;
// scene.add(mesh);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

document.getElementById("basic_scene").addEventListener("click", () => {
  if (!meshbool) {
    scene.add(mesh);
  } else {
    scene.remove(mesh);
  }

  meshbool = !meshbool;
});
document.getElementById("cube_material").addEventListener("click", () => {
  if (!meshmaterialbool) {
    mesh.material = boxPhongMaterial;
  } else {
    mesh.material = boxMaterial;
  }
  meshmaterialbool = !meshmaterialbool;
});
document.getElementById("texture").addEventListener("click", () => {
  if (!meshtexturematerialbool) {
    mesh.material = textureMaterial;
  } else {
    mesh.material = boxMaterial;
  }
  meshtexturematerialbool = !meshtexturematerialbool;
});
document.getElementById("wireframe").addEventListener("click", () => {
  wireframebool = !wireframebool;
  mesh.material.wireframe = wireframebool;
});
document.getElementById("basic_animation").addEventListener("click", () => {
  animationbool = !animationbool;
});
document.getElementById("import").addEventListener("click", () => {
  if (!importbool) {
    scene.add(ship);
  } else {
    scene.remove(ship);
  }
  importbool = !importbool;
});
document.getElementById("physics").addEventListener("click", () => {
  if (!physicsbool) {
    scene.add(floor);
  } else {
    scene.remove(floor);
    objectsToUpdate.forEach((obj) => scene.remove(obj));
    objectsToUpdate = [];
    scene.children = scene.children.filter((a) => !a.isMesh);
  }
  physicsbool = !physicsbool;
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  if (animationbool) {
    mesh.rotation.y += deltaTime;
  }

  // console.log(Math.trunc(deltaTime * 10000));
  if (physicsbool && Math.trunc(deltaTime * 10000) % 9 == 0) {
    createSphere(
      Math.random(),
      new THREE.Vector3(Math.random() * 8 - 4, 5, Math.random() * 8 - 4)
    );
  }

  // Update physics
  world.step(1 / 60, deltaTime, 3);

  for (const object of objectsToUpdate) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
