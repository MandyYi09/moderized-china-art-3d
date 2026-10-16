import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const pages=await (await fetch('http://127.0.0.1:9223/json/list')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map(),errors=[];
ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1500,height:1050,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:5176/'});
for(let i=0;i<60;i++){if(await evaluate('!!window.cloudGate?.ready'))break;await new Promise(r=>setTimeout(r,500));}
assert(await evaluate('!!window.cloudGate?.ready'),'3D view did not initialize');
await evaluate("document.querySelector('#motion').click()");
await mkdir(new URL('../public/artwork/',import.meta.url),{recursive:true});
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../public/artwork/'+name,import.meta.url),Buffer.from(r.data,'base64'));}
await evaluate('document.fonts.ready.then(()=>true)');
for(let i=0;i<30;i++){if(await evaluate('!document.querySelector("#loading")'))break;await new Promise(r=>setTimeout(r,100));}
await screenshot('viewer-v2.png');
const originalCamera=await evaluate('cloudGate.camera.position.toArray()');
await evaluate("document.querySelector('[data-version=\"1\"]').click()");
for(let i=0;i<40;i++){if(await evaluate('cloudGate.revision===1'))break;await new Promise(r=>setTimeout(r,100));}
assert.equal(await evaluate('cloudGate.revision'),1);assert.equal(await evaluate('cloudGate.stats.meshes'),45);
assert.deepEqual(await evaluate('cloudGate.camera.position.toArray()'),originalCamera);
await new Promise(r=>setTimeout(r,100));await screenshot('viewer-v1-comparison.png');
await evaluate("document.querySelector('[data-version=\"2\"]').click()");
assert.equal(await evaluate('cloudGate.revision'),2);assert.equal(await evaluate('cloudGate.sculpture.userData.revision'),2);

for(const view of ['crown','reverse']){
 await evaluate(`document.querySelector('[data-view="${view}"]').click()`);await new Promise(r=>setTimeout(r,1800));
 assert.equal(await evaluate(`document.querySelector('[data-view="${view}"]').classList.contains('active')`),true);await screenshot('viewer-v2-'+view+'.png');
}
await evaluate("document.querySelector('#clouds').click()");assert.equal(await evaluate('cloudGate.parts.clouds.visible'),false);await evaluate("document.querySelector('#clouds').click()");
await evaluate("document.querySelector('#wireframe').click()");assert.equal(await evaluate('cloudGate.parts.guardian.children.every(m=>m.material.wireframe)'),true);await evaluate("document.querySelector('#wireframe').click()");
await evaluate("document.querySelector('[data-light=moon]').click()");assert.equal(await evaluate("document.querySelector('[data-light=moon]').classList.contains('active')"),true);await evaluate("document.querySelector('[data-light=gallery]').click()");
await evaluate("document.querySelector('#concept-open').click()");assert.equal(await evaluate("document.querySelector('#concept-dialog').open"),true);await evaluate("document.querySelector('#concept-dialog').close()");
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await evaluate("document.querySelector('#reset').click()");await new Promise(r=>setTimeout(r,2000));
assert(await evaluate('document.documentElement.scrollWidth<=390'),'Mobile horizontal overflow');await screenshot('viewer-v2-mobile.png');
// A stationary chest must remain pixel-stable while atmosphere is enabled.
await evaluate("document.querySelector('#motion').checked || document.querySelector('#motion').click()");
const stability=await evaluate(`(async()=>{
 const {renderer,camera}=cloudGate;
 const point=new camera.position.constructor(0,5.08,.7).project(camera);
 const gl=renderer.getContext(),w=renderer.domElement.width,h=renderer.domElement.height;
 const x=Math.round((point.x+1)*w/2)-12,y=Math.round((point.y+1)*h/2)-12;
 const grab=()=>{const pixels=new Uint8Array(24*24*4);gl.readPixels(x,y,24,24,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;};
 const before=grab();await new Promise(r=>setTimeout(r,650));const after=grab();let changed=0;
 for(let i=0;i<before.length;i++)if(Math.abs(before[i]-after[i])>2)changed++;
 return {changedChannels:changed,totalChannels:before.length};
})()`);
assert(stability.changedChannels<stability.totalChannels*.01,'Stationary chest flickers with atmosphere enabled');
// Round-trip the actual exported GLB through the browser loader, including embedded textures.
const loaded=await evaluate(`(async()=>{const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');const result=await new GLTFLoader().loadAsync('/models/cloud-gate.glb');let meshes=0,mapped=0;result.scene.traverse(o=>{if(o.isMesh){meshes++;if(o.material.map)mapped++;}});return {meshes,mapped};})()`);const expectedMeshes=await evaluate('cloudGate.stats.meshes');assert.equal(loaded.meshes,expectedMeshes);assert.equal(loaded.mapped,expectedMeshes);
assert.equal(errors.length,0,errors.join('\n'));
console.log(JSON.stringify({status:'passed',viewpoints:['whole','crown','reverse'],cloudToggle:true,wireframe:true,lighting:true,conceptDialog:true,mobileOverflow:false,glbRoundtrip:loaded,stationaryChest:stability,runtimeErrors:errors},null,2));ws.close();
