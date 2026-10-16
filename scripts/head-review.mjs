import {connect} from './cdp.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {send,evaluate,close}=await connect();
await send('Emulation.setDeviceMetricsOverride',{width:1500,height:1050,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:5176/?view=crown&revision=3'});
for(let i=0;i<60;i++){if(await evaluate('!!window.cloudGate?.ready && !document.querySelector("#loading")'))break;await new Promise(r=>setTimeout(r,500));}
assert(await evaluate('!!window.cloudGate?.ready'));
await evaluate("if(document.querySelector('#motion').checked)document.querySelector('#motion').click();document.querySelector('#annotation').hidden=true");
const info=await evaluate(`(()=>{const mesh=cloudGate.parts.guardian.children.find(m=>m.material.name==='referenceFace');mesh.geometry.computeBoundingBox();return {depth:mesh.geometry.boundingBox.max.z-mesh.geometry.boundingBox.min.z,vertices:mesh.geometry.attributes.position.count,texture:!!mesh.material.map,headRevision:cloudGate.sculpture.userData.headRevision};})()`);
assert(info.depth>.25);assert(info.vertices>10000);assert(info.texture);assert.equal(info.headRevision,'3.0');
async function shot(name,position,target){await evaluate(`cloudGate.camera.position.set(${position.join(',')});cloudGate.controls.target.set(${target.join(',')});cloudGate.controls.update();cloudGate.renderer.render(cloudGate.scene,cloudGate.camera)`);await new Promise(r=>setTimeout(r,180));const r=await send('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../public/artwork/'+name,import.meta.url),Buffer.from(r.data,'base64'));}
await shot('head-v3-front.png',[.0,6.95,4.1],[0,6.8,.15]);
await shot('head-v3-three-quarter.png',[3.1,7.1,4.3],[0,6.8,.05]);
await evaluate(`(async()=>{const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');const result=await new GLTFLoader().loadAsync('/models/cloud-gate.glb');cloudGate.scene.remove(cloudGate.sculpture);cloudGate.scene.add(result.scene);return true;})()`);
await shot('head-v3-exported.png',[.0,6.95,4.1],[0,6.8,.15]);
console.log(JSON.stringify({status:'passed',...info,views:['front','three-quarter','exported GLB']},null,2));close();
