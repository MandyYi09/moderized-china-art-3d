import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// A completely modeled, deterministic sculpture. Nothing here is an image plane.
const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const TAU = Math.PI * 2;
const materials = {
  gold: new THREE.MeshStandardMaterial({color:'#cba65b',metalness:.82,roughness:.3}),
  paleGold: new THREE.MeshStandardMaterial({color:'#efd5a0',metalness:.7,roughness:.26}),
  darkGold: new THREE.MeshStandardMaterial({color:'#715034',metalness:.75,roughness:.45}),
  jade: new THREE.MeshStandardMaterial({color:'#579f8d',metalness:.23,roughness:.3}),
  lightJade: new THREE.MeshStandardMaterial({color:'#a6ccb1',metalness:.15,roughness:.36}),
  blue: new THREE.MeshStandardMaterial({color:'#1c404c',metalness:.48,roughness:.3}),
  red: new THREE.MeshStandardMaterial({color:'#9f3934',metalness:.33,roughness:.36}),
  rose: new THREE.MeshStandardMaterial({color:'#bd776e',metalness:.18,roughness:.43}),
  ink: new THREE.MeshStandardMaterial({color:'#10262b',metalness:.2,roughness:.5}),
  ivory: new THREE.MeshStandardMaterial({color:'#e3ddbb',metalness:.1,roughness:.3}),
  gem: new THREE.MeshStandardMaterial({color:'#69e0c0',metalness:.5,roughness:.18,emissive:'#238d6b',emissiveIntensity:.25}),
  pearl: new THREE.MeshStandardMaterial({color:'#cef8d9',roughness:.2,metalness:.1,emissive:'#70c7a2',emissiveIntensity:.5}),
};
Object.entries(materials).forEach(([n,m])=>m.name=n);

class Sculptor {
  constructor(name) { this.name=name; this.parts={}; }
  add(geo,mat,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]) {
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot));
    geo.applyMatrix4(new THREE.Matrix4().compose(V(...pos),q,V(...scale)));
    if(geo.index) { const g=geo.toNonIndexed();geo.dispose();geo=g; }
    geo.deleteAttribute('uv');
    (this.parts[mat] ||= []).push(geo);
  }
  ball(pos,scale,mat='gold',segments=20) { this.add(new THREE.SphereGeometry(1,segments,14),mat,pos,scale); }
  torus(pos,r,t,mat='gold',rot=[0,0,0],arc=TAU) { this.add(new THREE.TorusGeometry(r,t,8,Math.max(20,Math.round(r*45)),arc),mat,pos,[1,1,1],rot); }
  rod(a,b,r,mat='gold',r2=r) {
    const p=V(...a),q=V(...b),d=q.clone().sub(p);
    const g=new THREE.CylinderGeometry(r2,r,d.length(),12);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0,1,0),d.normalize()));
    this.add(g,mat,p.add(q).multiplyScalar(.5).toArray());
  }
  tube(points,r,mat='gold',segments=48) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));
    this.add(new THREE.TubeGeometry(curve,segments,r,7,false),mat);
  }
  shape(points,depth,mat,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0]) {
    const s=new THREE.Shape();s.moveTo(...points[0]);points.slice(1).forEach(p=>s.lineTo(...p));s.closePath();
    const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:2,steps:1});
    this.add(g,mat,pos,scale,rot);
  }
  lathe(profile,mat,pos=[0,0,0],scale=[1,1,1]) {
    this.add(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),80),mat,pos,scale);
  }
  finish() {
    const group=new THREE.Group();group.name=this.name;
    Object.entries(this.parts).forEach(([mat,gs])=> {
      const geo=mergeGeometries(gs);gs.forEach(g=>g.dispose());geo.computeBoundingSphere();
      const mesh=new THREE.Mesh(geo,materials[mat]);mesh.name=`${this.name} · ${mat}`;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    });return group;
  }
}

function spiral(b,c,r,mat='gold',turns=1.45,flip=1) {
  const points=[];for(let i=0;i<=44;i++){const t=i/44,rr=r*(1-.9*t),a=t*TAU*turns;points.push([c[0]+Math.cos(a)*rr*flip,c[1]+Math.sin(a)*rr,c[2]+.02*t]);}
  b.tube(points,.014,mat,44);
}
function jewel(b,x,y,z,r=.13) {b.torus([x,y,z],r,.026,'gold');b.ball([x,y,z],[r*.82,r*.82,r*.4],'gem',16);}
function medallion(b,x,y,z,r) {
  b.ball([x,y,z],[r,r,.11],'gold');b.ball([x,y,z+.08],[r*.88,r*.88,.07],'blue');
  b.torus([x,y,z+.13],r*.8,.02,'paleGold');
  for(let j=0;j<8;j++){const a=j*TAU/8;b.ball([x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,z+.16],[r*.14,r*.14,.035],'gold',12);}
  jewel(b,x,y,z+.2,r*.27);
}
// Raised, gold-bordered lamellae with rivets, including rear-facing rows.
function scalePlate(b,x,y,z,w,h,mat,ry=0) {
  const outline=[[-w/2,h/2],[w/2,h/2],[w*.48,-h*.18],[w*.30,-h*.48],[0,-h*.58],[-w*.3,-h*.48],[-w*.48,-h*.18]];
  b.shape(outline,.035,'gold',[x,y,z],[1,1,1],[0,ry,0]);
  b.shape(outline,.04,mat,[x+Math.sin(ry)*.026,y+.006,z+Math.cos(ry)*.026],[.82,.8,1],[0,ry,0]);
  b.ball([x+Math.sin(ry)*.081,y+h*.22,z+Math.cos(ry)*.081],[.026,.026,.026],'paleGold',8);
}
function ribbon(b,points,width,mat,twist=0) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));const steps=130,verts=[],idx=[],left=[],right=[];
  for(let i=0;i<=steps;i++){
    const t=i/steps,p=curve.getPoint(t),tan=curve.getTangent(t);
    let side=V(-tan.y,tan.x,.4*Math.sin(t*TAU+twist)).normalize();
    side.applyAxisAngle(tan,Math.sin(t*TAU+twist)*.6);
    const w=width*(.35+.65*Math.pow(Math.sin(Math.PI*t),.5));
    const l=p.clone().addScaledVector(side,w/2),r=p.clone().addScaledVector(side,-w/2);
    left.push(l.toArray());right.push(r.toArray());verts.push(...l,...r);
    if(i<steps){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(idx);g.computeVertexNormals();
  b.add(g,mat);b.tube(left,.022,'gold',130);b.tube(right,.022,'gold',130);
}

function buildBase() {
  const b=new Sculptor('01 · Lotus dais');
  b.lathe([[0,0],[2.1,0],[2.2,.08],[2.2,.19],[2.08,.25],[2.08,.38],[1.94,.48],[1.92,.65],[1.7,.79],[0,.79]],'blue');
  [0.09,.23,.42,.66].forEach((y,i)=>b.torus([0,y,0],[2.19,2.12,2.0,1.9][i],.034,'gold',[Math.PI/2,0,0]));
  for(let i=0;i<64;i++){
    const a=i*TAU/64;b.ball([2.095*Math.sin(a),.32,2.095*Math.cos(a)],[.035,.045,.035],'paleGold',8);
  }
  for(let ring=0;ring<2;ring++) for(let i=0;i<18;i++){
    const a=(i+ring*.5)*TAU/18,rad=ring?1.42:1.85;
    const geo=new THREE.SphereGeometry(1,20,12);
    b.add(geo,ring?'lightJade':'rose',[Math.sin(a)*rad,.77+ring*.23,Math.cos(a)*rad],[.33,.19,.77],[-.18, a,0]);
    const pts=[];for(let j=0;j<=16;j++){const t=j/16,r=rad-.65+t*1.35;pts.push([Math.sin(a)*r,.8+ring*.23+Math.sin(t*Math.PI)*.16,Math.cos(a)*r]);}b.tube(pts,.017,'gold',16);
  }
  b.lathe([[0,.76],[1.3,.76],[1.5,.94],[1.48,1.05],[1.3,1.17],[0,1.17]],'jade');
  b.torus([0,1.075,0],1.43,.025,'gold',[Math.PI/2,0,0]);
  for(let i=0;i<12;i++){const a=i*TAU/12;b.ball([1.38*Math.sin(a),1.12,1.38*Math.cos(a)],[.04,.04,.04],'gold',8);}
  return b.finish();
}

function buildGuardian() {
  const b=new Sculptor('02 · The guardian');
  // Robe silhouette, visible behind the articulated armor.
  b.lathe([[0,2.35],[.8,2.35],[1.06,2.65],[1.1,3.1],[.93,3.6],[.67,4.35],[.63,4.6],[0,4.6]],'red',[0,0,-.12],[1,1,.62]);
  for(let i=0;i<26;i++){
    const a=i*TAU/26,pts=[];for(let j=0;j<=12;j++){const y=2.4+j*.17,r=1.03-(y-2.5)*.18;pts.push([Math.sin(a)*r,y,Math.cos(a)*r*.63-.12]);}
    b.tube(pts,.019,i%3?'darkGold':'gold',20);
  }
  // Boots, greaves, knee disks.
  [-1,1].forEach(s=>{
    b.ball([s*.62,1.49,.13],[.34,.32,.65],'blue');
    b.ball([s*.62,1.46,.55],[.29,.19,.4],'red');
    b.tube([[s*.62,1.5,.6],[s*.65,1.55,.9],[s*.69,1.7,1.02],[s*.71,1.81,.99]],.085,'gold');
    b.rod([s*.62,1.53,0],[s*.59,2.77,-.11],.245,'red',.32);
    for(let j=0;j<8;j++) {
      const y=1.7+j*.12;
      b.torus([s*.62,y,-.01],.26+j*.004,.025,'gold',[Math.PI/2,0,0]);
    }
    b.shape([[-.19,-.43],[.19,-.43],[.28,.39],[0,.56],[-.28,.39]],.09,'blue',[s*.61,2.02,.26]);
    spiral(b,[s*.61,2.08,.37],.17,'paleGold');medallion(b,s*.58,2.71,.32,.32);
    for(let j=0;j<5;j++) b.tube([[s*.85,1.55,.27+j*.08],[s*.63,1.65,.28+j*.08],[s*.41,1.55,.27+j*.08]],.018,'gold',16);
  });
  // Twelve flared skirt panels, double-sided detail around the whole waist.
  for(let panel=0;panel<12;panel++){
    const angle=panel*TAU/12;
    for(let row=0;row<6;row++) for(let col=0;col<3;col++){
      const a=angle+(col-1)*.15+(row%2)*.025,r=.74+(5-row)*.084;
      scalePlate(b,Math.sin(a)*r,2.91+row*.225,Math.cos(a)*r*.76,.19,.29,(panel+row)%3===0?'jade':'blue',a);
    }
  }
  // Front apron, gilded border and chasing.
  const apron=[[-.31,.8],[.31,.8],[.41,-.72],[.24,-.96],[0,-1.07],[-.24,-.96],[-.41,-.72]];
  b.shape(apron,.06,'gold',[0,3.3,.99]);b.shape(apron,.07,'red',[0,3.32,1.06],[.88,.94,1]);
  for(let i=0;i<6;i++){spiral(b,[(i%2?1:-1)*.12,2.63+i*.23,1.15],.13,'paleGold',1.1,i%2?1:-1);}
  // Torso and engraved gorget.
  b.ball([0,5.18,0],[.91,1.01,.5],'blue',32);
  for(let row=0;row<6;row++)for(let side=0;side<2;side++)for(let col=0;col<9;col++){
    const a=-1.18+col*.295+side*Math.PI,r=.89*Math.sqrt(1-((4.5+row*.23-5.17)/1.18)**2);
    scalePlate(b,Math.sin(a)*r,4.5+row*.23,Math.cos(a)*.49,.205,.29,row%3===0?'red':'blue',a);
  }
  b.lathe([[.62,4.12],[.76,4.15],[.77,4.36],[.65,4.42]],'red',[0,0,0],[1,1,.7]);
  for(let i=0;i<20;i++){const a=i*TAU/20;b.ball([.76*Math.sin(a),4.26,.54*Math.cos(a)],[.09,.09,.07],'gold',12);}
  medallion(b,0,4.24,.63,.25);
  b.tube([[-.83,5.73,.13],[-.62,5.54,.43],[0,5.31,.59],[.62,5.54,.43],[.83,5.73,.13]],.095,'gold');
  b.tube([[-.66,5.91,.22],[-.4,5.65,.46],[0,5.54,.52],[.4,5.65,.46],[.66,5.91,.22]],.073,'jade');
  medallion(b,0,5.55,.56,.31);
  // Shoulder shells and articulated arms. Right hand presents the pearl.
  [-1,1].forEach(s=>{
    const elbow=[s*1.38,4.91,.03],hand=s<0?[-1.98,4.55,.62]:[1.58,5.1,.91];
    b.rod([s*.93,5.58,0],elbow,.30,'red',.34);
    b.rod(elbow,hand,.23,'blue',.22);
    b.ball([s*1.0,5.67,0],[.66,.38,.61],'gold');
    b.ball([s*1.03,5.73,.015],[.6,.29,.57],'jade');
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){
      const a=-1.2+col*.6;
      scalePlate(b,s*1.03+Math.sin(a)*(.49+row*.045),5.52-row*.16,Math.cos(a)*.55,.22,.28,row%2?'red':'blue',a);
    }
    medallion(b,s*1.1,5.67,.57,.24);
    // Decorative dragon-like shoulder crest.
    b.tube([[s*.81,5.87,.0],[s*1.16,6.07,.0],[s*1.47,6.0,.02],[s*1.72,6.12,.0]],.07,'gold');
    for(let j=0;j<5;j++){const t=j/5,p=V(...elbow).lerp(V(...hand),t);b.ball(p.toArray(),[.255,.24,.25],j%2?'red':'gold',16);}
    b.ball(hand,[.23,.16,.21],'jade');
    // Four separately sculpted curled fingers and a thumb.
    for(let j=0;j<4;j++){
      const x=hand[0]-.15+j*.095;
      b.tube([[x,hand[1]-.01,hand[2]+.07],[x,hand[1]+.1,hand[2]+.21],[x,hand[1]+.23,hand[2]+.13]],.046,'jade',12);
    }
    b.tube([[hand[0]+s*.16,hand[1]-.05,hand[2]],[hand[0]+s*.26,hand[1]+.04,hand[2]+.1],[hand[0]+s*.22,hand[1]+.15,hand[2]+.14]],.065,'jade',12);
  });
  // Neck and sculpted face. Front is +Z.
  b.rod([0,5.85,0],[0,6.54,0],.26,'jade');
  b.ball([0,6.65,-.025],[.55,.73,.46],'ink',32);
  b.ball([0,6.67,.17],[.46,.6,.4],'jade',32);
  b.ball([0,6.35,.31],[.35,.32,.28],'jade');
  [-1,1].forEach(s=>{
    b.ball([s*.46,6.61,.08],[.14,.24,.13],'gold');
    b.ball([s*.47,6.64,.13],[.09,.16,.09],'jade');
    b.torus([s*.48,6.39,.1],.11,.028,'gold');
    b.ball([s*.265,6.55,.45],[.17,.13,.1],'lightJade');
    b.ball([s*.204,6.8,.491],[.18,.092,.054],'ink');
    b.ball([s*.207,6.797,.534],[.133,.049,.024],'ivory');
    b.ball([s*.18,6.798,.554],[.042,.049,.019],'ink',16);
    b.ball([s*.17,6.812,.573],[.012,.013,.009],'ivory',8);
    b.tube([[s*.05,6.91,.49],[s*.19,6.99,.5],[s*.35,6.95,.45],[s*.44,7.03,.31]],.05,'ink');
    b.tube([[s*.075,6.31,.54],[s*.26,6.35,.59],[s*.41,6.31,.57],[s*.6,6.45,.49]],.045,'ink');
    b.tube([[s*.08,6.33,.565],[s*.26,6.38,.605],[s*.45,6.39,.54],[s*.58,6.48,.48]],.012,'darkGold');
  });
  b.ball([0,6.68,.49],[.092,.2,.12],'jade');b.ball([0,6.54,.58],[.14,.095,.11],'lightJade');
  b.tube([[-.13,6.28,.534],[0,6.25,.59],[.13,6.28,.534]],.022,'red',20);
  // Flowing, individually grooved beard strands.
  for(let j=0;j<23;j++){
    const u=j/22*2-1,x=u*.31,len=.73*(1-Math.abs(u)*.44);
    b.tube([[x,6.19,.42],[x*.91,6.02,.57],[x*.63+.045,6.1-len,.54],[x*.2+.12,6.02-len,.49]],.042,'ink',22);
    b.tube([[x,6.18,.462],[x*.91,6.02,.612],[x*.63+.045,6.1-len,.582]],.008,'darkGold',16);
  }
  // Crown band and openwork flame blades.
  b.lathe([[.48,7.01],[.53,7.05],[.55,7.26],[.47,7.35]],'gold',[0,0,0],[1,1,.82]);
  for(let i=0;i<9;i++){
    const a=i*TAU/9;
    b.ball([.535*Math.sin(a),7.17,.44*Math.cos(a)],[.07,.085,.05],i%2?'red':'gem',12);
  }
  const flame=[[-.19,0],[-.21,.34],[-.13,.53],[-.07,.71],[.03,1.05],[.16,.77],[.09,.54],[.19,.32],[.16,.06],[0,-.07]];
  for(let i=0;i<7;i++){
    const a=(i-3)*.40,x=Math.sin(a)*.54,z=Math.cos(a)*.33;
    b.shape(flame,.05,'gold',[x,7.22,z],[.78,1.03-Math.abs(i-3)*.12,1],[0,a,-a*.35]);
    b.shape(flame,.052,i%2?'red':'jade',[x,7.28,z+.058],[.40,.7-Math.abs(i-3)*.065,1],[0,a,-a*.35]);
  }
  jewel(b,0,7.45,.45,.14);
  // Back medallion and braided hanging cords, rewards for orbiting.
  const back=new Sculptor('temporary'); // Back-facing ornament is authored separately then rotated.
  medallion(back,0,5.23,.52,.49);spiral(back,[0,5.23,.76],.24,'gold',2);
  const backGroup=back.finish();backGroup.rotation.y=Math.PI;
  backGroup.updateMatrixWorld(true);
  backGroup.children.forEach(m=>b.add(m.geometry.clone().applyMatrix4(m.matrixWorld),m.material.name));
  for(let s of [-1,1]) b.tube([[s*.42,5.76,-.4],[s*.54,4.9,-.59],[s*.35,4.2,-.73],[s*.63,3.65,-.77]],.042,'gold');
  return b.finish();
}

function buildHalo(){
  const b=new Sculptor('03 · Celestial gate');const cy=5.6,z=-.88;
  b.torus([0,cy,z],2.83,.062,'gold');b.torus([0,cy,z],2.66,.025,'paleGold');b.torus([0,cy,z],2.98,.025,'darkGold');
  for(let i=0;i<72;i++){
    const a=i*TAU/72,r=i%6===0?2.98:2.88;
    b.rod([Math.sin(a)*2.68,cy+Math.cos(a)*2.68,z],[Math.sin(a)*r,cy+Math.cos(a)*r,z],i%6===0?.024:.012,'gold');
    if(i%6===0){b.ball([Math.sin(a)*2.83,cy+Math.cos(a)*2.83,z+.06],[.075,.075,.045],'gem',12);}
  }
  for(let i=0;i<15;i++) {
    const a=(-1.25+i/14*2.5),x=Math.sin(a)*3.04,y=cy+Math.cos(a)*3.04;
    const flame=[[-.075,0],[-.10,.22],[0,.53],[.055,.29],[.12,.18],[.09,0]];
    b.shape(flame,.03,'gold',[x,y,z],[1,1,1],[0,0,-a]);
  }
  // Inner constellation: fine arcs surrounding the crown.
  b.torus([0,6.73,-.8],1.18,.016,'gold');
  for(let i=0;i<16;i++){const a=i*TAU/16;b.ball([Math.sin(a)*1.18,6.73+Math.cos(a)*1.18,-.8],[.026,.026,.026],'paleGold',8);}
  return b.finish();
}

function buildStaff(){
  const b=new Sculptor('04 · Moon staff');const x=-2.01,z=.71;
  b.rod([x,1.22,z],[x,7.29,z],.057,'ink');
  for(let j=0;j<44;j++){b.torus([x,1.36+j*.125,z],.066,.015,j%4?'gold':'jade',[Math.PI/2,0,0]);}
  b.ball([x,1.2,z],[.11,.16,.11],'gold');b.ball([x,7.27,z],[.14,.16,.14],'gold');
  b.torus([x,7.68,z],.42,.065,'gold',[0,0,-Math.PI*.2],Math.PI*1.4);
  b.ball([x,7.69,z],[.2,.2,.2],'pearl',24);
  b.torus([x,7.69,z],.28,.012,'gold',[.5,.3,0]);
  for(let s of [-1,1]){
    b.tube([[x+s*.27,7.33,z],[x+s*.39,7.05,z],[x+s*.3,6.78,z]],.023,'gold');
    b.ball([x+s*.3,6.76,z],[.06,.09,.06],'red');
    for(let k=0;k<5;k++)b.tube([[x+s*.3+(k-2)*.021,6.7,z],[x+s*.31+(k-2)*.024,6.35,z+.025]],.012,'red',12);
  }
  // Offering orb and its open lattice cage.
  b.ball([1.6,5.52,1.02],[.3,.3,.3],'pearl',32);
  for(let i=0;i<3;i++) b.torus([1.6,5.52,1.02],.35,.018,'gold',[i*.8,i*1.05,.3]);
  return b.finish();
}

function buildRibbons(){
  const b=new Sculptor('05 · Wind ribbons');
  ribbon(b,[[-.55,5.9,-.15],[-1.52,6.45,-.2],[-2.61,6.3,.12],[-3.05,5.51,.46],[-2.49,5.13,.78],[-1.58,5.68,.68],[-1.75,4.47,.33],[-2.9,3.57,.5],[-2.9,2.85,1.01],[-1.8,2.99,1.26],[-1.2,2.33,1.1],[-1.74,1.82,.83]],.4,'jade');
  ribbon(b,[[.56,5.9,-.1],[1.51,6.41,-.05],[2.64,6.68,.13],[3.02,6.08,.35],[2.48,5.69,.83],[2.03,6.12,.83],[2.26,4.88,.45],[3.1,4.15,.58],[3.18,3.48,1.08],[2.64,3.17,1.22],[1.72,3.45,1.15],[1.5,2.59,1.28],[2.29,2.07,1.03]],.38,'lightJade',1.2);
  ribbon(b,[[.1,4.18,.74],[.6,3.82,1.28],[.95,2.77,1.32],[.62,1.99,1.24],[.02,1.76,1.45],[-.42,2.0,1.54]],.17,'red',.3);
  ribbon(b,[[-.22,4.14,.72],[-.82,3.8,1.15],[-1.0,3.05,1.2],[-.48,2.79,1.31],[-.22,2.43,1.4]],.16,'lightJade',.2);
  const group=b.finish();group.traverse(o=>{if(o.isMesh)o.material.side=THREE.DoubleSide;});return group;
}

function cloud(b,x,y,z,size,mat,flip=1) {
  const points=[[-.94,-.13,.38],[-.55,.06,.42],[-.2,.27,.47],[.23,.20,.37],[.56,-.02,.31],[.87,-.16,.24],[-.13,-.22,.44]];
  points.forEach(([dx,dy,r])=>b.ball([x+dx*size*flip,y+dy*size,z],[r*size,r*size*.65,size*.22],mat,20));
  for(let i=0;i<3;i++)spiral(b,[x+(-.5+i*.46)*size*flip,y+(i===1?.16:0)*size,z+size*.205],size*(i===1?.27:.20),'gold',1.27,flip);
  const pts=[[-1.15,-.2],[-.8,-.36],[0,-.43],[.79,-.34],[1.3,-.47]];
  b.tube(pts.map(([a,c])=>[x+a*size*flip,y+c*size,z]),.027*size,'gold');
}
function buildClouds(){
  const group=new THREE.Group();group.name='06 · Auspicious clouds';
  [[-2.5,1.66,-.4,1.05,'jade',1],[2.64,1.39,-.28,.95,'rose',-1],[-3.04,4.1,-.7,.68,'rose',1],[3.05,5.04,-.92,.64,'jade',-1],[-2.5,7.1,-1.3,.65,'rose',1],[2.25,7.91,-1.48,.72,'lightJade',-1],[-.46,8.64,-1.5,.64,'darkGold',1],[.25,1.21,-1.26,.72,'lightJade',-1]].forEach((c,i)=>{
    const b=new Sculptor(`Cloud ${i+1}`);cloud(b,...c);const g=b.finish();g.userData.phase=i*.9;group.add(g);
  });return group;
}

export function createSculpture(){
  const root=new THREE.Group();root.name='The Keeper of the Cloud Gate';
  const parts={pedestal:buildBase(),guardian:buildGuardian(),halo:buildHalo(),staff:buildStaff(),ribbons:buildRibbons(),clouds:buildClouds()};
  Object.values(parts).forEach(p=>root.add(p));
  root.userData={title:'The Keeper of the Cloud Gate',description:'An original celestial guardian inspired by the supplied Chinese guardian paintings. Procedurally sculpted as real 3D geometry.',author:'Original project artwork',units:'meters (artistic scale)'};
  return {root,parts,materials};
}
