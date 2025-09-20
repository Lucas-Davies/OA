export function el(tag,attrs={},...kids){
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})) (k==='class'? n.className=v : n.setAttribute(k,v));
  for(const k of kids) n.append(k?.nodeType?k:document.createTextNode(k??''));
  return n;
}
export function normalizeCourse(c){
  return {
    id:c.id, title:c.title, level:c.level, hero:c.hero, summary:c.summary,
    modules:(c.modules||[]).map(m=>({id:m.id, title:m.title, lessons:(m.lessons||[])}))
  };
}
function renderBlock(b){
  if(b.type==='richtext'){ const d=el('div',{class:'rt'}); d.innerHTML=b.data?.html||''; return d; }
  if(b.type==='image'){ return el('figure',{}, el('img',{src:b.data?.src||'',alt:b.data?.caption||''}), b.data?.caption?el('figcaption',{},b.data.caption):''); }
  if(b.type==='video'){ return el('video',{controls:'',poster:b.data?.poster||''}, el('source',{src:b.data?.src||''})); }
  return el('div',{},'[Unknown block]');
}
export function renderCourse(c){
  const root=el('article',{class:'course'});
  root.append(el('header',{class:'hero'},
    el('img',{src:c.hero?.image||'/OA/assets/placeholders/hero.jpg',alt:c.title}),
    el('div',{class:'t'},c.title)
  ));
  (c.modules||[]).forEach(m=>{
    const sec=el('section',{class:'module'}, el('h2',{},m.title));
    (m.lessons||[]).forEach(ls=>{
      const l=el('section',{class:'lesson'}, el('h3',{},ls.title));
      (ls.blocks||[]).forEach(b=> l.append(renderBlock(b)));
      sec.append(l);
    });
    root.append(sec);
  });
  return root;
}
