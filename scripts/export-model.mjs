import { writeFile } from 'node:fs/promises';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createSculpture } from '../src/sculpture.js';
// GLTFExporter expects the browser FileReader interface for its binary buffers.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(buffer=>{this.result=buffer;this.onloadend?.();});}
  readAsDataURL(blob){blob.arrayBuffer().then(buffer=>{this.result=`data:${blob.type};base64,${Buffer.from(buffer).toString('base64')}`;this.onloadend?.();});}
};
const {root}=createSculpture();
const binary=await new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true});
const output=new URL('../public/models/cloud-gate.glb',import.meta.url);
await writeFile(output,Buffer.from(binary));
console.log(`Exported ${output.pathname} (${(binary.byteLength/1024/1024).toFixed(1)} MB)`);
