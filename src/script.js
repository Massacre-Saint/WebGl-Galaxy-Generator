import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

// Global Variables
let canvas;
let scene;
let camera;
let renderer;
let controls;
let gui;
let starPositions;
let starColors;
let colorInside;
let colorOutside;

let galaxyGeometry = null;
let particlesMaterial = null;
let points = null;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const galaxyParams = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessLevel: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
};

function createScene() {
  // Scene Setup
  canvas = document.querySelector('canvas.webgl');
  scene = new THREE.Scene();

  // The X axis is red. The Y axis is green. The Z axis is blue.
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Camera Setup
  const fov = 75;
  const aspect = sizes.width / sizes.height;
  const near = 0.1;
  const far = 100;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3, 3, 3);

  // Renderer Setup
  renderer = new THREE.WebGL1Renderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);

  // To help blurr and upscales based on HiDPI
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function destroyGalaxy() {
  galaxyGeometry.dispose();
  particlesMaterial.dispose();
  scene.remove(points);
}

function cartesianPlotitng(i) {
  // For every star
  const i3 = i * 3; // Needed because starPositions array is * 3
  const radius = Math.random() * galaxyParams.radius; // Creates a number 0 <= radius
  const spinAngle = radius * galaxyParams.spin;

  // Ensures the index will be placed evenly every time within the axis
  const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;

  // Create a random, more scattered pattern.
  const randomX = (Math.random() ** galaxyParams.randomnessLevel) * (Math.random() < 0.5 ? 1 : -1);
  const randomY = (Math.random() ** galaxyParams.randomnessLevel) * (Math.random() < 0.5 ? 1 : -1);
  const randomZ = (Math.random() ** galaxyParams.randomnessLevel) * (Math.random() < 0.5 ? 1 : -1);

  // Distrubutes star along the x, y, z
  starPositions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; // x
  starPositions[i3 + 1] = randomY; // y
  starPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ; // z

  // Color
  const mixedColor = colorInside.clone();
  mixedColor.lerp(colorOutside, radius / galaxyParams.radius);

  starColors[i3 + 0] = mixedColor.r;
  starColors[i3 + 1] = mixedColor.g;
  starColors[i3 + 2] = mixedColor.b;
}

function createMaterial() {
  // Material
  particlesMaterial = new THREE.PointsMaterial({
    size: galaxyParams.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(galaxyGeometry, particlesMaterial);
  scene.add(points);
}

function createGalaxy() {
  // Frees GPU memory if user manipulates GUI
  if (points !== null) {
    destroyGalaxy();
  }

  // Geometry
  galaxyGeometry = new THREE.BufferGeometry();

  // Vertices (x, y, z)
  /**
   * This helps ensure there are 3 vertices for every count/star
   * This is needed for the buffer attribute because geometry needs three vertices.
   */
  starPositions = new Float32Array(galaxyParams.count * 3);

  // starColors
  starColors = new Float32Array(galaxyParams.count * 3);
  colorInside = new THREE.Color(galaxyParams.insideColor);
  colorOutside = new THREE.Color(galaxyParams.outsideColor);

  for (let i = 0; i < galaxyParams.count; i += 1) {
    cartesianPlotitng(i);
  }

  // Tranform array into an attribute for BufferGeometry
  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  createMaterial();
}

function createControls() {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function createGUI() {
  gui = new GUI();

  // Options
  gui.add(galaxyParams, 'count').min(100).max(100000).step(100)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'size').min(0.008).max(0.015).step(0.001)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'radius').min(0.01).max(20).step(0.01)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'branches').min(2).max(20).step(1)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'spin').min(-5).max(5).step(1)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'randomness').min(-0).max(2).step(0.001)
    .onFinishChange(createGalaxy);
  gui.add(galaxyParams, 'randomnessLevel').min(1).max(10).step(0.001)
    .onFinishChange(createGalaxy);
  gui.addColor(galaxyParams, 'insideColor').onFinishChange(createGalaxy);
  gui.addColor(galaxyParams, 'outsideColor').onFinishChange(createGalaxy);
}

function init() {
  createScene();
  createGalaxy();
  createControls();
  animate();
  createGUI();
}

init();
