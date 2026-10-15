'use strict';
(async()=>{
 const $=s=>document.querySelector(s);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=v=>typeof v==='string'&&/^(assets|uploads)\/[A-Za-z0-9_.-]+$/.test(v)?v:'';
 const href=(kind,id)=>'content.html?type='+encodeURIComponent(kind)+(id?'&id='+encodeURIComponent(id):'');
 const portraits=new Set(['5f3108726fd24fddaf75fccc02176109.png','fd15182b60784d59b2c1530d1063808a.png','7852ba16096f4c15b7bc5f311771ce0e.png','5f76f43ea47f49c9a6b1fec1cd5cb489.png']);
 const portraitCrops=new Map([["8f04a9ea36da41d896a98d375fe7750b.png","site-manager"],["99f32f0a6094435c8cfd3dfa6ce6123f.png","geomancer"],["72bd6525fffa42df9841bff0441b2b4f.png","center-manager"],["7538d500f20f47d09e5f4e3be80759a4.png","laundry-owner"],["db4b23deafec4d0a977fd64aeec51374.png","park-staff"]]);
 function portrait(i){const p=safe(i.image),file=p.split('/').pop(),crop=portraitCrops.get(file);return p?'<div class="'+(crop||portraits.has(file)?'portrait-sheet'+(crop?' is-'+crop:i.id==='trainer'?' is-trainer':''):'cast-photo')+'"><img src="'+esc(p)+'" alt="'+esc(i.title)+'" loading="lazy"></div>':'';}
 async function read(){const paths=(location.hostname||'').endsWith('.github.io')?['site-content.json']:['api/site-content','site-content.json'];for(const path of paths){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);try{const r=await fetch(path,{signal:controller.signal});if(!r.ok)continue;const d=await r.json();if(d.schemaVersion===1)return d;}catch{}finally{clearTimeout(timer)}}throw Error('콘텐츠를 불러오지 못했습니다.');}
 try{
  const data=await read(),visible=k=>(data[k]||[]).filter(i=>i.state==='published');
  const characters=visible('characters'),goods=visible('goods'),ost=visible('ost');
  document.querySelectorAll('[data-content-nav]').forEach(a=>{a.hidden=!visible(a.dataset.contentNav).length;});
  if(characters.length&&$('#home-characters')){
   $('#home-characters').innerHTML=characters.slice(0,4).map(i=>'<a class="cast-card" href="'+href('characters',i.id)+'">'+portrait(i)+'<span class="cast-role">'+esc(i.role||'작품 속 인물')+'</span><h3>'+esc(i.title)+'<span aria-hidden="true">↗</span></h3><p>'+esc(i.summary||'')+'</p></a>').join('');
   $('#characters-section').hidden=false;
  }
  if(goods.length&&$('#home-goods')){
   const first=goods[0],img=safe(first.image),concept=goods.every(i=>i.prototype||i.stage==='idea');
   $('#home-goods').innerHTML=(img?'<a class="goods-board" href="'+href('goods')+'"><img src="'+esc(img)+'" alt="'+esc(first.title)+' 굿즈 제작 시안" loading="lazy"></a>':'')+'<div class="goods-copy"><p class="section-label">04 / FROM SCREEN TO EVERYDAY</p><span class="goods-note">'+(concept?'제작 시안 · 실제 제작 전':'작품 굿즈')+'</span><h2>'+(concept?'이야기 속 물건을,<br>일상 가까이.':'이야기를 일상 가까이.')+'</h2><p>'+(concept?'본편에 나온 물건과 세 사람의 색을<br>손에 쥐는 굿즈 시안으로 옮겼습니다.':esc(first.summary||''))+'</p><div class="goods-types">'+goods.slice(0,4).map(i=>'<span>'+esc(i.title.split('·').at(-1).trim())+'</span>').join('')+'</div><a class="solid-link" href="'+href('goods')+'">'+(concept?'굿즈 시안 자세히 보기':'굿즈 모두 보기')+' ↗</a></div>';
   $('#goods-section').hidden=false;
  }
  if(ost.length&&$('#home-soundtrack')){
   const i=ost[0],audio=safe(i.audio);
   $('#home-soundtrack').innerHTML='<div class="soundtrack-feature"><div class="soundtrack-cover"><span>ORIGINAL SOUNDTRACK</span><strong>'+esc(i.title)+'</strong><span>악동꼬마</span></div><div><p class="section-label">THE SOUND OF JOSEON</p><h2>이야기에 음악을 더하면.</h2><p>'+esc(i.summary||i.title)+'</p>'+(audio?'<audio controls preload="none" src="'+esc(audio)+'" aria-label="'+esc(i.title)+' 재생"></audio>':'')+'<p><a class="editorial-link" href="'+href('ost',i.id)+'">곡 이야기 보기 ↗</a></p></div></div>';
   $('#soundtrack-section').hidden=false;
  }
  const journal=[...visible('news').map(i=>({...i,kind:'news'})),...visible('plans').map(i=>({...i,kind:'plans'}))].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,3);
  if(journal.length&&$('#home-journal')){
   $('#home-journal').innerHTML=journal.map(i=>'<a class="journal-item" href="'+href(i.kind,i.id)+'"><time datetime="'+esc(i.date||'')+'">'+esc(i.date||'날짜 미정')+'</time><div><strong>'+esc(i.title)+'</strong><p>'+esc(i.summary||'')+'</p></div><span aria-hidden="true">↗</span></a>').join('');
   $('#journal-section').hidden=false;
  }
 }catch(error){console.warn(error.message);}
 function revealHash(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  let parent=target.closest('details');while(parent){parent.open=true;parent=parent.parentElement?.closest('details');}
  if(target.closest('#archive-library'))target.scrollIntoView({block:'start'});
 }
 revealHash();window.addEventListener('hashchange',revealHash);
 document.addEventListener('click',ev=>{if(ev.target.closest('[data-play],[data-episode],a'))document.querySelectorAll('audio,video').forEach(m=>m.pause());});
 document.addEventListener('play',ev=>{if(ev.target.matches('audio,video'))document.querySelectorAll('audio,video').forEach(m=>{if(m!==ev.target)m.pause();});},true);
})();
