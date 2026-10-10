from pathlib import Path


def replace_once(path, old, new):
    p=Path(path)
    text=p.read_text()
    count=text.count(old)
    if count!=1:
        raise SystemExit(f'{path}: expected one match, got {count}')
    p.write_text(text.replace(old,new,1))

replace_once('app.js',
"""function reconcileListChildren(root,nodes){
  const wanted=new Set(nodes);
  [...root.children].forEach(child=>{if(!wanted.has(child))child.remove()});
  nodes.forEach((node,index)=>{
    const current=root.children[index]||null;
    if(current!==node)root.insertBefore(node,current);
  });
}""",
"""function reconcileListChildren(root,nodes){
  const wanted=new Set(nodes);
  [...root.children].forEach(child=>{if(!wanted.has(child))child.remove()});
  let anchor=null;
  for(let index=nodes.length-1;index>=0;index--){
    const node=nodes[index];
    if(node.parentNode!==root||node.nextSibling!==anchor)root.insertBefore(node,anchor);
    anchor=node;
  }
}""")

replace_once('tests/list-render-reuse.test.mjs',
"""class FakeNode{
  constructor(id){this.id=id;this.parentNode=null}
  remove(){""",
"""class FakeNode{
  constructor(id){this.id=id;this.parentNode=null}
  get nextSibling(){
    if(!this.parentNode)return null;
    const index=this.parentNode.children.indexOf(this);
    return index>=0?(this.parentNode.children[index+1]||null):null;
  }
  remove(){""")

print('P2 reconciliation fix applied')
