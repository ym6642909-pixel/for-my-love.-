// Edita estos dos nombres:
const SU_NOMBRE="[Nombre]", MI_NOMBRE="Yousef";
document.querySelectorAll('.nombre').forEach(e=>e.textContent=SU_NOMBRE);
document.querySelectorAll('.yo').forEach(e=>e.textContent=MI_NOMBRE);
const f=document.querySelector('.float');
if(f){for(let i=0;i<14;i++){const s=document.createElement('span');s.textContent=['💖','✨','💌','🌸'][i%4];
s.style.left=Math.random()*100+'%';s.style.fontSize=16+Math.random()*22+'px';
s.style.animationDuration=8+Math.random()*8+'s';s.style.animationDelay=-Math.random()*10+'s';f.appendChild(s)}}
