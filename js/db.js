export const db = {
  _C:'faoa.courses.v1', _R:'faoa.releases.v1',
  _load(k){ return JSON.parse(localStorage.getItem(k)||'{}'); },
  _save(k,v){ localStorage.setItem(k, JSON.stringify(v)); },
  createCourse(partial={}){
    const id = crypto.randomUUID();
    const c = { id, slug:'course-'+id.slice(0,8), title:'Untitled', summary:'', level:'bronze', status:'draft', version:1, hero:{}, modules:[], updated_at:new Date().toISOString(), ...partial };
    const all = this._load(this._C); all[id]=c; this._save(this._C, all); return c;
  },
  getCourse(id){ return this._load(this._C)[id]||null; },
  saveCourse(c){ const all=this._load(this._C); c.updated_at=new Date().toISOString(); all[c.id]=c; this._save(this._C, all); return c; },
  publish(id){
    const c = this.getCourse(id); if(!c) return null;
    const rels = this._load(this._R);
    const v = (rels[id]?.version||0)+1;
    const manifest = { id:c.id, title:c.title, level:c.level, hero:c.hero, summary:c.summary,
      modules:(c.modules||[]).map(m=>({id:m.id,title:m.title,lessons:(m.lessons||[])})) };
    rels[id] = { version:v, created_at:new Date().toISOString(), manifest };
    this._save(this._R, rels);
    c.status='published'; c.version=v; this.saveCourse(c);
    return v;
  }
};
