'use strict';

/* ── Cosmos Particle System ─── */
(function(){
  const canvas = document.getElementById('cosmos-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, stars = [], nebulae = [];

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rnd(a,b){return a+(b-a)*Math.random();}

  /* Initialise stars */
  for(let i=0;i<200;i++){
    stars.push({
      x:Math.random()*9999, y:Math.random()*9999,
      r:rnd(0.3,1.4),
      opacity:rnd(0.2,0.9),
      twinkleSpeed:rnd(0.008,0.025),
      twinkleOffset:Math.random()*Math.PI*2,
      speedX:rnd(-0.03,0.03),
      speedY:rnd(-0.03,0.03),
    });
  }

  let t = 0;
  function draw(){
    ctx.clearRect(0,0,W,H);
    t += 0.006;

    stars.forEach(s=>{
      /* wrap positions */
      s.x = (s.x + s.speedX + W) % W;
      s.y = (s.y + s.speedY + H) % H;
      const osc = 0.5 + 0.5*Math.sin(t*s.twinkleSpeed*60 + s.twinkleOffset);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,210,255,${s.opacity*osc})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════════
   DATA (localStorage)
══════════════════════════════════════════ */
let moodHistory = JSON.parse(localStorage.getItem('ms_moods')   || '[]');
let journals    = JSON.parse(localStorage.getItem('ms_journals') || '[]');
let tasks       = JSON.parse(localStorage.getItem('ms_tasks')    || '[]');
let profile     = JSON.parse(localStorage.getItem('ms_profile')  || JSON.stringify({
  name:'', age:'', streak:0, lastVisit:''
}));

function save(key,val){localStorage.setItem(key,JSON.stringify(val));}

/* ── Quotes ── */
const QUOTES=[
  {t:"The present moment is the only moment available to us — it is the door to all moments.",a:"Thich Nhat Hanh"},
  {t:"You don't have to control your thoughts. You just have to stop letting them control you.",a:"Dan Millman"},
  {t:"Almost everything will work again if you unplug it for a few minutes — including you.",a:"Anne Lamott"},
  {t:"Within you, there is a stillness and a sanctuary to which you can retreat at any time.",a:"Hermann Hesse"},
  {t:"Happiness is not something ready-made. It comes from your own actions.",a:"Dalai Lama"},
  {t:"You are braver than you believe, stronger than you seem, and smarter than you think.",a:"A.A. Milne"},
  {t:"Breathe. Let go. Remind yourself that this very moment is the only one you know you have for sure.",a:"Oprah Winfrey"},
  {t:"The mind is everything. What you think, you become.",a:"Buddha"},
  {t:"Start where you are. Use what you have. Do what you can.",a:"Arthur Ashe"},
  {t:"In the middle of every difficulty lies opportunity.",a:"Albert Einstein"},
  {t:"Do not anticipate trouble, or worry about what may never happen. Keep in the sunlight.",a:"Benjamin Franklin"},
  {t:"The greatest weapon against stress is our ability to choose one thought over another.",a:"William James"},
  {t:"Nothing is permanent. Don't stress yourself too much because no matter how bad the situation is — it will change.",a:"Unknown"},
];

/* ── Dates & Greeting ── */
const NOW   = new Date();
const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function initHomeMeta(){
  const h=NOW.getHours();
  const greeting=h<5?'Good night 🌙':h<12?'Good morning ✨':h<17?'Good afternoon ☀️':'Good evening 🌙';
  document.getElementById('greeting-text').textContent=greeting;
  document.getElementById('date-display').textContent=DAYS[NOW.getDay()]+', '+NOW.getDate()+' '+MONTHS[NOW.getMonth()]+' '+NOW.getFullYear();
  const q=QUOTES[NOW.getDate()%QUOTES.length];
  document.getElementById('quote-text').textContent=q.t;
  document.getElementById('quote-author').textContent='— '+q.a;
}

/* ── Toast ── */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'),2800);
}

/* ── Navigation ── */
function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('nav-'+page).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  if(page==='mood')    renderMoodHistory();
  if(page==='journal') renderJournals();
  if(page==='tasks')   htRender();
  if(page==='profile') renderProfile();
  if(page==='home')    updateHomeStats();
}

/* ── Streak ── */
function updateStreak(){
  const today=NOW.toDateString();
  const yesterday=new Date(NOW-86400000).toDateString();
  if(profile.lastVisit!==today){
    profile.streak=profile.lastVisit===yesterday?(profile.streak||0)+1:1;
    profile.lastVisit=today;
    save('ms_profile',profile);
  }
}

/* ── Home Stats ── */
function updateHomeStats(){
  document.getElementById('hs-streak').textContent =profile.streak||0;
  document.getElementById('hs-moods').textContent  =moodHistory.length;
  document.getElementById('hs-entries').textContent=journals.length;
  document.getElementById('hs-tasks').textContent  =tasks.filter(t=>t.done).length;
}

/* ══════════════════════════════════════════
   MOOD TRACKER
══════════════════════════════════════════ */
let selectedMood=null;

function selectMood(label,emoji,el){
  document.querySelectorAll('.mood-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  selectedMood={label,emoji};
}

function saveMood(){
  if(!selectedMood){showToast('Please select a mood first 👆');return;}
  const note=document.getElementById('mood-note').value.trim();
  const entry={...selectedMood,note,date:NOW.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})};
  moodHistory.unshift(entry);
  save('ms_moods',moodHistory);
  document.getElementById('mood-note').value='';
  document.querySelectorAll('.mood-card').forEach(c=>c.classList.remove('selected'));
  selectedMood=null;
  showToast(entry.emoji+'  Mood saved!');
  renderMoodHistory();updateHomeStats();
}

function quickMood(label,emoji){
  const entry={label,emoji,note:'',date:NOW.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})};
  moodHistory.unshift(entry);
  save('ms_moods',moodHistory);
  showToast(emoji+'  Quick mood logged!');
  updateHomeStats();
}

function renderMoodHistory(){
  const listEl  =document.getElementById('mood-history');
  const countEl =document.getElementById('mood-count');
  const chartEl =document.getElementById('mood-chart-bars');
  countEl.textContent=moodHistory.length+(moodHistory.length===1?' entry':' entries');
  if(!moodHistory.length){
    listEl.innerHTML='<div class="empty-state">No moods logged yet.<br>Track your very first mood above! 😊</div>';
    chartEl.innerHTML='';return;
  }
  const recent=moodHistory.slice(0,7).reverse();
  const maxBar=44;
  chartEl.innerHTML=recent.map((m,i)=>{
    const h=Math.max(8,Math.round((i+1)/recent.length*maxBar));
    return`<div class="chart-bar-wrap"><div class="chart-bar" style="height:${h}px"></div><span class="chart-label">${m.emoji}</span></div>`;
  }).join('');
  listEl.innerHTML=moodHistory.slice(0,15).map(m=>`
    <div class="mood-entry">
      <span class="e-emoji">${m.emoji}</span>
      <div class="e-info">
        <div class="e-label">${m.label}</div>
        ${m.note?`<div class="e-note">${escapeHtml(m.note)}</div>`:''}
      </div>
      <span class="e-date">${m.date}</span>
    </div>`).join('');
}

/* ══════════════════════════════════════════
   JOURNAL
══════════════════════════════════════════ */
function saveJournal(){
  const title=document.getElementById('j-title').value.trim();
  const desc =document.getElementById('j-desc').value.trim();
  if(!title){showToast('Please add a title 📝');return;}
  if(!desc) {showToast('Please write something ✍️');return;}
  const entry={id:Date.now(),title,desc,date:NOW.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})};
  journals.unshift(entry);
  save('ms_journals',journals);
  document.getElementById('j-title').value='';
  document.getElementById('j-desc').value='';
  showToast('📔  Journal entry saved!');
  renderJournals();updateHomeStats();
}

function deleteJournal(id){
  journals=journals.filter(j=>j.id!==id);
  save('ms_journals',journals);
  showToast('Entry deleted');
  renderJournals();updateHomeStats();
}

function renderJournals(){
  const el=document.getElementById('journal-list');
  if(!journals.length){
    el.innerHTML='<div class="empty-state">Your diary is empty.<br>Write your first entry above! 📔</div>';return;
  }
  el.innerHTML=journals.map(j=>`
    <div class="journal-entry">
      <div class="je-title">${escapeHtml(j.title)}</div>
      <div class="je-preview">${escapeHtml(j.desc.slice(0,100))}${j.desc.length>100?'…':''}</div>
      <div class="je-footer">
        <span class="je-date">${j.date}</span>
        <div class="je-actions">
          <button class="je-btn del" onclick="deleteJournal(${j.id})">Delete</button>
        </div>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════
   BREATHING
══════════════════════════════════════════ */
const BREATH_STEPS=[
  {phase:'Inhale', instruction:'Breathe in slowly through your nose', dur:4, cls:'inhale', icon:'🌬️'},
  {phase:'Hold',   instruction:'Hold gently — stay completely relaxed',dur:4, cls:'hold',   icon:'✨'},
  {phase:'Exhale', instruction:'Release slowly through your mouth',    dur:6, cls:'exhale', icon:'😮‍💨'},
];

let breathInterval=null,breathRunning=false,breathStep=0,breathSec=BREATH_STEPS[0].dur,breathCycles=0;

function toggleBreath(){breathRunning?stopBreath():startBreath();}

function startBreath(){
  breathRunning=true;breathStep=0;breathSec=BREATH_STEPS[0].dur;breathCycles=0;
  const btn=document.getElementById('breath-btn');
  btn.textContent='Stop Session';btn.classList.add('stop');
  updateBreathUI();
  breathInterval=setInterval(breathTick,1000);
}

function stopBreath(){
  clearInterval(breathInterval);breathRunning=false;breathStep=0;
  breathSec=BREATH_STEPS[0].dur;breathCycles=0;
  const btn=document.getElementById('breath-btn');
  btn.textContent='Start Session';btn.classList.remove('stop');
  document.getElementById('breath-phase').textContent='Ready to begin';
  document.getElementById('breath-instruction').textContent='Tap Start and breathe along gently';
  document.getElementById('breath-timer').textContent='4';
  document.getElementById('breath-icon').textContent='🌿';
  document.getElementById('breath-ring').className='breath-ring';
  document.getElementById('breath-circle').className='breath-circle';
  document.getElementById('cycle-count').textContent='';
}

function breathTick(){
  breathSec--;
  if(breathSec<=0){
    breathStep=(breathStep+1)%BREATH_STEPS.length;
    if(breathStep===0)breathCycles++;
    breathSec=BREATH_STEPS[breathStep].dur;
  }
  updateBreathUI();
}

function updateBreathUI(){
  const s=BREATH_STEPS[breathStep];
  document.getElementById('breath-phase').textContent=s.phase;
  document.getElementById('breath-instruction').textContent=s.instruction;
  document.getElementById('breath-timer').textContent=breathSec;
  document.getElementById('breath-icon').textContent=s.icon;
  document.getElementById('breath-ring').className='breath-ring '+s.cls;
  document.getElementById('breath-circle').className='breath-circle '+s.cls;
  const cc=document.getElementById('cycle-count');
  cc.textContent=breathCycles>0?'✅ Cycles completed: '+breathCycles:'';
}

/* ══════════════════════════════════════════
   HABIT TRACKER
══════════════════════════════════════════ */
const HT_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const HT_DAYS=['Su','Mo','Tu','We','Th','Fr','Sa'];

const HT_DEFAULT_HABITS=[
  {name:'🧘 Stretch or do yoga',  goal:5},
  {name:'🚶 Walk 10,000 steps',   goal:7},
  {name:'📖 Read a book chapter', goal:15},
  {name:'🗂️ Declutter a space',  goal:4},
  {name:'🦷 Floss',              goal:20},
  {name:'🎸 Play a guitar',       goal:10},
  {name:'📞 Call grandpa',        goal:10},
  {name:'🤝 Volunteer',           goal:3},
  {name:'💰 Put $10 to savings',  goal:10},
];

let htYear=2026;
let htMonth=new Date().getMonth()+1;

function htKey(y,m){return'ht_'+y+'_'+m;}

function htLoad(y,m){
  const raw=localStorage.getItem(htKey(y,m));
  if(raw)return JSON.parse(raw);
  if(y===2026){
    const seeded=HT_DEFAULT_HABITS.map((h,i)=>({id:Date.now()+i,name:h.name,goal:h.goal,marks:{}}));
    localStorage.setItem(htKey(y,m),JSON.stringify(seeded));
    return seeded;
  }
  return[];
}

function htSave(y,m,habits){localStorage.setItem(htKey(y,m),JSON.stringify(habits));}

function htDaysInMonth(y,m){return new Date(y,m,0).getDate();}
function htDayOfWeek(y,m,d){return new Date(y,m-1,d).getDay();}

function htSetYear(y,btn){
  document.querySelectorAll('.ht-period-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');htYear=y;htRender();
}

function htSetMonth(m){htMonth=parseInt(m,10);htRender();}

function htToggleAddForm(){
  const form=document.getElementById('ht-add-form');
  const chevron=document.getElementById('ht-add-chevron');
  const isOpen=form.classList.contains('open');
  form.classList.toggle('open',!isOpen);
  chevron.classList.toggle('open',!isOpen);
  if(!isOpen)setTimeout(()=>document.getElementById('ht-new-name').focus(),80);
}

function htAddHabit(){
  const nameEl=document.getElementById('ht-new-name');
  const goalEl=document.getElementById('ht-new-goal');
  const emojiEl=document.getElementById('ht-new-emoji');
  const rawName=nameEl.value.trim();
  const goal=parseInt(goalEl.value,10);
  const emoji=emojiEl.value.trim();
  if(!rawName){showToast('Please enter a habit name 📝');return;}
  if(!goal||goal<1||goal>31){showToast('Goal must be between 1 and 31 days 🎯');return;}
  const fullName=emoji?emoji+' '+rawName:rawName;
  const habits=htLoad(htYear,htMonth);
  habits.push({id:Date.now(),name:fullName,goal,marks:{}});
  htSave(htYear,htMonth,habits);
  nameEl.value='';goalEl.value='';emojiEl.value='';
  htToggleAddForm();showToast('✅ Habit added!');htRender();
}

function htDeleteHabit(id){
  const habits=htLoad(htYear,htMonth).filter(h=>h.id!==id);
  htSave(htYear,htMonth,habits);htRender();showToast('🗑️ Habit removed');
}

function htToggleDay(id,day){
  const habits=htLoad(htYear,htMonth);
  const h=habits.find(h=>h.id===id);
  if(!h)return;
  h.marks[day]=!h.marks[day];
  htSave(htYear,htMonth,habits);htRender();
}

function htRender(){
  const totalDays=htDaysInMonth(htYear,htMonth);
  const habits=htLoad(htYear,htMonth);
  document.getElementById('ht-month-select').value=htMonth;
  document.getElementById('ht-meta-badge').textContent=HT_MONTHS[htMonth-1]+' '+htYear+' · '+totalDays+' Days';

  const thead=document.getElementById('ht-thead');
  let hRow='<tr><th class="habit-col-name">HABIT</th><th class="habit-col-goal">GOAL</th>'
          +'<th class="habit-col-done">DONE</th><th class="habit-col-pct">RATE</th>';
  for(let d=1;d<=totalDays;d++){
    const dow=htDayOfWeek(htYear,htMonth,d);
    const wknd=(dow===0||dow===6)?' weekend-col':'';
    hRow+=`<th class="habit-col-day${wknd}">${d}<span style="display:block;font-size:8px;font-weight:400">${HT_DAYS[dow]}</span></th>`;
  }
  hRow+='<th class="habit-col-del"></th></tr>';
  thead.innerHTML=hRow;

  const tbody=document.getElementById('ht-tbody');
  if(!habits.length){
    tbody.innerHTML=`<tr class="habit-empty-row"><td colspan="${totalDays+5}">No habits yet — click <strong>Add New Habit</strong> above to get started! 🌱</td></tr>`;
    htUpdateSummary([]);return;
  }

  tbody.innerHTML=habits.map(h=>{
    const done=Object.values(h.marks).filter(Boolean).length;
    const pct=h.goal>0?Math.min(100,Math.round(done/h.goal*100)):0;
    const barCls=pct>=80?'rate-high':pct>=50?'rate-mid':'rate-low';
    let row=`<tr>
      <td class="habit-name" title="${escapeHtml(h.name)}">${escapeHtml(h.name)}</td>
      <td class="habit-goal">${h.goal}</td>
      <td class="habit-done">${done}</td>
      <td class="habit-pct"><div class="habit-bar-wrap">
        <div class="habit-bar ${barCls}" style="width:${Math.min(100,pct)}%"></div>
        <span style="position:static;font-size:10px;color:var(--muted)">${pct}%</span></div></td>`;
    for(let d=1;d<=totalDays;d++){
      const dow=htDayOfWeek(htYear,htMonth,d);
      const wknd=(dow===0||dow===6)?' weekend':'';
      const marked=h.marks[String(d)]?' hx':'';
      row+=`<td class="ht-day-cell${wknd}${marked}" onclick="htToggleDay(${h.id},'${d}')"></td>`;
    }
    row+=`<td><button class="habit-del-btn" onclick="htDeleteHabit(${h.id})" title="Remove">✕</button></td></tr>`;
    return row;
  }).join('');

  htUpdateSummary(habits);updateHomeStats();
}

function htUpdateSummary(habits){
  let totalDone=0,totalGoal=0,bestName='—',bestPct=-1,overallPct=0;
  habits.forEach(h=>{
    const done=Object.values(h.marks).filter(Boolean).length;
    const pct=h.goal>0?Math.round(done/h.goal*100):0;
    totalDone+=done;totalGoal+=h.goal;
    if(pct>bestPct){bestPct=pct;bestName=h.name.replace(/^\S+\s/,'');}
  });
  overallPct=totalGoal>0?Math.round(totalDone/totalGoal*100):0;
  const rating=overallPct>95?'🏆🏆🏆 Excellent!':overallPct>80?'❤️❤️ Good Job!':overallPct>50?'⚡ Do Better!':overallPct>30?'👎 Low Effort':habits.length?'⚠️ Keep Going!':'—';
  document.getElementById('hs-best-habit').textContent =habits.length?bestName+' ('+bestPct+'%)':'—';
  document.getElementById('hs-overall-rate').textContent=overallPct+'%';
  document.getElementById('hs-completions').textContent =totalDone+' / '+totalGoal;
  document.getElementById('hs-rating').textContent      =rating;
}

/* ══════════════════════════════════════════
   PROFILE
══════════════════════════════════════════ */
function saveProfile(){
  const name=document.getElementById('p-name').value.trim();
  const age =document.getElementById('p-age').value.trim();
  if(name)profile.name=name;
  if(age) profile.age=age;
  save('ms_profile',profile);renderProfile();showToast('Profile updated! 🌸');
}

function renderProfile(){
  updateStreak();
  document.getElementById('profile-name-display').textContent=profile.name||'Your Name';
  document.getElementById('p-name').value=profile.name||'';
  document.getElementById('p-age').value =profile.age||'';
  document.getElementById('streak-num').textContent   =profile.streak||0;
  document.getElementById('entries-num').textContent  =journals.length;
  document.getElementById('moods-num').textContent    =moodHistory.length;
  document.getElementById('tasks-done-num').textContent=0;
  const avatar=document.getElementById('avatar-display');
  if(profile.name){
    const initials=profile.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
    avatar.textContent=initials;avatar.style.fontSize='28px';
  } else {avatar.textContent='🌸';avatar.style.fontSize='38px';}
}

function clearAllData(){
  if(!confirm('Are you sure? This will erase all your data. This cannot be undone.'))return;
  moodHistory=[];journals=[];
  profile={name:profile.name,age:profile.age,streak:0,lastVisit:''};
  save('ms_moods',moodHistory);save('ms_journals',journals);save('ms_profile',profile);
  showToast('All data cleared');renderProfile();updateHomeStats();
}

/* ── Utility ── */
function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ── Init ── */
(function init(){
  updateStreak();initHomeMeta();updateHomeStats();
  document.getElementById('ht-month-select').value=htMonth;
  htRender();
})();
