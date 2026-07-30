const KEY='nq-life-os-v1';
const defaultState={version:1,exp:0,missions:[],expenses:[],tasks:[],health:[],settings:{apiUrl:'',syncKey:''},mealIndex:0};
let state=load();

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const dateISO=()=>new Date().toLocaleDateString('sv-SE');
const yen=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n||0);
function load(){try{return {...structuredClone(defaultState),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(defaultState)}}
function save(sync=true){localStorage.setItem(KEY,JSON.stringify(state));render();if(sync&&state.settings.apiUrl)debouncedSync()}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function openModal(id){$('#'+id).showModal()}
$$('[data-open]').forEach(b=>b.onclick=()=>openModal(b.dataset.open));
$('#expenseDate').value=dateISO();$('#taskDeadline').value=dateISO();
$('#healthHp').oninput=e=>$('#hpOutput').value=e.target.value;

function render(){
  const now=new Date();
  $('#todayLabel').textContent=now.toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'});
  const level=Math.floor(state.exp/100)+1, progress=state.exp%100;
  $('#level').textContent=level;$('#exp').textContent=state.exp;$('#expBar').style.width=progress+'%';

  const missions=[...state.missions].sort((a,b)=>(a.done-b.done)||(a.createdAt>b.createdAt?1:-1));
  $('#missionList').innerHTML=missions.map(m=>`<div class="item ${m.done?'done':''}">
    <button class="check" onclick="toggleMission('${m.id}')">${m.done?'✓':''}</button>
    <div class="item-main"><div class="item-title">${esc(m.title)}</div><div class="item-meta">
      <span class="pill">${esc(m.type)}</span><span>最低：${esc(m.minimum||'1分だけ')}</span><span>+${m.exp}EXP</span>
    </div></div><button class="delete" onclick="deleteMission('${m.id}')">×</button></div>`).join('');
  $('#missionEmpty').hidden=missions.length>0;

  const today=dateISO();
  const todayExp=state.expenses.filter(x=>x.date===today);
  $('#expenseList').innerHTML=todayExp.slice().reverse().map(x=>`<div class="item">
    <div class="item-main"><div class="item-title">${esc(x.title||x.category)} <b>${yen(x.amount)}</b></div>
    <div class="item-meta"><span>${esc(x.category)}</span><span>${esc(x.method)}</span><span>${x.date}</span></div></div>
    <button class="delete" onclick="removeExpense('${x.id}')">×</button></div>`).join('');
  $('#expenseEmpty').hidden=todayExp.length>0;

  const openTasks=state.tasks.filter(x=>!x.done).sort((a,b)=>a.deadline.localeCompare(b.deadline));
  $('#taskList').innerHTML=openTasks.slice(0,5).map(x=>`<div class="item">
    <button class="check" onclick="toggleTask('${x.id}')"></button>
    <div class="item-main"><div class="item-title">${esc(x.subject)}｜${esc(x.title)}</div>
    <div class="item-meta"><span>期限 ${x.deadline}</span><span>${x.minutes}分</span></div></div>
    <button class="delete" onclick="deleteTask('${x.id}')">×</button></div>`).join('');
  $('#taskEmpty').hidden=openTasks.length>0;

  const ym=today.slice(0,7);
  const month=state.expenses.filter(x=>x.date.startsWith(ym)).reduce((s,x)=>s+Number(x.amount),0);
  $('#monthExpense').textContent=yen(month);
  $('#taskCount').textContent=openTasks.length+'件';
  $('#choreCount').textContent=state.missions.filter(x=>x.type==='家事'&&!x.done).length+'件';
  const h=state.health.filter(x=>x.date===today).at(-1);$('#hpValue').textContent=(h?.hp??80)+'%';

  const meals=[['豚しゃぶ','野菜と肉をまとめて食べられる'],['うどん＋サラダチキン','疲れた日の最低ライン'],['鶏肉のチーズ焼き','好きなもので続ける'],['ポキ丼＋味噌汁','買って済ませてもOK'],['豚肉と野菜の炒め物','冷蔵庫整理にも使える'],['外食・お惣菜','今日は作らない選択も正解']];
  const meal=meals[state.mealIndex%meals.length];$('#mealTitle').textContent=meal[0];$('#mealNote').textContent=meal[1];

  $('#apiUrl').value=state.settings.apiUrl||'';$('#syncKey').value=state.settings.syncKey||'';
  $('#connectionStatus').textContent=state.settings.apiUrl?'Googleスプレッドシート同期を設定済み':'この端末に保存中';
}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

$('#saveMission').onclick=()=>{
 const title=$('#missionTitle').value.trim();if(!title)return toast('やることを入力してね');
 state.missions.push({id:uid(),type:$('#missionType').value,title,minimum:$('#missionMinimum').value.trim(),exp:+$('#missionExp').value||10,done:false,createdAt:new Date().toISOString()});
 $('#missionTitle').value='';$('#missionMinimum').value='';$('#missionModal').close();save();toast('ミッション追加！');
};
window.toggleMission=id=>{const m=state.missions.find(x=>x.id===id);if(!m)return;m.done=!m.done;state.exp=Math.max(0,state.exp+(m.done?m.exp:-m.exp));save();toast(m.done?`+${m.exp} EXP！`:'未完了に戻しました')};
window.deleteMission=id=>{state.missions=state.missions.filter(x=>x.id!==id);save()};
$('#saveExpense').onclick=()=>{
 const amount=+$('#expenseAmount').value;if(!amount)return toast('金額を入力してね');
 state.expenses.push({id:uid(),date:$('#expenseDate').value||dateISO(),amount,category:$('#expenseCategory').value,title:$('#expenseTitle').value.trim(),method:$('#expenseMethod').value});
 $('#expenseAmount').value='';$('#expenseTitle').value='';$('#expenseModal').close();save();toast('支出を保存しました');
};
window.removeExpense=id=>{state.expenses=state.expenses.filter(x=>x.id!==id);save()};
$('#saveTask').onclick=()=>{
 const title=$('#taskTitle').value.trim();if(!title)return toast('課題名を入力してね');
 state.tasks.push({id:uid(),subject:$('#taskSubject').value.trim()||'未分類',title,deadline:$('#taskDeadline').value||dateISO(),minutes:+$('#taskMinutes').value||30,done:false});
 $('#taskTitle').value='';$('#taskSubject').value='';$('#studyModal').close();save();toast('課題を追加しました');
};
window.toggleTask=id=>{const t=state.tasks.find(x=>x.id===id);t.done=!t.done;if(t.done)state.exp+=20;save()};
window.deleteTask=id=>{state.tasks=state.tasks.filter(x=>x.id!==id);save()};
$('#saveHealth').onclick=()=>{
 state.health.push({id:uid(),date:dateISO(),hp:+$('#healthHp').value,sleep:+$('#healthSleep').value||null,weight:+$('#healthWeight').value||null,memo:$('#healthMemo').value.trim()});
 $('#healthModal').close();save();toast('体調を保存しました');
};
$('#mealShuffleBtn').onclick=()=>{state.mealIndex++;save();};
$('#saveSettings').onclick=()=>{state.settings.apiUrl=$('#apiUrl').value.trim();state.settings.syncKey=$('#syncKey').value;$('#settingsModal').close();save(false);toast('設定を保存しました')};
$('#resetBtn').onclick=()=>{if(confirm('すべてのデータを初期化しますか？')){state=structuredClone(defaultState);save(false);$('#settingsModal').close()}};
$('#exportBtn').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download=`nurse-quest-backup-${dateISO()}.json`;a.click()};
$('#importInput').onchange=async e=>{try{state=JSON.parse(await e.target.files[0].text());save();toast('読み込みました')}catch{toast('読み込みに失敗しました')}};
$('#syncBtn').onclick=()=>syncNow(true);
let timer;function debouncedSync(){clearTimeout(timer);timer=setTimeout(()=>syncNow(false),1200)}
async function api(action,payload={}){
 if(!state.settings.apiUrl)throw new Error('連携URLが未設定です');
 const r=await fetch(state.settings.apiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,key:state.settings.syncKey,...payload})});
 const data=await r.json();if(!data.ok)throw new Error(data.error||'通信エラー');return data;
}
async function syncNow(show){
 try{const d=await api('sync',{state});if(d.state)state=d.state;localStorage.setItem(KEY,JSON.stringify(state));render();if(show)toast('同期しました')}catch(e){if(show)toast(e.message)}
}
$('#aiPlanBtn').onclick=async()=>{
 if(!state.settings.apiUrl)return openModal('settingsModal');
 $('#aiPlanBtn').disabled=true;$('#aiPlanBtn').textContent='考え中…';
 try{const d=await api('aiPlan',{state});state.missions=d.missions||state.missions;$('#secretaryMessage').textContent=d.message||'今日は最低ラインだけで大丈夫。';save(false);toast('今日のプランを作りました')}
 catch(e){toast(e.message)}finally{$('#aiPlanBtn').disabled=false;$('#aiPlanBtn').textContent='AIに決めてもらう'}
};
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
render();