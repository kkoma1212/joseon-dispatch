'use strict';
const names={characters:'작품 속 인물',ost:'OST',interviews:'인터뷰',watchOrders:'감상 순서',goods:'굿즈',plans:'공개 계획',news:'소식'};
const labels={draft:'초안',teaser:'공개 예고',published:'공개',idea:'구상 중',making:'제작 중',showcase:'소개 공개',selling:'판매 중',ended:'판매 종료',planned:'예정',delayed:'일정 갱신 대기',released:'공개 완료',cancelled:'취소',confirmed:'확정',estimated:'예상',unknown:'날짜 미정'};
const qs=new URLSearchParams(location.search),preview=qs.get('preview')==='1',root=document.querySelector('#content-root');let data,episodes;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeMedia=v=>typeof v==='string'&&/^(assets|uploads)\/[A-Za-z0-9_.-]+$/.test(v)?v:'';
const photoRegions=new Set(['full','top-left','top-right','bottom-left','bottom-right']);
function photo(path,alt,region){const image=picture(path,alt);return region&&region!=='full'&&photoRegions.has(region)?'<div class="photo-crop crop-'+region+'">'+image+'</div>':image;}
const safeURL=v=>{try{const u=new URL(v);return u.protocol==='https:'&&!u.username?u.href:'';}catch{return '';}};
const link=(kind,id)=>'content.html?type='+encodeURIComponent(kind)+(id?'&id='+encodeURIComponent(id):'')+(preview?'&preview=1':'');
const episode=id=>episodes.find(e=>e.id===id),playable=e=>e?.status==='complete'&&safeURL(e.youtube);
const epLink=id=>'./?episode='+encodeURIComponent(id)+'&view=watch';
function picture(path,alt){path=safeMedia(path);return path?'<img src="'+esc(path)+'" alt="'+esc(alt)+'" loading="lazy">':'';}
const portraitPaths=new Set(['5f3108726fd24fddaf75fccc02176109.png','fd15182b60784d59b2c1530d1063808a.png','7852ba16096f4c15b7bc5f311771ce0e.png','5f76f43ea47f49c9a6b1fec1cd5cb489.png']);
function portrait(item){return portraitPaths.has(String(item.image).split("/").pop())?'<div class="portrait-sheet'+(item.id==='trainer'?' is-trainer':'')+'">'+picture(item.image,item.title)+'</div>':picture(item.image,item.title);}
const introductions={characters:'왕과 내관, 그리고 현대의 규칙을 지키는 사람들. 익숙한 얼굴의 또 다른 이야기를 만나보세요.',goods:'본편의 표정과 한마디를 일상 가까이. 아직 실제 제작 전인 굿즈 시안입니다.',ost:'작품의 분위기를 음악으로 만나보세요.',interviews:'만드는 사람과 작품 속 인물에게 묻습니다.',watchOrders:'시즌 1부터 차례대로, 또는 마음에 드는 이야기부터. 나에게 맞는 감상 순서를 찾아보세요.',plans:'본편과 작품 콘텐츠의 공개 기록입니다.',news:'새로운 이야기와 만드는 동안의 소식을 전합니다.'};
function card(kind,item){const label=item.state==='teaser'?'공개 예고':kind==='characters'?item.role||'작품 속 인물':kind==='goods'?(item.prototype?'제작 시안 · 실제 제작 전':labels[item.stage]||'굿즈'):kind==='interviews'?(item.interviewKind==='character'?'인물 가상 인터뷰':'제작자 인터뷰'):labels[item.state]||'';const visual=kind==='characters'?portrait(item):photo(item.image,item.title,item.imageRegion);return '<article class="card">'+(visual?'<a class="card-visual" href="'+link(kind,item.id)+'" aria-label="'+esc(item.title)+' 자세히 보기">'+visual+'</a>':'')+'<span class="tag">'+esc(label)+'</span><h2><a href="'+link(kind,item.id)+'">'+esc(item.title)+'</a></h2>'+(item.summary?'<p>'+esc(item.summary)+'</p>':'')+'</article>';}
function epList(ids,orderId){return '<div class="grid">'+ids.map(episode).filter(Boolean).map(e=>'<article class="card">'+picture(e.thumbnail,e.title)+'<small>시즌 '+e.season+' · '+e.episode+'편</small><h3>'+esc(e.title)+'</h3>'+(playable(e)?'<a class="button" href="'+(epLink(e.id)+(orderId?'&order='+encodeURIComponent(orderId):''))+'">본편 보기</a>':'<span class="tag">공개 준비 중</span>')+'</article>').join('')+'</div>';}
function field(label,value){return value?'<dt>'+label+'</dt><dd>'+esc(value)+'</dd>':'';}
function renderDetail(kind,item){
 document.title=item.title+' · 조선에 출동했습니다';
 let body='<span class="tag">'+esc(labels[item.state])+'</span><h1>'+esc(item.title)+'</h1>'+(item.summary?'<p>'+esc(item.summary)+'</p>':'');
 if(item.state==='teaser'){root.innerHTML='<a class="button" href="'+link(kind)+'">← '+names[kind]+'</a><article class="detail">'+body+'<p>내용을 준비하고 있습니다.</p></article>';return;}
 if(kind==='characters'){
  body='<div class="profile">'+portrait(item)+'<div>'+body+'<dl>'+field('역할',item.role)+field('성격',item.personality)+field('특기',item.strength)+field('약점',item.weakness)+'</dl></div></div>';
  if(item.quotes?.length)body+='<h2>대표 대사</h2>'+item.quotes.map(q=>{const text='<blockquote>'+esc(q.text)+'<br><a href="./?episode='+encodeURIComponent(q.episode)+'&view=script&scene='+q.scene+'">'+esc(episode(q.episode)?.title)+' · 장면 '+q.scene+'</a></blockquote>';return q.spoiler?'<details><summary>결말 대사 펼치기</summary>'+text+'</details>':text;}).join('');
  const interviews=data.interviews.filter(i=>i.character===item.id);if(interviews.length)body+='<h2>이 인물의 인터뷰</h2><div class="grid">'+interviews.map(i=>card('interviews',i)).join('')+'</div>';
 }
 if(kind==='ost'){
  if(item.image)body+=picture(item.image,item.title);else body+='<div class="ost-art" role="img" aria-label="'+esc(item.title)+' 제목 기반 임시 표지"><span class="ost-art-kicker">악동꼬마 · 작품 OST</span><strong>'+esc(item.title)+'</strong><span class="ost-art-seal" aria-hidden="true">出動</span><span class="ost-art-line" aria-hidden="true"></span><small>제목 기반 임시 표지</small></div>';
  if(safeMedia(item.audio))body+='<audio controls preload="none" src="'+esc(item.audio)+'" aria-label="'+esc(item.title)+' 재생"></audio>';
  if(item.duration)body+='<p>재생시간 '+Math.floor(item.duration/60)+':'+String(Math.floor(item.duration%60)).padStart(2,'0')+'</p>';
  if(item.credits)body+='<h2>제작 크레딧</h2><p class="body">'+esc(item.credits)+'</p>';
  if(item.lyrics)body+='<details><summary>가사 보기</summary><p class="body">'+esc(item.lyrics)+'</p></details>';
 }
 if(kind==='interviews'){
  body+='<p class="tag">'+(item.interviewKind==='character'?'인물 가상 인터뷰 · 작품 설정에 따른 창작 인터뷰':'제작자 인터뷰')+'</p>';
  if(safeMedia(item.video))body+='<video controls preload="metadata" src="'+esc(item.video)+'"></video>';
  else if(safeURL(item.video))body+='<a class="button" href="'+esc(safeURL(item.video))+'" target="_blank" rel="noopener">인터뷰 영상 보기 ↗</a>';
  body+=(item.questions||[]).map(q=>'<section class="qa"><h3>'+esc(q.question)+'</h3><p class="body">'+esc(q.answer||'답변을 준비하고 있습니다.')+'</p></section>').join('');
  if(item.character&&data.characters.some(i=>i.id===item.character))body+='<a class="button" href="'+link('characters',item.character)+'">인물 소개 보기</a>';
 }
 if(kind==='watchOrders')body+=epList(item.items||[],item.id);
 if(kind==='goods'){const visual=photo(item.image,item.title,item.imageRegion);body='<div class="goods-detail-head"><div class="goods-detail-visual">'+visual+'</div><div class="goods-detail-copy">'+body+'<p class="tag">'+esc(labels[item.stage])+(item.prototype?' · 제작 시안 · 실제 제작 전':'')+'</p>'+(item.prototype?'<div class="concept-note">이미지는 AI로 만든 제품 디자인 시안입니다. 실제 제품의 크기·소재·색상과 제작 일정은 아직 정해지지 않았습니다.</div>':'')+(item.stage==='selling'&&safeURL(item.shop)?'<p>'+esc(item.price||'')+'</p><a class="button primary" href="'+esc(safeURL(item.shop))+'" target="_blank" rel="noopener">판매처 보기 ↗</a>':'')+'</div></div>';if(safeMedia(item.image))body+='<details class="goods-board-more"><summary>제작 시안 살펴보기 · 전체 이미지</summary>'+picture(item.image,item.title)+'<p><a href="'+esc(item.image)+'" target="_blank" rel="noopener">원본 이미지 크게 보기 ↗</a></p></details>';if(item.photos?.length)body+='<div class="photos">'+item.photos.filter(p=>p.image!==item.image||p.region!==item.imageRegion).map(p=>'<figure>'+photo(p.image,p.caption||item.title,p.region)+'<figcaption>'+esc(p.caption)+'</figcaption></figure>').join('')+'</div>';}
 if(kind==='plans')body+='<p>'+esc(item.date||'날짜 미정')+' · '+esc(labels[item.certainty])+' · '+esc(labels[item.scheduleState])+'</p>';
 if(kind==='news')body+='<p>'+esc(item.date)+'</p><p class="body">'+esc(item.body)+'</p>';
 if(item.targetKind&&item.targetId)body+='<a class="button" href="'+(item.targetKind==='episodes'?epLink(item.targetId):link(item.targetKind,item.targetId))+'">관련 콘텐츠 보기</a>';
 if(item.photos?.length&&kind!=='goods')body+='<h2>'+(kind==='goods'?'제작 시안 살펴보기':'사진')+'</h2><div class="photos">'+item.photos.map(p=>'<figure>'+photo(p.image,p.caption||item.title,p.region)+'<figcaption>'+esc(p.caption)+(safeMedia(p.image)?'<br><a href="'+esc(p.image)+'" target="_blank" rel="noopener">원본 이미지 크게 보기 ↗</a>':'')+'</figcaption></figure>').join('')+'</div>';
 if(item.episodes?.length&&kind!=='watchOrders')body+='<h2>등장·관련 본편</h2>'+epList(item.episodes);
 root.innerHTML='<p><a class="button" href="'+link(kind)+'">← '+names[kind]+'</a></p><article class="detail">'+body+'</article>';
}
function renderList(kind){
 root.innerHTML='<p class="kicker">조선에 출동했습니다</p><h1>'+names[kind]+'</h1><p class="collection-intro">'+introductions[kind]+'</p><div class="tools"><input id="search" type="search" aria-label="'+names[kind]+' 검색" placeholder="제목·소개 검색">'+(kind==='characters'?'<select id="filter" aria-label="등장 시즌"><option value="">전체 시즌</option><option value="1">시즌 1</option><option value="2">시즌 2</option></select>':kind==='interviews'?'<select id="filter" aria-label="인터뷰 종류"><option value="">전체 인터뷰</option><option value="creator">제작자</option><option value="character">인물 가상 인터뷰</option></select>':'')+'</div><div id="list" class="grid"></div>';
 function update(){const query=document.querySelector('#search').value.trim().toLowerCase(),filter=document.querySelector('#filter')?.value;let items=data[kind].filter(i=>(i.title+' '+(i.summary||'')).toLowerCase().includes(query));if(filter)items=items.filter(i=>kind==='characters'?(i.episodes||[]).some(id=>episode(id)?.season===Number(filter)):i.interviewKind===filter);if(kind==='news')items.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(b.date||'').localeCompare(a.date||''));document.querySelector('#list').innerHTML=items.map(i=>card(kind,i)).join('')||'<p class="empty">'+(query||filter?'조건에 맞는 자료가 없습니다.':'아직 공개한 자료가 없습니다.')+'</p>';}
 document.querySelector('#search').addEventListener('input',update);document.querySelector('#filter')?.addEventListener('change',update);update();
}
function renderHome(){
 const latest=episodes.filter(playable).sort((a,b)=>b.season-a.season||b.episode-a.episode)[0];
 if(!latest){root.innerHTML='<h1>조선에 출동했습니다</h1><p class="empty">공개된 본편을 준비하고 있습니다.</p>';return;}
 let body='<div class="hero"><div><p class="kicker">악동꼬마가 AI로 만드는 사극 코미디 단편영화</p><h1>조선에<br>출동했습니다</h1><p>임금이라고 해도 안전모는 써야 하고, 운동은 직접 해야 합니다.</p><p><a class="button primary" href="'+epLink(latest.id)+'">최신 본편 보기</a> <a class="button" href="'+link('watchOrders','start-to-finish')+'">처음부터 보기</a></p></div><article class="card">'+picture((latest.stills||[])[0]||latest.thumbnail,latest.title)+'<p class="tag">출동 지령서 · 시즌 '+latest.season+' · '+latest.episode+'편</p><h2>'+esc(latest.title)+'</h2><p>'+esc(latest.synopsis)+'</p></article></div><section class="section"><h2>출동 기록</h2>'+epList(episodes.filter(playable).slice(-4).reverse().map(e=>e.id))+'<p><a href="./#episodes-section">모든 본편 보기 →</a></p></section>';
 for(const kind of Object.keys(names)){const items=data[kind];if(!items.length)continue;body+='<section class="section"><h2>'+names[kind]+'</h2><div class="grid">'+items.slice(0,kind==='characters'?4:3).map(i=>card(kind,i)).join('')+'</div><p><a href="'+link(kind)+'">전체 보기 →</a></p></section>';}
 root.innerHTML=body;
}
async function loadJSON(api,fallback){if(!preview&&(location.hostname||'').endsWith('.github.io')){const r=await fetch(fallback);if(!r.ok)throw Error('자료를 불러오지 못했습니다.');return r.json();}try{const r=await fetch(api,{headers:preview?{'X-Archive-Client':'studio-v2'}:{}});if(!r.ok)throw Error();return await r.json();}catch(e){if(preview)throw Error('제작자 서버를 새 버전으로 실행한 뒤 미리 보기를 열어 주세요.');const r=await fetch(fallback);if(!r.ok)throw Error('자료를 불러오지 못했습니다.');return r.json();}}
(async()=>{try{
 [data,episodes]=await Promise.all([loadJSON(preview?'/api/content-preview':'api/site-content','site-content.json'),loadJSON('api/episodes','episodes.json')]);
 if(!data||data.schemaVersion!==1||!Array.isArray(episodes))throw Error('자료 형식을 확인해 주세요.');
 for(const k of Object.keys(names))if(!Array.isArray(data[k]))throw Error('자료 형식을 확인해 주세요.');
 document.querySelectorAll('nav [data-kind]').forEach(a=>{a.hidden=!data[a.dataset.kind]?.length;if(a.dataset.kind===qs.get('type'))a.setAttribute('aria-current','page');});
 if(preview){document.querySelector('#preview-note')?.removeAttribute('hidden');document.querySelectorAll('nav a[href^="content.html"]').forEach(a=>a.href+='&preview=1');}
 if(location.pathname.endsWith('content-preview.html'))renderHome();else{const kind=names[qs.get('type')]?qs.get('type'):'characters';root.className='content-kind-'+kind;const item=data[kind].find(i=>i.id===qs.get('id'));if(qs.has('id')&&!item)root.innerHTML='<h1>공개된 자료가 없습니다.</h1><a href="'+link(kind)+'">목록 보기</a>';else item?renderDetail(kind,item):renderList(kind);}
 }catch(e){root.innerHTML='<p class="notice">'+esc(e.message)+'</p>';}})();
document.addEventListener('play',event=>{if(event.target.matches('audio,video'))document.querySelectorAll('audio,video').forEach(media=>{if(media!==event.target)media.pause();});},true);
document.addEventListener('click',event=>{if(event.target.closest('a'))document.querySelectorAll('audio,video').forEach(media=>media.pause());});
