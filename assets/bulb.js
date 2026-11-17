/* Compute Genius bulb: light pulses travel up each circuit, nodes light as they arrive. */
(function(){
  var svg=document.querySelector('svg.bulb'); if(!svg) return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!svg.animate) return;                 // static, lit bulb
  var hero=document.querySelector('.hero');
  var SPEED=300, CYC=5200, anims=[];
  function $(id){return svg.getElementById(id)}
  function len(id){return $(id).getTotalLength()}
  function run(el,frames){var a=el.animate(frames,{duration:CYC,iterations:Infinity,easing:'linear'});anims.push(a);return a}

  function init(t0){
  // pulses
  var HEAD=46;
  var cfg={}; // id -> {start,dur}
  function spark(id,start){
    var el=$(id),L=len(id),d=L/SPEED; cfg[id]={start:start,dur:d};
    el.style.strokeDasharray=HEAD+' '+(L+HEAD); 
    var s=start*1000/CYC,e=(start+d)*1000/CYC, fr=[];
    fr.push({strokeDashoffset:HEAD,opacity:0,offset:0});
    if(s>0) fr.push({strokeDashoffset:HEAD,opacity:0,offset:s});
    fr.push({strokeDashoffset:HEAD,opacity:1,offset:s+.002});
    fr.push({strokeDashoffset:-L,opacity:1,offset:e});
    fr.push({strokeDashoffset:-L,opacity:0,offset:Math.min(1,e+.002)});
    if(e+.002<1) fr.push({strokeDashoffset:-L,opacity:0,offset:1});
    var a=el.animate(fr,{duration:CYC,iterations:Infinity,delay:0,easing:'linear'}); anims.push(a);
    return start+d;
  }
  var COL={o:['#F7891F','#ffd9a0'],w:['#F4EFE6','#ffffff']};
  function light(id,t){
    var g=$(id), core=g.querySelector('.core'), ring=g.querySelector('.nd'), halo=$('h-'+id);
    var c=t*1000/CYC, up=Math.min(.999,c+.012), dn=Math.min(.999,c+1500/CYC);
    function pulse(el,lo,hi,prop){
      var fr=[]; function f(o,v){var x={offset:o};x[prop]=v;return x}
      fr.push(f(0,lo)); if(c>.01) fr.push(f(Math.max(0,c-.01),lo));
      fr.push(f(up,hi)); fr.push(f(dn,lo)); fr.push(f(1,lo)); run(el,fr);
    }
    pulse(core,.16,1,'opacity'); pulse(halo,0,1,'opacity');
    var col=ring.classList.contains('o')?COL.o:COL.w;
    pulse(ring,col[0],col[1],'stroke');
  }
  var lines=['r1','r7','r8'];
  var tFL=spark('r1',t0/1000), tFR=spark('r7',t0/1000); spark('r8',t0/1000);
  spark('rl1',t0/1000+.1); spark('rl2',t0/1000+.22);
  // shoulder time ~ along filament; crown wave leaves the left shoulder then
  var fl=len('fl')/SPEED, shoulder=t0/1000+fl;
  var wv=spark('rw',shoulder), wd=cfg.rw.dur;
  var cr={c1:.10,c2:.38,c3:.64,c4:.90};
  Object.keys(cr).forEach(function(k){light(k,shoulder+wd*cr[k])});
  var tt={r2:['c1'],r3:['c2'],r4:['c2'],r5:['c3'],r6:['c4']};
  var starts={r2:cr.c1,r3:cr.c2,r4:(cr.c2+cr.c3)/2,r5:cr.c3,r6:cr.c4};
  var nodeOf={r1:'t1',r2:'t2',r3:'t3',r4:'t4',r5:'t5',r6:'t6',r7:'t7',r8:'t8',rl1:'l1',rl2:'l2'};
  Object.keys(starts).forEach(function(k){var e=spark(k,shoulder+wd*starts[k]);light(nodeOf[k],e)});
  ['r1','r7','r8','rl1','rl2'].forEach(function(k){light(nodeOf[k],cfg[k].start+cfg[k].dur)});

  // light lifting through the glass
  var lift=$('lift');
  if(lift){ var a=lift.animate([{transform:'translateY(0)',opacity:0,offset:0},{transform:'translateY(0)',opacity:0,offset:t0/CYC-.05},{transform:'translateY(0)',opacity:.9,offset:t0/CYC},{transform:'translateY(-560px)',opacity:.9,offset:(t0+2300)/CYC},{transform:'translateY(-560px)',opacity:0,offset:(t0+2900)/CYC},{transform:'translateY(-560px)',opacity:0,offset:1}],{duration:CYC,iterations:Infinity});anims.push(a); }

  }
  init(1500);
  // tap to toggle: pauses the pulses with the light
  var btn=document.querySelector('.bulb-btn');
  function setOff(off){
    anims.forEach(function(a){a.cancel()});anims=[];
    svg.querySelectorAll('.sp').forEach(function(e){e.style.opacity=0});
    if(!off) init(300);
  }
  if(btn&&hero){
    new MutationObserver(function(){setOff(hero.classList.contains('is-off'))}).observe(hero,{attributes:true,attributeFilter:['class']});
  }
  document.addEventListener('visibilitychange',function(){
    var off=hero&&hero.classList.contains('is-off');
    anims.forEach(function(a){(document.hidden||off)?a.pause():a.play()});
  });
})();
