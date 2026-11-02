import fs from 'node:fs';
import {profileAvatars} from '../src/data/avatars.js';
fs.mkdirSync('public/avatars',{recursive:true});
const ellipse=(x,y,rx,ry,fill)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const path=(d,fill,stroke='none',width=2)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const eyes=(y=49,left=36,right=60)=>[left,right].map(x=>ellipse(x,y,3.5,4.3,'#493c38')+ellipse(x-1,y-1.6,1.2,1.2,'#fff9e8')).join('');
const cheeks=(y=59)=>ellipse(28,y,5,2.8,'#edaa9b')+ellipse(68,y,5,2.8,'#edaa9b');
const smile=(y=61)=>path(`M42 ${y}q6 7 12 0`,'none','#6d4b40',2.5);
const head=(fill)=>ellipse(48,53,29,27,fill);
const ears=(fill)=>ellipse(25,30,12,13,fill)+ellipse(71,30,12,13,fill);
const art={
 'peach-cat':['#f8e6db',path('M23 42 25 15 44 32M52 32 71 15 74 42','#e9ad87')+head('#f6c6a2')+path('m29 31 1-9 8 9m20 0 8-9 1 9','#eaa19e')+eyes()+cheeks()+path('m45 56 3 3 3-3Z','#bc7c70')+smile(61)+path('m17 54 10 2m-9 6 10-2m51-6-10 2m9 6-10-2','none','#a27561',1.5)],
 'mint-frog':['#e4eee1',ellipse(30,32,13,13,'#a5c59b')+ellipse(66,32,13,13,'#a5c59b')+ellipse(48,54,32,25,'#b6d6a8')+eyes(34,30,66)+cheeks(55)+smile(57)],
 'cloud-bunny':['#eee8f2', '<rect x="27" y="8" width="15" height="39" rx="8" fill="#fff8e9"/><rect x="54" y="8" width="15" height="39" rx="8" fill="#fff8e9"/>'+path('M34 17v18m28-18v18','none','#edb8b3',5)+head('#fff8e9')+eyes()+cheeks()+smile()],
 'lavender-owl':['#e8e5f2',path('m23 43 1-23 21 14m7 0 20-14 1 23','#a298ba')+head('#b3a9c9')+ellipse(34,49,16,19,'#fbf1df')+ellipse(62,49,16,19,'#fbf1df')+eyes(48,34,62)+path('m43 57 5 7 5-7Z','#dfa46c')+cheeks(62)],
 'cocoa-puppy':['#eee4d9',ellipse(23,43,10,23,'#a47a5b')+ellipse(73,43,10,23,'#a47a5b')+head('#e4c19a')+ellipse(60,47,11,15,'#c39470')+eyes()+ellipse(48,60,15,11,'#fff0d8')+ellipse(48,56,5,3.5,'#684c3e')+smile(62)+cheeks()],
 'red-panda':['#f1e2d9',ears('#a86c4f')+head('#cc8f68')+ellipse(48,65,22,12,'#fff1db')+ellipse(33,48,10,12,'#fff1db')+ellipse(63,48,10,12,'#fff1db')+eyes(49,33,63)+ellipse(48,60,4,3,'#6a4e41')+smile(65)],
 'honey-bear':['#f5e8cc',ears('#c79b64')+head('#dfb982')+ellipse(48,62,16,13,'#ffedc7')+eyes()+ellipse(48,57,5,3.5,'#77523d')+smile(64)+cheeks()],
 'sleepy-koala':['#e2e9e5',ears('#a8b6b4')+ellipse(24,30,8,9,'#d3d9d3')+ellipse(72,30,8,9,'#d3d9d3')+head('#bcc9c5')+eyes(48)+ellipse(48,57,6,9,'#637370')+cheeks(61)+smile(68)],
 'maple-fox':['#f2e5d4',path('M21 44 24 13 45 33m6 0 21-20 3 31','#cf895c')+head('#e4a777')+path('M20 49q14 0 28 15 14-15 28-15-3 29-28 30Q23 78 20 49','#fff0d7')+eyes(47)+ellipse(48,61,4,3,'#67483a')+smile(65)+cheeks(59)],
 'butter-chick':['#f6edcf',path('M43 28q-10-19 4-17 8 1 5 14 8-11 13-5 1 6-9 11','#e6b35e')+head('#f3d582')+eyes()+path('m42 57 6 7 6-7-6-3Z','#d38d4e')+cheeks()],
 'ice-penguin':['#e0eaf0',head('#738e9c')+ellipse(48,58,23,24,'#fff7e6')+ellipse(34,47,12,13,'#fff7e6')+ellipse(62,47,12,13,'#fff7e6')+eyes()+path('m43 58 5 6 5-6-5-3Z','#e8ad5a')+cheeks(62)],
 'pink-axolotl':['#f4e3ea',path('m24 39-13-9m12 18L9 47m15 9-13 8m61-25 13-9m-12 18 14-1m-15 9 13 8','none','#d78eab',7)+ellipse(48,53,30,26,'#f0b9c8')+eyes()+cheeks()+smile()],
 'moon-seal':['#e4eaf0',ellipse(22,69,13,7,'#d7dfe0')+ellipse(74,69,13,7,'#d7dfe0')+head('#f6f5e9')+eyes()+ellipse(48,60,4,3,'#859394')+smile(66)+cheeks()+path('m19 59 12 2m-9 5 9-2m46-4-12 2m9 5-9-2','none','#a5b5b5',1.5)],
 'strawberry-mushroom':['#eae9db','<rect x="31" y="38" width="34" height="44" rx="15" fill="#fff0d4"/>'+path('M16 46q0-31 32-31t32 31q-32 14-64 0','#dba09a')+ellipse(31,32,5,4,'#fff4dd')+ellipse(53,25,5,4,'#fff4dd')+ellipse(67,39,4,3,'#fff4dd')+eyes(61,40,56)+ellipse(33,69,4,2,'#e6b29c')+ellipse(63,69,4,2,'#e6b29c')+smile(69)],
};
for(const avatar of profileAvatars){
 if(avatar.id==='honey-bee'){fs.copyFileSync('public/honey-icon.svg','public/avatars/honey-bee.svg');continue;}
 const [bg,figure]=art[avatar.id];
 fs.writeFileSync(`public/avatars/${avatar.id}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><title>${avatar.name}</title><rect width="96" height="96" rx="28" fill="${bg}"/>${ellipse(48,82,24,4,'#5a4b3f0c')}${figure}</svg>\n`);
}
console.log(`Generated ${profileAvatars.length} original profile avatars.`);
