import * as THREE from 'three';
const TAU=Math.PI*2;
const v=p=>new THREE.Vector3(...p);

// Swept tapered locks and tendrils: continuous surfaces, with pointed ends.
export function tendril(b,points,r,mat='gold',groove=0){
 const curve=new THREE.CatmullRomCurve3(points.map(v));const N=r<.02?16:30,R=r<.02?5:7,frames=curve.computeFrenetFrames(N,false),p=[],idx=[];
 for(let i=0;i<=N;i++){const t=i/N,c=curve.getPoint(t),rad=r*Math.pow(Math.max(.008,Math.sin((.08+t*.92)*Math.PI)),.65);
  for(let j=0;j<=R;j++){const a=j/R*TAU,rr=rad*(1+groove*Math.cos(a*5));const pt=c.clone().addScaledVector(frames.normals[i],Math.cos(a)*rr).addScaledVector(frames.binormals[i],Math.sin(a)*rr);p.push(...pt);if(i<N&&j<R){const k=i*(R+1)+j;idx.push(k,k+R+1,k+1,k+1,k+R+1,k+R+2);}}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();b.add(g,mat);
}

export function patch(b,fn,nu,nv,mat){
 const p=[],idx=[];for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){p.push(...fn(i/nu,j/nv));if(i<nu&&j<nv){const k=i*(nv+1)+j;idx.push(k,k+1,k+nv+1,k+1,k+nv+2,k+nv+1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();b.add(g,mat);
}

// Scroll relief is attached to the actual curved armor, rather than flat decals.
export function scroll(b,x,y,z,r,mat='gold',flip=1){
 const p=[];for(let i=0;i<=48;i++){let t=i/48,a=t*TAU*1.28,rr=r*(1-t*.92);p.push([x+Math.cos(a)*rr*flip,y+Math.sin(a)*rr,z+.018*Math.sin(t*Math.PI)]);}tendril(b,p,r*.12,mat);
 for(let i=0;i<3;i++){const t=.16+i*.18,a=t*TAU*1.28,rr=r*(1-t*.92),cx=x+Math.cos(a)*rr*flip,cy=y+Math.sin(a)*rr;
 tendril(b,[[cx,cy,z],[cx+r*.22*flip,cy+r*.22,z+.02],[cx+r*.12*flip,cy+r*.38,z]],r*.055,mat);}
}

export function beastMask(b,x,y,z,s=1){
 // Taotie-inspired invented armor ornament, with pierced mouth and curling brows.
 b.ball([x,y,z],[.28*s,.30*s,.10*s],'darkGold',24);
 for(let side of [-1,1]){
  b.ball([x+side*.18*s,y+.05*s,z+.09*s],[.16*s,.16*s,.09*s],'gold',24);
  tendril(b,[[x+side*.02*s,y+.18*s,z+.15*s],[x+side*.20*s,y+.25*s,z+.16*s],[x+side*.39*s,y+.16*s,z+.10*s],[x+side*.45*s,y+.33*s,z]],.065*s);
  b.ball([x+side*.12*s,y+.07*s,z+.19*s],[.065*s,.032*s,.027*s],'ink',14);
  b.ball([x+side*.11*s,y+.07*s,z+.215*s],[.022*s,.027*s,.015*s],'gem',12);
  scroll(b,x+side*.28*s,y-.02*s,z+.07*s,.17*s,'gold',side);
  tendril(b,[[x+side*.02*s,y-.09*s,z+.23*s],[x+side*.22*s,y-.04*s,z+.2*s],[x+side*.26*s,y-.20*s,z+.08*s]],.045*s);
  for(let j=0;j<3;j++)tendril(b,[[x+side*.12*s,y+.2*s,z],[x+side*(.25+j*.08)*s,y+(.3+j*.08)*s,z],[x+side*(.2+j*.13)*s,y+(.43+j*.1)*s,z]],.028*s);
 }
 b.ball([x,y-.02*s,z+.17*s],[.085*s,.095*s,.10*s],'gold');
 b.ball([x,y-.17*s,z+.10*s],[.135*s,.07*s,.055*s],'ink');
 for(let j=0;j<5;j++)b.ball([x+(j-2)*.045*s,y-.135*s,z+.158*s],[.018*s,.03*s,.014*s],'paleGold',10);
 tendril(b,[[x-.13*s,y-.22*s,z+.1*s],[x,y-.29*s,z+.17*s],[x+.13*s,y-.22*s,z+.1*s]],.04*s);
}

export function sculptFace(b){
 b.rod([0,5.87,0],[0,6.48,0],.27,'jade');
 b.ball([0,6.69,-.04],[.54,.69,.44],'ink',40);
 // Continuous face with integrated brow, nose, cheek planes and nasolabial folds.
 const g=new THREE.SphereGeometry(1,112,88),p=g.attributes.position;
 const gauss=(x,y,cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((y-cy)/sy)**2));
 for(let i=0;i<p.count;i++){
  const px=p.getX(i),py=p.getY(i),pz=p.getZ(i),y=6.68+py*.59;
  let x=px*.47*(.88+.12*(py+1)/2),z=.11+pz*.41;
  if(pz>0){let h=0;
   h+=.22*gauss(x,y,0,6.74,.082,.24)+.23*gauss(x,y,0,6.56,.13,.085);
   for(let s of [-1,1]){
    h+=.06*gauss(x,y,s*.12,6.56,.07,.06);
    h+=.09*gauss(x,y,s*.28,6.59,.13,.11);
    h+=.075*gauss(x,y,s*.22,6.91,.20,.075);
    h-=.07*gauss(x,y,s*.2,6.78,.13,.062);
    h-=.03*gauss(x,y,s*.17,6.41,.04,.16);
   }
   h+=.085*gauss(x,y,0,6.32,.22,.12);z+=h*Math.min(1,pz*3);
  }p.setXYZ(i,x,y,z);
 }g.computeVertexNormals();b.add(g,'jade');
 for(let s of [-1,1]){
  b.ball([s*.465,6.64,.04],[.105,.22,.12],'jade',28);
  tendril(b,[[s*.47,6.77,.15],[s*.51,6.68,.19],[s*.47,6.51,.16]],.024,'darkGold');
  b.torus([s*.48,6.42,.10],.105,.018,'gold');
  // Narrow almond eyes; the inner corner sits lower for a stern expression.
  const eye=new THREE.Shape();eye.moveTo(.064*s,6.76);eye.quadraticCurveTo(.2*s,6.83,.345*s,6.805);eye.quadraticCurveTo(.20*s,6.755,.064*s,6.76);
  b.add(new THREE.ExtrudeGeometry(eye,{depth:.022,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}), 'ivory',[0,0,.485]);
  b.ball([s*.18,6.786,.523],[.024,.023,.018],'darkGold',16);b.ball([s*.18,6.786,.539],[.009,.02,.011],'ink',12);
  tendril(b,[[s*.045,6.793,.53],[s*.18,6.875,.541],[s*.32,6.87,.49],[s*.40,6.94,.36]],.029,'ink');
  tendril(b,[[s*.07,6.735,.50],[s*.21,6.728,.51],[s*.34,6.795,.47]],.017,'jade');
  for(let j=0;j<7;j++)tendril(b,[[s*(.08+j*.035),6.876+j*.009,.51-j*.008],[s*(.18+j*.032),6.95+j*.008,.49-j*.011],[s*(.33+j*.019),7.02+j*.013,.33]],.012,'ink');
  b.ball([s*.079,6.526,.709],[.031,.017,.014],'ink',12);
  tendril(b,[[s*.12,6.49,.56],[s*.21,6.4,.53],[s*.24,6.31,.50]],.016,'darkGold');
  for(let j=0;j<6;j++)tendril(b,[[s*.045,6.405+j*.009,.61],[s*.23,6.39+j*.012,.62],[s*.4,6.43+j*.014,.55],[s*.51,6.57+j*.016,.38]],.019,'ink');
  for(let j=0;j<10;j++)tendril(b,[[s*.4,6.74-j*.028,.28],[s*.53,6.65-j*.032,.28],[s*.65,6.8-j*.04,.02]],.026,'ink');
 }
 b.tube([[-.12,6.325,.55],[0,6.306,.58],[.12,6.325,.55]],.014,'ink',20);
 // Full sweeping beard with tapered locks; warm highlights are fine strands, not bands.
 for(let j=0;j<48;j++){
  const u=j/47*2-1,x=u*.35,len=.99*(1-Math.abs(u)*.37),points=[[x,6.29,.42],[x*.99+.04,6.05,.60],[x*.6+.19,6.29-len*.78,.59],[.26+x*.15,6.25-len,.41]];
  tendril(b,points,.033,'ink',.1);
  if(j%2===0)tendril(b,points.map(p=>[p[0]+.005,p[1],p[2]+.03]),.004,'darkGold');
 }
 // Fine forehead engraving echoes the painted reference's furrowed expression.
 for(let s of [-1,1])tendril(b,[[s*.02,6.9,.57],[s*.08,7.05,.48],[s*.20,7.1,.40]],.012,'darkGold');
}

export function flame(b,x,y,z,w,h,mat='gold',tilt=0){
 const s=new THREE.Shape();s.moveTo(-.2,0);s.bezierCurveTo(-.55,.29,.28,.4,-.03,.69);s.bezierCurveTo(-.18,.83,.05,.92,.12,1.08);s.bezierCurveTo(.39,.65,.05,.6,.25,.37);s.bezierCurveTo(.53,.1,.17,-.1,-.2,0);
 b.add(new THREE.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelSize:.026,bevelThickness:.022,bevelSegments:3,curveSegments:22}),mat,[x,y,z],[w,h,1],[0,0,tilt]);
}
export function crown(b){
 b.lathe([[.46,7.04],[.55,7.09],[.55,7.28],[.48,7.36]],'gold',[0,0,0],[1,1,.84]);
 for(let j=0;j<11;j++){const a=(j-5)*.28,x=Math.sin(a)*.54,z=Math.cos(a)*.455;scroll(b,x,7.19,z,.08,'paleGold',j%2?1:-1);}
 for(let j=0;j<7;j++){let a=(j-3)*.34,x=Math.sin(a)*.67,z=Math.cos(a)*.30,h=1.05-Math.abs(j-3)*.19;flame(b,x,7.25,z,.63,h,'gold',-a*.45);flame(b,x,7.29,z+.075,.35,h*.8,'red',-a*.45);}
 for(let s of [-1,1]){
  flame(b,s*.67,6.98,-.1,.75,1.1,'red',-s*.35);flame(b,s*.69,7.03,-.04,.40,1.05,'gold',-s*.35);
  scroll(b,s*.32,7.43,.43,.19,'gold',s);
 }
 for(let [y,r] of [[7.32,.13],[7.67,.16]]){b.ball([0,y,.40],[r*1.3,r*1.55,.08],'gold');b.ball([0,y,.49],[r,r*1.23,.055],'gem');b.torus([0,y,.48],r*1.22,.022,'paleGold');}
}

export function drapery(b){
 // Scalloped cloth sweeps create broad, weighty layered silhouettes.
 for(let s of [-1,1])for(let layer=0;layer<3;layer++){
  const fn=(u,t)=>{const a=-.65+u*2.45,spread=.42+t*.77;return [s*(.78+Math.sin(a)*spread),5.82-t*(1.25+layer*.27)+Math.sin(u*Math.PI)*.22-Math.sin(u*4.7+.6)*t*.27,Math.cos(a)*(.59+t*.22)-.24+layer*.025+Math.sin(u*Math.PI*7)*.075*t];};
  patch(b,fn,60,32,layer%2?'ivory':'red');
  const edge=Array.from({length:70},(_,i)=>fn(i/69,1));b.tube(edge,.032,'gold',70);
  const inner=Array.from({length:70},(_,i)=>fn(i/69,.90));b.tube(inner,.014,'gold',70);
  for(let j=0;j<12;j++){const p=fn((j+.5)/12,.83);scroll(b,p[0],p[1],p[2]+.025,.065,'gold',s);}
 }
 // Alternating lapis, jade and ivory skirt panels bow away from the legs.
 for(let i=0;i<10;i++){
  const a=i*TAU/10;
  const fn=(u,t)=>{let angle=a+(u-.5)*.57,r=.73+t*.74+Math.sin(t*Math.PI)*.10,y=4.15-t*(1.67+.15*Math.cos(i*2))-Math.sin(u*Math.PI)*.14;
   return [Math.sin(angle)*r,y,Math.cos(angle)*r*.73+Math.sin(t*Math.PI*1.8+u*4)*.10];};
  patch(b,fn,20,40,i%3===0?'ivory':i%3===1?'blue':'red');
  for(let u of [0,1])b.tube(Array.from({length:45},(_,j)=>fn(u,j/44)),.025,'gold',45);
  b.tube(Array.from({length:30},(_,j)=>fn(j/29,1)),.028,'gold',30);
  for(let j=0;j<7;j++){const p=fn(.5,j/8+.1);scroll(b,p[0],p[1],p[2]+Math.cos(a)*.045,.08,'gold',i%2?1:-1);}
 }
}

export function enrichArmor(b){
 beastMask(b,0,4.20,.83,1.25);
 for(let s of [-1,1]){
  beastMask(b,s*1.12,5.68,.59,.82);beastMask(b,s*.60,2.66,.44,.88);
  for(let i=0;i<4;i++){scroll(b,s*(.41+i*.12),5.27-i*.19,.56,.15,'gold',s);}
  // Cascading beads and pendants below the shoulder shells.
  for(let k=0;k<8;k++){const x=s*(.83+k*.09),y=5.36-k*.027;for(let j=0;j<3;j++)b.ball([x,y-j*.065,.49],[.026,.027,.023],'gold',9);}
 }
 for(let row=0;row<3;row++)for(let col=0;col<9;col++){const x=(col-4)*.155,y=4.58+row*.17;scroll(b,x,y,.56,.055,'gold',col%2?1:-1);}
}

// Deterministic material variation survives GLB export as vertex color.
export function patina(geo,name){
 const p=geo.attributes.position,n=geo.attributes.normal,a=new Float32Array(p.count*3);
 const stone=['jade','lightJade','rose','pearl'].includes(name),metal=['gold','paleGold','darkGold'].includes(name);
 const col=new THREE.Color();
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const wave=Math.sin(x*6+Math.sin(y*9+z*4)*1.2)+Math.sin(y*13+Math.sin(z*9+x*6)*2.3)*.5;
  const grain=(Math.sin(x*143.3+y*98.1+z*173.7)*Math.sin(y*127.2-z*94.1)+1)*.5;
  let shade=.80+grain*.16;
  if(stone){const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin(wave*3+y*2))/.12),2);shade=.60+.29*(wave+1.5)/3+vein*.29;col.setRGB(shade*(1+vein*.07),shade,shade*.96);}
  else if(metal){const age=Math.max(0,Math.sin(x*21+y*19+Math.sin(z*14))*Math.sin(z*25-y*12));shade=.65+grain*.24-age*.20;col.setRGB(shade,shade*.93,shade*.78);}
  else {shade=.69+grain*.14+wave*.065;col.setRGB(shade,shade,shade);}
  a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;
 }geo.setAttribute('color',new THREE.BufferAttribute(a,3));
}
