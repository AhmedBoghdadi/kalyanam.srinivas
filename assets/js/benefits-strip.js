(function(){
  var strip = document.querySelector('.benefits');
  if(!strip) return;
  var mq = window.matchMedia('(max-width:1199px)');
  var cloned = false, rafId = null, paused = false, resumeTimer = null;
  var speed = 0.6; // px per frame

  function cloneOnce(){
    if(cloned) return;
    var originals = Array.prototype.slice.call(strip.children);
    originals.forEach(function(el){
      var clone = el.cloneNode(true);
      clone.classList.add('benefit-clone');
      clone.setAttribute('aria-hidden','true');
      strip.appendChild(clone);
    });
    cloned = true;
  }

  function step(){
    if(!paused){
      strip.scrollLeft += speed;
      var half = strip.scrollWidth / 2;
      if(strip.scrollLeft >= half){
        strip.scrollLeft -= half;
      }
    }
    rafId = requestAnimationFrame(step);
  }

  function start(){
    if(!mq.matches) return;
    cloneOnce();
    if(rafId === null){
      rafId = requestAnimationFrame(step);
    }
  }

  function stop(){
    if(rafId !== null){
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function pauseTemporarily(){
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function(){ paused = false; }, 2200);
  }

  strip.addEventListener('touchstart', pauseTemporarily, {passive:true});
  strip.addEventListener('mousedown', pauseTemporarily);
  strip.addEventListener('wheel', pauseTemporarily, {passive:true});

  mq.addEventListener ? mq.addEventListener('change', function(e){
    if(e.matches){ start(); } else { stop(); strip.scrollLeft = 0; }
  }) : mq.addListener(function(e){
    if(e.matches){ start(); } else { stop(); strip.scrollLeft = 0; }
  });

  if(mq.matches){ start(); }
})();
