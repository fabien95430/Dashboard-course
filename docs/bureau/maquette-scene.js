window.bureauScene=function(svg){
const S=17,OX=190,OY=92;
const P=(x,y,z)=>[OX+(x-y)*0.866*S,OY+(x+y)*0.5*S-z*S];
const f=n=>n.toFixed(1);
const pts=a=>a.map(p=>f(p[0])+','+f(p[1])).join(' ');
const poly=(a,fill,ex='')=>`<polygon points="${pts(a)}" fill="${fill}" ${ex}/>`;
const box=(x,y,z,w,d,h,c,ex='')=>{const top=[P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)];const L=[P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)];const R=[P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)];return poly(L,c[1],ex)+poly(R,c[2],ex)+poly(top,c[0],ex);};
const faceY=(x1,x2,y,z1,z2,fill,ex='')=>poly([P(x1,y,z1),P(x2,y,z1),P(x2,y,z2),P(x1,y,z2)],fill,ex);
const wallX=(x1,x2,z1,z2,fill,ex='')=>poly([P(x1,0,z1),P(x2,0,z1),P(x2,0,z2),P(x1,0,z2)],fill,ex);
const wallY=(y1,y2,z1,z2,fill,ex='')=>poly([P(0,y1,z1),P(0,y2,z1),P(0,y2,z2),P(0,y1,z2)],fill,ex);
const circ=(p,r,fill,ex='')=>`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" fill="${fill}" ${ex}/>`;
const ell=(p,rx,ry,fill,ex='')=>`<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${rx}" ry="${ry}" fill="${fill}" ${ex}/>`;
const line=(a,b,st,w,ex='')=>`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="${st}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
const T={
 tri:{shirt:'#8F87E3',shirtD:'#574EB8',shirtL:'#E9E6FC',skin:'#F3D2BC',skinD:'#DDAE92',hair:'#5A3A26',hairL:'#8A5E40',kind:'femme',id:'t'},
 dev:{shirt:'#4D97E0',shirtD:'#215F9C',shirtL:'#E6F1FB',skin:'#F1CDB4',skinD:'#D9A788',hair:'#3B2A1E',hairL:'#6A4B35',kind:'barbe',id:'d'},
 tst:{shirt:'#2BAE84',shirtD:'#137255',shirtL:'#E1F5EE',skin:'#F6D8C4',skinD:'#E0B49A',hair:'#B88A4A',hairL:'#DDB878',kind:'lunettes',id:'s'}};
let defs='<defs>';
Object.values(T).forEach(c=>{defs+=`<radialGradient id="bzH${c.id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${c.skin}"/><stop offset=".75" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skinD}"/></radialGradient><linearGradient id="bzB${c.id}" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="${c.shirt}"/><stop offset=".65" stop-color="${c.shirt}"/><stop offset="1" stop-color="${c.shirtD}"/></linearGradient><linearGradient id="bzR${c.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.hairL}"/><stop offset="1" stop-color="${c.hair}"/></linearGradient>`});
defs+='<radialGradient id="bzCour" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F2CFB6"/><stop offset=".75" stop-color="#F2CFB6"/><stop offset="1" stop-color="#D8A688"/></radialGradient><linearGradient id="bzCourB" x1="0" y1="0" x2="1" y2=".3"><stop offset="0" stop-color="#E9C27A"/><stop offset=".6" stop-color="#E3B55C"/><stop offset="1" stop-color="#B98A33"/></linearGradient></defs>';
let g=defs;
g+=poly([P(0,0,0),P(11,0,0),P(11,11,0),P(0,11,0)],'#E9DCC6');
for(let i=1;i<11;i++){g+=line(P(i,0,0),P(i,11,0),'#DCCDB3',.6)}
g+=wallX(0,11,0,4.6,'#F6F2E9');g+=wallY(0,11,0,4.6,'#E8E2D5');
g+=wallX(0,11,0,.25,'#D3D1C7');g+=wallY(0,11,0,.25,'#C9C5BA');
[[1.2,4.2],[5,8],[8.6,10.4]].forEach(([a,b])=>{g+=wallX(a,b,1.6,3.9,'#CFE3D6');g+=wallX(a,b,1.6,3.9,'none','stroke="#7d8f82" stroke-width="1.2"');const m=(a+b)/2;g+=line(P(m,0,1.6),P(m,0,3.9),'#7d8f82',1);g+=poly([P(a,0,0),P(b,0,0),P(b+1.6,3.2,0),P(a+1.6,3.2,0)],'#FFFFFF','opacity=".3"')});
g+=wallY(1.5,5.2,1.7,3.6,'#FFFFFF');g+=wallY(1.5,5.2,1.7,3.6,'none','stroke="#7d8f82" stroke-width="1"');
[[2,3.2,'#FAC775'],[2.6,2.6,'#9FE1CB'],[3.3,3.1,'#F5C4B3'],[4,2.5,'#CECBF6'],[4.4,3.2,'#FAC775']].forEach(([y,z,c])=>{g+=wallY(y,y+.5,z-.5,z,c)});
g+=poly([P(4.6,4.6,.01),P(10,4.6,.01),P(10,10,.01),P(4.6,10,.01)],'#DCEBDD','opacity=".7"');
/* Visage réaliste : tête ovale (rx 5.6, ry 6.6) autour de h, regard légèrement vers la gauche. */
const face=(h,c)=>{let r='';const x=h[0]-.9,y=h[1]+.6;
 r+=`<path d="M${f(x-3.6)},${f(y-1.9)} q1,-.6 2.1,-.1 M${f(x+.9)},${f(y-2)} q1.1,-.5 2.1,.1" fill="none" stroke="${c.hair}" stroke-width=".55" stroke-linecap="round"/>`;
 r+=ell([x-2.5,y-.3],.95,.62,'#fff')+ell([x+1.9,y-.3],.95,.62,'#fff');
 r+=circ([x-2.6,y-.3],.5,'#3E3026')+circ([x+1.8,y-.3],.5,'#3E3026');
 r+=`<path d="M${f(x-.2)},${f(y+.2)} l-.5,1.7 q.4,.3 .9,.1" fill="none" stroke="${c.skinD}" stroke-width=".55" stroke-linecap="round"/>`;
 r+=`<path d="M${f(x-1.4)},${f(y+3.1)} q1,.6 2.1,0" fill="none" stroke="#B5705E" stroke-width=".65" stroke-linecap="round"/>`;
 if(c.kind==='femme')r+=`<path d="M${f(x-1.3)},${f(y+3.05)} q1,.75 2,0" fill="none" stroke="#C25E5E" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`;
 return r;};
const hairBack=(h,c)=>c.kind==='femme'?`<path d="M${f(h[0]-6.6)},${f(h[1]-1)} q-.4,-8.4 6.6,-8.4 q7,0 6.6,8.4 q.6,6 1.6,9.6 q-8.2,3 -16.4,0 q1,-3.6 1.6,-9.6z" fill="url(#bzR${c.id})"/>`:'';
const hairFront=(h,c)=>{
 if(c.kind==='femme')return `<path d="M${f(h[0]-6)},${f(h[1]+.8)} q-.6,-8.6 6,-8.6 q6.6,0 6,8.2 q-1.6,-4.4 -4,-5.6 q-3.6,2.8 -8,6z" fill="url(#bzR${c.id})"/><path d="M${f(h[0]+2)},${f(h[1]-7.6)} q2.4,1.6 3.2,5" fill="none" stroke="${c.hairL}" stroke-width=".5" opacity=".6"/>`+circ([h[0]-5.5,h[1]+3.4],.6,'#F3C74B');
 let r='';
 if(c.kind==='barbe'){r+=`<path d="M${f(h[0]-5.8)},${f(h[1]-.6)} q-.5,-7.6 5.8,-7.6 q6.2,0 5.8,7.2 q-.8,-2.6 -2.2,-3.6 q-3.6,1 -8,.2 q-1,1.4 -1.4,3.8z" fill="url(#bzR${c.id})"/>`;
  r+=`<path d="M${f(h[0]-5.4)},${f(h[1]+1.4)} q.4,5.8 5.4,5.8 q5,0 5.4,-5.8 q-.6,2.6 -2.2,3 q-3.2,-1.2 -6.4,0 q-1.6,-.4 -2.2,-3z" fill="${c.hair}" opacity=".55"/>`;}
 else{r+=`<path d="M${f(h[0]-5.7)},${f(h[1]-1)} q-.2,-7.2 5.9,-7.2 q6,0 5.6,6.8 q-1.2,-3.2 -3,-3.9 q-2,1.6 -5.6,.9 q-1.6,1.2 -2.9,3.4z" fill="url(#bzR${c.id})"/>`;
  r+=`<rect x="${f(h[0]-5.3)}" y="${f(h[1]-1.1)}" width="3.7" height="2.4" rx="1" fill="none" stroke="#3A3530" stroke-width=".5"/><rect x="${f(h[0]-.8)}" y="${f(h[1]-1.1)}" width="3.7" height="2.4" rx="1" fill="none" stroke="#3A3530" stroke-width=".5"/>`+line([h[0]-1.6,h[1]-.3],[h[0]-.8,h[1]-.3],'#3A3530',.5);}
 return r;};
/* Personnage assis : chaise, buste et tête avant le bureau ; bras après. */
const robotBack=(x,y,c)=>{let r='';
 r+=box(x-.5,y-.8,0,.08,.08,.75,['#444441','#444441','#2C2C2A'])+box(x+.42,y-.8,0,.08,.08,.75,['#444441','#444441','#2C2C2A']);
 r+=box(x-.5,y-.85,.75,1,.28,1.6,['#6B6A65','#4E4D49','#34332F']);
 r+=box(x-.5,y-.6,.72,1,.85,.14,['#6B6A65','#4E4D49','#34332F']);
 const h=P(x,y-.05,2.42);
 r+=hairBack(h,c);
 const hipL=P(x-.3,y+.12,.88),hipR=P(x+.3,y-.18,.88),shL=P(x-.43,y+.06,1.74),shR=P(x+.43,y-.2,1.74),nk=P(x,y-.05,1.86);
 r+=`<path d="M${f(hipL[0])},${f(hipL[1])} L${f(shL[0]+.6)},${f(shL[1]+5)} Q${f(shL[0]-.4)},${f(shL[1]-1.2)} ${f(shL[0]+4)},${f(shL[1]-2.2)} L${f(nk[0]-2.4)},${f(nk[1]-.8)} L${f(nk[0]+2.4)},${f(nk[1]-.8)} L${f(shR[0]-4)},${f(shR[1]-2.2)} Q${f(shR[0]+.4)},${f(shR[1]-1.2)} ${f(shR[0]-.6)},${f(shR[1]+5)} L${f(hipR[0])},${f(hipR[1])}z" fill="url(#bzB${c.id})"/>`;
 r+=`<path d="M${f(nk[0]-2.4)},${f(nk[1]-.8)} L${f(nk[0])},${f(nk[1]+3.6)} L${f(nk[0]+2.4)},${f(nk[1]-.8)}z" fill="${c.skin}"/>`;
 r+=`<path d="M${f(nk[0]-2.6)},${f(nk[1]-1)} L${f(nk[0]-.2)},${f(nk[1]+3.4)} L${f(nk[0]-3.4)},${f(nk[1]+2.2)}z M${f(nk[0]+2.6)},${f(nk[1]-1)} L${f(nk[0]+.2)},${f(nk[1]+3.4)} L${f(nk[0]+3.4)},${f(nk[1]+2.2)}z" fill="${c.shirtL}"/>`;
 if(c.kind!=='femme')r+=line([nk[0],nk[1]+4.5],[nk[0]+.6,nk[1]+11],c.shirtD,.5)+circ([nk[0]+.2,nk[1]+6.2],.45,c.shirtL)+circ([nk[0]+.4,nk[1]+8.6],.45,c.shirtL);
 r+=`<rect x="${f(nk[0]-1.7)}" y="${f(h[1]+4)}" width="3.4" height="${f(nk[1]-h[1]-3.6)}" rx="1.2" fill="${c.skinD}"/>`;
 r+=ell([h[0]-5.6,h[1]+.8],1.2,1.8,c.skinD)+ell([h[0]+5.6,h[1]+.8],1.2,1.8,c.skinD);
 r+=ell(h,5.6,6.6,`url(#bzH${c.id})`);
 r+=face(h,c)+hairFront(h,c);
 return r;};
const robotArms=(x,y,c,reach)=>{let r='';
 [[-1,x-.43,y+.06],[1,x+.43,y-.2]].forEach(([sd,sx,sy])=>{const sh=P(sx,sy,1.66),el=P(sx+sd*.06,sy+.25,1.36),hd=P(x+sd*.26,y-.14+reach,1.38);
  r+=`<path d="M${f(sh[0])},${f(sh[1])} L${f(el[0])},${f(el[1])} L${f(hd[0])},${f(hd[1])}" fill="none" stroke="${sd<0?c.shirt:c.shirtD}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  r+=ell(hd,2.1,1.5,c.skin,`stroke="${c.skinD}" stroke-width=".4"`);});
 return r;};
const desk=(x,y,w,d,top,side,side2)=>box(x,y,1.15,w,d,.14,[top,side,side2])+box(x+.1,y+.1,0,.12,d-.2,1.15,[side,side2,side2])+box(x+w-.22,y+.1,0,.12,d-.2,1.15,[side,side2,side2]);
const keyboard=(x,y,w)=>box(x,y,1.29,w,.3,.04,['#3A3936','#2C2C2A','#232220']);
const laptop=(x,y,c)=>box(x,y,1.29,.95,.55,.04,['#D3D1C7','#B4B2A9','#888780'])+box(x,y+.5,1.33,.95,.05,.62,['#9C9B95','#B4B2A9','#6E6D68'])+circ(P(x+.47,y+.55,1.64),2.2,c,'class="bz-glow"');
g+=box(9.6,.6,0,.8,.8,.7,['#D85A30','#993C1D','#712B13']);
[[10,1,1.3,10],[9.75,.85,1.05,8],[10.25,1.2,1.15,8],[10,.95,1.65,8]].forEach(([x,y,z,r])=>{g+=circ(P(x,y,z),r,'#639922','stroke="#3B6D11" stroke-width=".8"')});
/* Trieur */
g+=robotBack(3.3,2.3,T.tri);g+=desk(2,2.5,2.6,1.2,'#F1EFE8','#D3D1C7','#B4B2A9');
g+=box(2.15,2.7,1.29,.5,.38,.08,['#FAC775','#EF9F27','#BA7517'])+box(2.17,2.72,1.37,.5,.38,.08,['#FAEEDA','#FAC775','#EF9F27'])+box(2.15,2.7,1.45,.5,.38,.08,['#FAC775','#EF9F27','#BA7517']);
g+=laptop(2.85,2.75,'#AFA9EC');g+=robotArms(3.3,2.3,T.tri,.62);g+=box(2.85,3.25,1.33,.95,.05,.62,['#9C9B95','#B4B2A9','#6E6D68'])+circ(P(3.32,3.3,1.64),2.2,'#AFA9EC','class="bz-glow"');
/* Développeur */
g+=robotBack(7.3,2.3,T.dev);g+=desk(6,2.5,2.6,1.2,'#F1EFE8','#D3D1C7','#B4B2A9');
g+=keyboard(6.85,2.8,.9);g+=robotArms(7.3,2.3,T.dev,.66);
g+=box(7.2,3.25,1.29,.2,.2,.22,['#5F5E5A','#444441','#2C2C2A'])+box(6.55,3.38,1.45,1.5,.06,.95,['#2C2C2A','#3A3936','#2C2C2A'])+circ(P(7.3,3.44,1.92),2.4,'#85B7EB','class="bz-glow"');
/* Coin café */
g+=box(.25,8.6,0,1,1.8,1.35,['#D3D1C7','#B4B2A9','#888780'])+box(.4,9.2,1.35,.6,.6,.7,['#444441','#2C2C2A','#5F5E5A'])+circ(P(.95,9.5,1.7),1.8,'#E24B4A','class="bz-glow"')+box(.55,9.85,1.35,.25,.25,.25,['#FFFFFF','#F1EFE8','#D3D1C7']);
/* Testeur */
g+=robotBack(3.3,6.3,T.tst);g+=desk(2,6.5,2.6,1.2,'#F1EFE8','#D3D1C7','#B4B2A9');
g+=box(2.35,6.75,1.29,.95,.55,.04,['#D3D1C7','#B4B2A9','#888780']);g+=robotArms(3.3,6.3,T.tst,.62);
g+=box(2.35,7.25,1.33,.95,.05,.62,['#9C9B95','#B4B2A9','#6E6D68'])+circ(P(2.82,7.3,1.64),2.2,'#5DCAA5','class="bz-glow"');
g+=box(3.75,6.9,1.29,.3,.14,.52,['#2C2C2A','#444441','#2C2C2A'])+poly([P(3.77,7.041,1.33),P(4.03,7.041,1.33),P(4.03,7.041,1.78),P(3.77,7.041,1.78)],'#E1F5EE');
/* Coursier : marche dans l'allée et passe le dossier de bureau en bureau. */
const R=(dx,dy,dz)=>{const a=P(dx,dy,dz),o=P(0,0,0);return [a[0]-o[0],a[1]-o[1]]};
const Rbox=(x,y,z,w,d,h,c)=>{const top=[R(x,y,z+h),R(x+w,y,z+h),R(x+w,y+d,z+h),R(x,y+d,z+h)];const L=[R(x,y+d,z),R(x+w,y+d,z),R(x+w,y+d,z+h),R(x,y+d,z+h)];const Rr=[R(x+w,y,z),R(x+w,y+d,z),R(x+w,y+d,z+h),R(x+w,y,z+h)];return poly(L,c[1])+poly(Rr,c[2])+poly(top,c[0]);};
let cour='';
cour+=ell([0,0],7,3.4,'#000','opacity=".13"');
cour+=`<g id="bzLegL"><path d="M-2.2,-17 L-2.4,-1.4" stroke="#3B4252" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="-2.9" cy="-.7" rx="2.5" ry="1.3" fill="#2C2C2A"/></g>`;
cour+=`<g id="bzLegR"><path d="M2.2,-17 L2.4,-1.4" stroke="#323848" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="2.8" cy="-.7" rx="2.5" ry="1.3" fill="#2C2C2A"/></g>`;
cour+=`<path d="M-4.6,-16 L-5.4,-27.5 Q-5.2,-30 -2,-30.6 L2,-30.6 Q5.2,-30 5.4,-27.5 L4.6,-16z" fill="url(#bzCourB)"/>`;
cour+=`<rect x="-6" y="-26" width="12" height="8" rx="1.2" fill="#FAC775" stroke="#BA7517" stroke-width=".6"/><rect x="-6" y="-27.3" width="5" height="2.2" rx=".8" fill="#EF9F27"/><rect x="-5.3" y="-24.3" width="10.6" height="1" fill="#fff" opacity=".75"/>`;
cour+=`<path d="M-5.2,-29 L-6.4,-22.5" stroke="#D6A548" stroke-width="2.6" stroke-linecap="round"/><path d="M5.2,-29 L6.4,-22.5" stroke="#B98A33" stroke-width="2.6" stroke-linecap="round"/>`;
cour+=ell([-6.3,-21.8],1.5,1.1,'#F2CFB6')+ell([6.3,-21.8],1.5,1.1,'#F2CFB6');
cour+=`<rect x="-1.2" y="-33" width="2.4" height="3" rx="1" fill="#D8A688"/>`;
cour+=ell([0,-37],4,4.8,'url(#bzCour)');
cour+=`<path d="M-4.1,-37.6 q-.2,-5.2 4.1,-5.2 q4.4,0 4.1,4.9 q-.9,-2.2 -2.2,-2.7 q-1.6,1.1 -4,.6 q-1.2,.9 -2,2.4z" fill="#6A4B35"/>`;
cour+=circ([-1.6,-36.6],.42,'#3E3026')+circ([1.4,-36.6],.42,'#3E3026')+`<path d="M-1,-34.6 q1,.5 1.9,0" fill="none" stroke="#B5705E" stroke-width=".5" stroke-linecap="round"/>`;
const stops=[[3.3,4.35,1.2],[5.3,4.35,0],[7.3,4.35,1.4],[5.3,4.35,0],[5.3,7.1,1.4],[5.3,9.1,0],[6.9,9.1,1.8]];
const sp=stops.map(s=>P(s[0],s[1],0));
let d='M'+f(sp[0][0])+','+f(sp[0][1]);for(let i=1;i<sp.length;i++)d+=' L'+f(sp[i][0])+','+f(sp[i][1]);
const seg=[0];for(let i=1;i<sp.length;i++)seg.push(seg[i-1]+Math.hypot(sp[i][0]-sp[i-1][0],sp[i][1]-sp[i-1][1]));
const total=seg[seg.length-1],speed=38;let t=0;const kt=[],kp=[];
stops.forEach((s,i)=>{if(i>0)t+=(seg[i]-seg[i-1])/speed;kt.push(t);kp.push(seg[i]/total);if(s[2]){t+=s[2];kt.push(t);kp.push(seg[i]/total)}});
const dur=t;
const moving=tt=>{let acc=0;for(let i=0;i<stops.length;i++){if(i>0){const tr=(seg[i]-seg[i-1])/speed;if(tt>=acc&&tt<acc+tr)return true;acc+=tr}acc+=stops[i][2]}return false};
const step=.22,vals=[],keys=[];for(let tt=0,k=0;tt<dur;tt+=step,k++){keys.push((tt/dur).toFixed(4));vals.push(moving(tt)?(k%2?16:-16):0)}
const legAnim=(sign)=>`<animateTransform attributeName="transform" type="rotate" dur="${dur.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keys.join(';')}" values="${vals.map(v=>(v*sign*.7)+' 0 -17').join(';')}"/>`;
cour=cour.replace('<g id="bzLegL">','<g id="bzLegL">'+legAnim(1)).replace('<g id="bzLegR">','<g id="bzLegR">'+legAnim(-1));
const bob=`<animateTransform attributeName="transform" type="translate" dur="${dur.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keys.join(';')}" values="${vals.map((v,k)=>'0 '+(v?(k%2?-1:0):0)).join(';')}"/>`;
cour='<g>'+bob+cour+'</g>';
g+=`<path d="${d}" fill="none" stroke="#C9B48F" stroke-width="1.2" stroke-dasharray="1 6" stroke-linecap="round" opacity=".7"/>`;
g+=`<g class="bz-courier">${cour}<animateMotion dur="${dur.toFixed(2)}s" repeatCount="indefinite" calcMode="linear" keyTimes="${kt.map(v=>(v/dur).toFixed(4)).join(';')}" keyPoints="${kp.map(v=>v.toFixed(4)).join(';')}" path="${d}"/></g>`;
/* Ton bureau */
g+=desk(6.4,6.8,3.2,1.5,'#EAF3DE','#C0DD97','#97C459');
g+=box(6.8,7.1,1.29,1,.75,.1,['#5F5E5A','#444441','#2C2C2A'])+box(6.9,7.18,1.39,.8,.6,.06,['#FAC775','#EF9F27','#BA7517'])+box(6.92,7.2,1.45,.8,.6,.06,['#FAEEDA','#FAC775','#EF9F27']);
g+=box(8.2,7.05,1.29,.95,.55,.04,['#D3D1C7','#B4B2A9','#888780'])+box(8.2,7.05,1.33,.95,.05,.62,['#9C9B95','#B4B2A9','#6E6D68']);
g+=box(9.1,7.85,1.29,.25,.25,.3,['#FFFFFF','#F1EFE8','#D3D1C7']);
g+=box(8.6,8.75,.75,.9,.8,.15,['#2f6a49','#24583b','#173f29'])+box(8.6,9.3,0,.9,.25,1.6,['#2f6a49','#24583b','#173f29']);
svg.innerHTML=g;};
