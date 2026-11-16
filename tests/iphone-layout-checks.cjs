// Assertions on real browser measurements; viewport width filtering must be explicit.
const assert=require('node:assert/strict');
function verify(results){
  for(const r of results){
    const label=`${r.width}x${r.height} ${r.name}`;
    assert.equal(r.globalOverflow,0,`${label}: horizontal overflow`);
    assert.equal(r.scrollY,0,`${label}: global scroll`);
    assert.deepEqual(r.errors,[],`${label}: JS errors`);
    if(r.name==='lock'&&!process.env.AUDIT_BASELINE_CSS)
      assert.ok(r.elements['.security-modal'].y>=r.elements['.security-hero'].bottom,`${label}: lock overlap`);
    const container={'products-end':'#products','dishes-end':'.dishes-grid','settings-end':'.settings-scroll','list':'#listItems'}[r.name];
    if(container)assert.ok(r.ends[container].bottom<=r.elements['.tabs'].y,`${label}: last element behind navigation`);
  }
  return results.length;
}
module.exports=verify;
if(require.main===module){
  let results=JSON.parse(require('node:fs').readFileSync(process.argv[2],'utf8'));
  if(process.argv[3]==='--max-width')results=results.filter(r=>r.width<=Number(process.argv[4]));
  assert.ok(results.length,'No measurements selected');
  console.log('PASS',verify(results),'captured states');
}
