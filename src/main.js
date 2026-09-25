import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createSculpture } from './sculpture.js';

const $=s=>document.querySelector(s);
const stage=$('#stage');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const state={motion:!reducedMotion,lighting:'gallery',ready:false};
$('#motion').checked=state.motion;
let renderer,scene,camera,controls,sculpture,parts,particles;
let tween=null;
const views={
  whole:{label:'The complete work',position:[.8,5.2,18.5],target:[0,4.45,0]},
  crown:{label:'Crown & countenance',position:[1.3,7.2,6.3],target:[0,6.8,.1],title:'A crown of celestial fire',body:'Seven openwork flames rise above a jade countenance. A gilded constellation frames the guardian’s gaze.'},
  armor:{label:'The gilded armor',position:[3.5,5.5,7.2],target:[0,4.8,.25],title:'A thousand small defenses',body:'Gold-bordered lamellae overlap around the body. Raised spirals and jade cabochons punctuate the lacquered armor.'},
  lotus:{label:'Above the lotus',position:[4.9,3.2,7.3],target:[0,1.65,0],title:'Where earth meets cloud',body:'Two rings of rose and celadon petals support the guardian. Each leaf carries a fine golden vein.'},
  reverse:{label:'The unseen side',position:[-3,5.7,-13],target:[0,4.7,0],title:'Made to be circled',body:'The reverse reveals a chased medallion, braided gold cords, and armor that continues around the sculpture.'},
};
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function homeDistance(){const aspect=stage.clientWidth/stage.clientHeight;return Math.max(16.0,8.15/(2*Math.tan(THREE.MathUtils.degToRad(34)/2)*aspect))*1.12;}
function showView(key,instant=false){
  if(!state.ready)return;
  const view=views[key],pos=new THREE.Vector3(...view.position),target=new THREE.Vector3(...view.target);
  if(key==='whole'){pos.z=homeDistance();pos.y=5.15;}
  if(key==='crown'&&stage.clientWidth<330)pos.z=7.5;
  if(instant||reducedMotion){camera.position.copy(pos);controls.target.copy(target);controls.update();tween=null;}
  else tween={start:performance.now(),from:camera.position.clone(),to:pos,oldTarget:controls.target.clone(),target};
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===key));
  $('#view-label').textContent=view.label;
  $('#annotation').hidden=!view.title;
  if(view.title){$('#annotation-title').textContent=view.title;$('#annotation-body').textContent=view.body;$('#annotation-number').textContent=String(Object.keys(views).indexOf(key)+1).padStart(2,'0');}
  controls.autoRotate=false;$('#rotate').checked=false;
}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}

async function init(){
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  stage.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D model of The Keeper of the Cloud Gate');
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#152820',.016);
  camera=new THREE.PerspectiveCamera(34,1,.05,100);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=2;controls.maxDistance=34;controls.maxPolarAngle=Math.PI*.87;controls.autoRotateSpeed=.42;controls.zoomSpeed=.75;controls.panSpeed=.7;controls.target.set(0,4.4,0);
  controls.addEventListener('start',()=>{tween=null;});
  const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const envTarget=pmrem.fromScene(environment,.04);scene.environment=envTarget.texture;scene.environmentIntensity=.45;environment.dispose();pmrem.dispose();
  const ambient=new THREE.HemisphereLight('#dce5c8','#284237',2.2);scene.add(ambient);
  const key=new THREE.DirectionalLight('#ffdea4',4.3);key.position.set(-5,11,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=10;key.shadow.camera.bottom=-7;key.shadow.normalBias=.045;key.shadow.bias=-.0001;scene.add(key);
  const fill=new THREE.DirectionalLight('#a5d9d0',2.3);fill.position.set(6,6,4);scene.add(fill);
  const rim=new THREE.DirectionalLight('#dcab66',4.6);rim.position.set(2,9,-5);scene.add(rim);
  const pearlLight=new THREE.PointLight('#9fe4bf',1.3,4);pearlLight.position.set(1.6,5.7,1.3);scene.add(pearlLight);
  const result=createSculpture();sculpture=result.root;parts=result.parts;scene.add(sculpture);
  // Soft contact shadow and a restrained museum plinth, separate from the artwork export.
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:'#000000',opacity:.24}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
  const positions=[],sizes=[];let seed=42;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<180;i++){positions.push((rand()-.5)*12,rand()*11,(rand()-.5)*8-2);sizes.push(rand());}
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  particles=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#d8c998',size:.019,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));particles.name='Ambient dust';scene.add(particles);
  let triangles=0,meshes=0;sculpture.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;meshes++;}});
  $('#model-stats').textContent=`${Math.round(triangles/1000)}k faces · Fully sculpted in 3D`;
  state.ready=true;resize();showView('whole',true);
  $('#loading').classList.add('finished');setTimeout(()=>$('#loading').remove(),600);
  // Exposed read-only diagnostics make geometry and runtime checks repeatable.
  window.cloudGate={scene,camera,renderer,controls,sculpture,parts,stats:{triangles,meshes},ready:true};
  const atmospheres={gallery:{key:'#ffdea4',fill:'#a5d9d0',rim:'#dcab66',sky:'#dce5c8',exposure:1.25},moon:{key:'#a6cbf3',fill:'#5eb9c9',rim:'#939dff',sky:'#9ab3d8',exposure:1.02},dawn:{key:'#ffd2a0',fill:'#d89788',rim:'#ffc16b',sky:'#efd6b3',exposure:1.3}};
  document.querySelectorAll('[data-light]').forEach(button=>button.addEventListener('click',()=>{
    const a=atmospheres[button.dataset.light];state.lighting=button.dataset.light;key.color.set(a.key);fill.color.set(a.fill);rim.color.set(a.rim);ambient.color.set(a.sky);renderer.toneMappingExposure=a.exposure;
    document.querySelectorAll('[data-light]').forEach(b=>b.classList.toggle('active',b===button));
    $('#app').style.background=state.lighting==='moon'?'radial-gradient(ellipse at 51% 48%,#263341 0%,#15252c 42%,#111b22 75%)':state.lighting==='dawn'?'radial-gradient(ellipse at 51% 48%,#40362c 0%,#282722 42%,#1b201e 75%)':'';
  }));
  let previous=performance.now(),elapsed=0;
  renderer.setAnimationLoop(now=>{
    const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(document.hidden)return;
    if(state.motion){elapsed+=dt;parts.clouds.children.forEach((g,i)=>{g.position.y=Math.sin(elapsed*.35+i*.9)*.055;});particles.rotation.y=elapsed*.008;pearlLight.intensity=1.3+Math.sin(elapsed*1.1)*.25;}
    if(tween){let t=Math.min((now-tween.start)/1350,1);t=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,t);controls.target.lerpVectors(tween.oldTarget,tween.target,t);if(t>=1)tween=null;}
    controls.update(dt);renderer.render(scene,camera);
  });
}

// All modal and document controls work independently of WebGL initialization.
['concept','about','help'].forEach(name=>{
  const dialog=$(`#${name}-dialog`);$(`#${name}-open`).addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
});
$('#reset').addEventListener('click',()=>showView('whole'));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('#rotate').addEventListener('change',e=>{if(controls){tween=null;controls.autoRotate=e.target.checked;}});
$('#motion').addEventListener('change',e=>{state.motion=e.target.checked;});
$('#clouds').addEventListener('change',e=>{if(parts)parts.clouds.visible=e.target.checked;});
$('#wireframe').addEventListener('change',e=>{if(sculpture)sculpture.traverse(o=>{if(o.isMesh)o.material.wireframe=e.target.checked;});});
function zoom(factor){if(!controls)return;tween=null;const offset=camera.position.clone().sub(controls.target);const distance=THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update();}
$('#zoom-in').addEventListener('click',()=>zoom(.8));$('#zoom-out').addEventListener('click',()=>zoom(1.25));
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#app').requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}});
$('#capture').addEventListener('click',()=>{
  if(!state.ready)return;
  try{renderer.render(scene,camera);const canvas=document.createElement('canvas');canvas.width=renderer.domElement.width;canvas.height=renderer.domElement.height;const ctx=canvas.getContext('2d');ctx.fillStyle=state.lighting==='moon'?'#15252c':state.lighting==='dawn'?'#282722':'#152520';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(renderer.domElement,0,0);canvas.toBlob(blob=>{if(!blob){toast('Could not capture this view.');return;}const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='cloud-gate-still.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast('Your view has been saved.');});}catch{toast('Could not capture this view. Please try again.');}
});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','BUTTON','A','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(e.key.toLowerCase()==='r')showView('whole');if(e.key.toLowerCase()==='w'){$('#wireframe').click();}if(e.code==='Space'){e.preventDefault();$('#motion').click();}});
new ResizeObserver(resize).observe(stage);
init().catch(error=>{
  console.error(error);
  const loading=$('#loading');if(loading){loading.innerHTML='<p>The 3D view could not open.</p><small>Enable hardware acceleration in your browser, then reload.</small><button id="fallback-concept" class="outline-button" style="width:200px;margin-top:24px">View the concept artwork ↗</button>';$('#fallback-concept').addEventListener('click',()=>$('#concept-dialog').showModal());}
});
