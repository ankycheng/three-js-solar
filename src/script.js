/* eslint-disable no-undef, no-unused-vars */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Create renderer.
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

// Create scene.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141414);
// scene.background = new THREE.Color(0x333000);

// Create camera.
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.clientWidth / canvas.clientHeight
);
camera.position.set(0, 50, -50);
camera.lookAt(0, 0, 0);
scene.add(camera);


const starGeo = new THREE.SphereGeometry(0.1, 3, 3);
const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

const stars = new THREE.Group();
for (let i = 0; i < 100; i++) {
  const star = new THREE.Mesh(starGeo, starMat);
  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  stars.add(star);
}

scene.add(stars);

// create a group
const solar = new THREE.Group();
const sun = new THREE.Group();
const earth = new THREE.Group();

const radiusEarth = 1;
const distEarth = 50;

const radiusSun = 5;
const segSun = 16;
const planetSun = createPlanet(radiusSun, 0, 0, 0, segSun, 0x999933);
sun.add(planetSun);

const radiusMoon = 0.5;
const distMoon = 3;
const moonSeg = 8;
const moon = createPlanet(radiusMoon / 2, distMoon, 0, 0, moonSeg, 0x999999);
moon.position.x += distEarth;
// moon.position.set(earth.position.x + distMoon, 0, 0);
earth.add(moon);

const planet = createPlanet(radiusEarth, distEarth, 0, 0, 8, 0x3333ff);
earth.add(planet);

solar.add(sun);
solar.add(earth);

// // Second Scene
const canvasEarth = document.querySelector("#canvas-earth");
const rendererEarth = new THREE.WebGLRenderer({
  canvas: canvasEarth,
  antialias: true,
});
rendererEarth.setSize(canvasEarth.clientWidth, canvasEarth.clientHeight);

const cameraEarth = new THREE.PerspectiveCamera(
  75,
  canvasEarth.clientWidth / canvasEarth.clientHeight
);

planet.add(cameraEarth);
// earth.add(cameraEarth);
// cameraEarth.position.set(distEarth - radiusEarth, 0, 0);
cameraEarth.position.set(distEarth, 0, 0);
cameraEarth.lookAt(0, 0, 0);

let control = new OrbitControls(camera, renderer.domElement);
scene.add(solar);

//bloom renderer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
  1,
  1,
  0
);
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(canvas.clientWidth, canvas.clientHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const renderSceneEarth = new RenderPass(scene, cameraEarth);
const bloomPassEarth = new UnrealBloomPass(
  new THREE.Vector2(canvasEarth.clientWidth, canvasEarth.clientHeight),
  1,
  1,
  0
);
const bloomComposerEarth = new EffectComposer(rendererEarth);
bloomComposerEarth.setSize(canvasEarth.clientWidth, canvasEarth.clientHeight);
bloomComposerEarth.renderToScreen = true;
bloomComposerEarth.addPass(renderSceneEarth);
bloomComposerEarth.addPass(bloomPassEarth);
console.log(planet);
// Animation loop.
const tick = () => {
  control.update();
  sun.rotation.y += 0.005;
  earth.rotation.y -= 0.001;
  moon.rotation.y += 0.01;
  
  moon.children.forEach((child) => {
    child.rotation.y += 0.05;
  });

  // update rotation of the mesh and the camera
  planet.children.forEach((child) => {
    child.rotation.y -= 0.01;
  });
  // renderer.render(scene, camera);
  // rendererEarth.render(scene, cameraEarth);
  bloomComposer.render();
  bloomComposerEarth.render();

  requestAnimationFrame(tick);
};
tick();

// Window resize listener.
window.addEventListener("resize", () => {
  const w = window.innerWidth * 0.75;
  const h = window.innerHeight * 0.9;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  const w2 = window.innerWidth * 0.25;
  const h2 = window.innerHeight * 0.9;
  cameraEarth.aspect = w2 / h2;
  cameraEarth.updateProjectionMatrix();

  renderer.setSize(w, h);
  rendererEarth.setSize(w2, h2);
  bloomComposer.setSize(w, h);
  bloomComposerEarth.setSize(w2, h2);
});

function createPlanet(raduis, distX, distY, distZ, segment, color = 0x999999) {
  const planet = new THREE.Group();

  const sphereFillGeo = new THREE.SphereGeometry(
    raduis * 0.995,
    segment,
    segment
  );
  const fillMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.7,
  });
  const fillMesh = new THREE.Mesh(sphereFillGeo, fillMat);
  planet.add(fillMesh);
  fillMesh.position.set(distX, distY, distZ);

  const sphereGeo = new THREE.SphereGeometry(raduis, segment, segment);
  const edgesGeometry = new THREE.EdgesGeometry(sphereGeo);
  edgesGeometry.center();
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const planetWireframe = new THREE.LineSegments(edgesGeometry, material);
  planetWireframe.position.set(distX, distY, distZ);
  planet.add(planetWireframe);
  return planet;
}

const timeEl = document.querySelector("#time");

setInterval(() => {
  updateClock();
}, 1000);

function updateClock() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  timeEl.innerHTML = `${hours}:${minutes}:${seconds}`;
}
