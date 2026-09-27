/* Nature.ON GitHub Pages static content adapter.
 * GitHub Pages does not execute PHP/server-side code, so public news/gallery
 * data and the demo HQ login are stored in this browser's localStorage.
 * For real multi-user administration, connect this adapter to an external
 * backend (Supabase/Firebase/etc.) later without changing the page UI.
 */
window.NatureContent = (() => {
  const NEWS_KEY = 'natureon_public_news_v1';
  const GALLERY_KEY = 'natureon_gallery_v1';
  const SESSION_KEY = 'natureon_static_admin_session_v1';
  const defaultNews = [
    {id:'news_demo_1',category:'소식',date:'2026-09-26',title:'Nature.ON 새로운 소식',body:'Nature.ON의 새로운 운영 소식과 현장 이야기를 전합니다.',image:'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80'},
    {id:'news_demo_2',category:'운영이야기',date:'2026-09-22',title:'현장 중심의 운영이야기',body:'고객의 목소리를 반영하여 메뉴와 서비스 품질을 높여가는 과정을 소개합니다.',image:'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80'},
    {id:'news_demo_3',category:'운영이야기',date:'2026-09-18',title:'건강한 식단을 준비하는 하루',body:'신선한 식재료와 정성스러운 조리로 매일의 한 끼를 준비합니다.',image:'https://images.unsplash.com/photo-1543353071-873f17a088?auto=format&fit=crop&w=1200&q=80'}
  ];
  const defaultGallery = [
    {id:'gallery_demo_1',date:'2026-09-26',title:'현장과 함께하는 Nature.ON',body:'현장 구성원들과 함께 더 나은 식음서비스를 만들어가는 순간입니다.',image:'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80'},
    {id:'gallery_demo_2',date:'2026-09-20',title:'건강한 한 끼를 준비하는 시간',body:'신선한 식재료와 정성스러운 조리로 매일의 식사를 준비합니다.',image:'https://images.unsplash.com/photo-1543353071-873f17a088?auto=format&fit=crop&w=1200&q=80'},
    {id:'gallery_demo_3',date:'2026-09-15',title:'Nature.ON 사내 활동',body:'함께 배우고 소통하며 더 좋은 운영을 만들어갑니다.',image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'}
  ];
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function read(key, fallback){
    try{
      const raw=localStorage.getItem(key);
      if(raw!==null){const value=JSON.parse(raw); if(Array.isArray(value)) return value;}
      const seed=clone(fallback); localStorage.setItem(key,JSON.stringify(seed)); return seed;
    }catch{return clone(fallback)}
  }
  function write(key,value){localStorage.setItem(key,JSON.stringify(value));}
  function get(kind){return clone(read(kind==='news'?NEWS_KEY:GALLERY_KEY,kind==='news'?defaultNews:defaultGallery));}
  function set(kind,value){write(kind==='news'?NEWS_KEY:GALLERY_KEY,value);}
  const state={news:get('news'),gallery:get('gallery')};
  function refresh(){state.news=get('news');state.gallery=get('gallery');return Promise.resolve({ok:true,news:clone(state.news),gallery:clone(state.gallery)});}
  function requireAdmin(){if(!sessionStorage.getItem(SESSION_KEY))throw new Error('관리자 로그인이 필요합니다.');}
  function formToObject(data){const o={};if(data&&typeof data.forEach==='function')data.forEach((v,k)=>{o[k]=v});return o;}
  const ready=refresh();
  return {
    get news(){return clone(state.news)},
    get gallery(){return clone(state.gallery)},
    ready,
    refresh,
    async login(username,password){
      // Static GitHub Pages demo credentials. This is NOT a secure server login.
      if(username!=='hq'||password!=='1234')throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
      sessionStorage.setItem(SESSION_KEY,JSON.stringify({username:'hq',role:'hq'}));
      return {ok:true};
    },
    async logout(){sessionStorage.removeItem(SESSION_KEY);return {ok:true};},
    async save(data){
      requireAdmin();
      const input=formToObject(data); const kind=input.kind;
      if(!['news','gallery'].includes(kind))throw new Error('잘못된 콘텐츠 종류입니다.');
      const rows=get(kind); const id=String(input.id||''); const old=rows.find(x=>String(x.id)===id);
      let image=old?.image||'';
      const file=input.image;
      if(file&&typeof file!=='string'&&file.size){
        if(file.size>500000)throw new Error('GitHub Pages 버전에서는 사진을 500KB 이하로 선택해 주세요.');
        image=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
      }
      const row={id:id||kind+'_'+Date.now(),date:String(input.date||''),title:String(input.title||'').trim(),body:String(input.body||'').trim(),image};
      if(!row.date||!row.title||!row.body)throw new Error('제목, 내용, 날짜를 확인해 주세요.');
      if(kind==='news')row.category=['소식','운영이야기'].includes(input.category)?input.category:'소식';
      if(kind==='gallery'&&!row.image)throw new Error('갤러리 사진을 선택해 주세요.');
      const next=old?rows.map(x=>String(x.id)===id?row:x):[...rows,row];
      try{set(kind,next);}catch{throw new Error('브라우저 저장 공간이 부족합니다. 사진 크기를 줄여 주세요.');}
      await refresh(); return {ok:true,item:clone(row)};
    },
    async remove(kind,id){
      requireAdmin();
      if(!['news','gallery'].includes(kind))throw new Error('잘못된 콘텐츠 종류입니다.');
      set(kind,get(kind).filter(x=>String(x.id)!==String(id))); await refresh(); return {ok:true};
    }
  };
})();
