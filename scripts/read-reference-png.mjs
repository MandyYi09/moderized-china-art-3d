import {readFile} from 'node:fs/promises';
import {inflateSync} from 'node:zlib';
// Decode the original (unchanged) RGB/RGBA PNG into a GPU texture buffer.
export async function readReferencePNG(path){
 const png=await readFile(path);let width,height,channels;const idat=[];
 for(let at=8;at<png.length;){const len=png.readUInt32BE(at),type=png.toString('ascii',at+4,at+8),data=png.subarray(at+8,at+8+len);
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);channels=data[9]===2?3:data[9]===6?4:0;if(data[8]!==8||!channels||data[12]!==0)throw new Error('Reference must be an 8-bit non-interlaced RGB/RGBA PNG');}
  if(type==='IDAT')idat.push(data);at+=12+len;
 }
 const encoded=inflateSync(Buffer.concat(idat)),stride=width*channels,raw=new Uint8Array(stride*height);let at=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const f=encoded[at++];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=channels?raw[i-channels]:0,b=y?raw[i-stride]:0,c=y&&x>=channels?raw[i-stride-channels]:0;raw[i]=(encoded[at++]+(f===0?0:f===1?a:f===2?b:f===3?Math.floor((a+b)/2):f===4?paeth(a,b,c):NaN))&255;}}
 const rgba=new Uint8Array(width*height*4);for(let i=0;i<width*height;i++){rgba[i*4]=raw[i*channels];rgba[i*4+1]=raw[i*channels+1];rgba[i*4+2]=raw[i*channels+2];rgba[i*4+3]=channels===4?raw[i*channels+3]:255;}
 return {data:rgba,width,height};
}
