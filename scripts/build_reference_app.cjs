const fs = require('fs');
const path = require('path');

const bundle = fs.readFileSync('scratch_ref_bundle.js', 'utf8');

// The header import ends right before 'function ia('
const bodyStart = bundle.indexOf('function ia');
// The tail mount starts at 'jt.createRoot('
const tailStart = bundle.lastIndexOf('jt.createRoot');

let body = bundle.slice(bodyStart, tailStart);
body = body.replace('s.current=P', 's.current=P,typeof window!=="undefined"&&(window.__melaEngine=P)');


const header = `import React from 'react';
import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const N = React;
const e = React;
const jt = ReactDOM;

const Et = THREE.Scene;
const Nt = THREE.Color;
const Rt = THREE.FogExp2;
const Kt = THREE.PerspectiveCamera;
const Tt = THREE.WebGLRenderer;
const $t = THREE.SRGBColorSpace;
const _t = THREE.ACESFilmicToneMapping;
const qt = THREE.HemisphereLight;
const Jt = THREE.DirectionalLight;
const ct = THREE;
const Xt = THREE.Clock;
const Zt = THREE.Raycaster;
const Qt = THREE.Vector2;
const ht = THREE.BufferGeometry;
const Ht = THREE.BufferAttribute;
const dt = THREE.Points;
const mt = THREE.PointsMaterial;
const Ct = THREE.Float32BufferAttribute;
const ye = THREE.Vector3;
const ut = THREE.Group;
const we = THREE.Mesh;
const Pt = THREE.BoxGeometry;
const Pe = THREE.MeshStandardMaterial;
const pt = THREE.SphereGeometry;
const at = THREE.CylinderGeometry;
const At = THREE.PointLight;
const ea = THREE.MathUtils;
const It = THREE.TorusGeometry;
const ta = CSS3DRenderer;
const aa = CSS3DObject;
const Lt = THREE.InstancedMesh;
const zt = THREE.ConeGeometry;
const ft = THREE.MeshBasicMaterial;
const sa = THREE.Object3D;
const na = THREE.AdditiveBlending;
const oa = THREE.Quaternion;
const ra = THREE.Matrix4;

`;

const footer = `
export { Ja as MelaApp, ja as MelaEngine, Wa as AudioManager, Ya as FireworksEngine, Ua as WorldBuilder };
export default Ja;
`;

const fullCode = header + body + footer;
fs.writeFileSync(path.join(__dirname, 'src', 'MelaExperience.jsx'), fullCode, 'utf8');
console.log('Successfully generated src/MelaExperience.jsx (length: ' + fullCode.length + ')');
