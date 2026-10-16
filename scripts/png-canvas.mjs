// Minimal RGBA canvas for exporting our generated DataTextures in Node.
// Supports only the putImageData path used by GLTFExporter for DataTexture.
import { deflateSync } from 'node:zlib';
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let c=0xffffffff;for(const n of b)c=table[(c^n)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const t=Buffer.from(type),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([len,t,data,sum]);}
globalThis.ImageData=class {constructor(data,width,height){Object.assign(this,{data,width,height});}};
globalThis.OffscreenCanvas=class {
 constructor(width,height){this.width=width;this.height=height;}
 getContext(){return {putImageData:im=>{this.data=im.data;},translate(){},scale(){}};}
 async convertToBlob(){
  if(!this.data)throw new Error('Only generated RGBA DataTextures are supported');
  const hdr=Buffer.alloc(13);hdr.writeUInt32BE(this.width,0);hdr.writeUInt32BE(this.height,4);hdr[8]=8;hdr[9]=6;
  const rows=Buffer.alloc(this.height*(this.width*4+1));for(let y=0;y<this.height;y++)Buffer.from(this.data.buffer,this.data.byteOffset+y*this.width*4,this.width*4).copy(rows,y*(this.width*4+1)+1);
  return new Blob([Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))])],{type:'image/png'});
 }
};
