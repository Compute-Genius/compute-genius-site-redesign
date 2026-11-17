(function(){
  var d=document,root=d.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  /* nav */
  var nav=d.querySelector('.nav'),burger=d.querySelector('.burger');
  function onScroll(){nav.classList.toggle('scrolled',window.scrollY>12)}
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  if(burger){
    burger.addEventListener('click',function(){
      var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);
    });
    d.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')})});
  }

  /* reveals */
  var rv=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(el){io.observe(el)});
  } else rv.forEach(function(el){el.classList.add('in')});

  /* hero */
  var hero=d.querySelector('.hero');
  if(hero){
    requestAnimationFrame(function(){requestAnimationFrame(function(){hero.classList.add('go');hero.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')})})});
    if(!reduce){
      hero.addEventListener('pointermove',function(e){
        var r=hero.getBoundingClientRect();
        hero.style.setProperty('--gx',((e.clientX-r.left)/r.width*100)+'%');
        hero.style.setProperty('--gy',((e.clientY-r.top)/r.height*100)+'%');
      });
    }
    var bb=d.querySelector('.bulb-btn');
    if(bb){bb.addEventListener('click',function(){
      var off=hero.classList.toggle('is-off');
      bb.setAttribute('aria-pressed',String(!off));
      hero.style.setProperty('--lit',off?'0.15':'1');
    })}
  }

  /* card spotlight */
  d.querySelectorAll('.card').forEach(function(c){
    c.addEventListener('pointermove',function(e){
      var r=c.getBoundingClientRect();
      c.style.setProperty('--mx',(e.clientX-r.left)+'px');
      c.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
  });

  /* tangled -> straight scene */
  var scene=d.querySelector('.scene');
  if(scene){
    var svg=scene.querySelector('.wires'),W=1200,H=300,N=90,K=6,lastP=0;
    var ns='http://www.w3.org/2000/svg';
    var wires=[],dots=[];
    for(var k=0;k<K;k++){
      var p=d.createElementNS(ns,'path');svg.appendChild(p);
      var c=d.createElementNS(ns,'circle');c.setAttribute('r',7);c.setAttribute('cx',W-40);svg.appendChild(c);
      wires.push({p:p,ph:[k*1.7+.3,k*2.3+1.1,k*.9+2.2],k:k});dots.push(c);
    }
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    function mix(a,b,t){return Math.round(a+(b-a)*t)}
    function size(){W=svg.clientWidth||1200;H=svg.clientHeight||300;svg.setAttribute('viewBox','0 0 '+W+' '+H)}
    function draw(p){
      lastP=p;size();
      var gap=Math.min(34,H/(K+1)),sc=H/2*.86/168,pad=Math.min(40,W*.05);
      var e=ease(Math.min(1,Math.max(0,p*1.25)));
      var amp=1-e, col='rgb('+mix(112,255,e)+','+mix(104,139,e)+','+mix(94,22,e)+')';
      wires.forEach(function(w,k){
        var dstr='';
        for(var i=0;i<=N;i++){
          var x=i/N, X=pad+x*(W-2*pad);
          var env=Math.sin(Math.PI*Math.min(1,x*1.0));       // tangled in the middle
          env=Math.pow(Math.max(env,0),.6);
          var base=H/2+(k-(K-1)/2)*gap;
          var off=(Math.sin(x*9+w.ph[0])*70+Math.sin(x*17+w.ph[1])*38+Math.sin(x*5+w.ph[2])*60)*sc*env*amp;
          var y=base+off;
          dstr+=(i?'L':'M')+X.toFixed(1)+' '+y.toFixed(1);
        }
        w.p.setAttribute('d',dstr);
        w.p.setAttribute('stroke',col);
        w.p.setAttribute('opacity',(.55+.45*e).toFixed(2));
        var dt=dots[k];dt.setAttribute('cx',W-pad);dt.setAttribute('cy',H/2+(k-(K-1)/2)*gap);
        var lit=e>.92;
        dt.setAttribute('fill',lit?'#ffb35e':'#0b0a09');
        dt.setAttribute('stroke',col);dt.setAttribute('stroke-width',2.5);
        dt.style.filter=lit?'drop-shadow(0 0 10px rgba(255,139,22,.9))':'none';
      });
      scene.classList.toggle('done',p>.72);
    }
    function update(){
      var r=scene.getBoundingClientRect(),total=scene.offsetHeight-window.innerHeight;
      var p=total>0?Math.min(1,Math.max(0,-r.top/total)):1;
      draw(p);
    }
    if(reduce){draw(1)}else{
      var tick=false;
      window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){tick=false;update()})}},{passive:true});
      window.addEventListener('resize',function(){draw(lastP);update()});update();
    }
  }
})();
