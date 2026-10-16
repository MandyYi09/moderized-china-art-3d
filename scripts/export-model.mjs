import './png-canvas.mjs';
import { writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as THREE from 'three';
import {readReferencePNG} from './read-reference-png.mjs';
import { createSculpture, setReferenceTexture } from '../src/sculpture.js';
// GLTFExporter expects the browser FileReader interface for its binary buffers.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}
  readAsDataURL(blob){blob.arrayBuffer().then(buffer=>{this.result=`data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;this.onloadend?.();});}
};
const ref=await readReferencePNG(new URL('../public/artwork/cloud-gate-concept.png',import.meta.url));
setReferenceTexture(new THREE.DataTexture(ref.data,ref.width,ref.height,THREE.RGBAFormat));
const {root}=createSculpture();
const binary=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
const output=new URL('../public/models/cloud-gate.glb',import.meta.url);
await writeFile(output,Buffer.from(binary));
console.log(`Exported ${output.pathname} (${(binary.byteLength/1024/1024).toFixed(1)} MB)`);
