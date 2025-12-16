// Landing page Three.js + GSAP scroll interactions
(function(){
  // Wait for DOM
  const mount = document.getElementById('hero-canvas');
  if(!mount) return;

  // Basic three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  mount.appendChild(renderer.domElement);

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5,5,5);
  scene.add(dir);

  // Geometry and material
  const geo = new THREE.IcosahedronGeometry(1.8, 5);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x81ffe6,
    metalness: 0.2,
    roughness: 0.15,
    flatShading: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Add subtle particle points
  const ptsGeo = new THREE.BufferGeometry();
  const count = 300;
  const pos = new Float32Array(count * 3);
  for(let i=0;i<count;i++){
    pos[i*3+0] = (Math.random()-0.5)*8;
    pos[i*3+1] = (Math.random()-0.5)*4;
    pos[i*3+2] = (Math.random()-0.5)*8;
  }
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const ptsMat = new THREE.PointsMaterial({color:0xffffff, size:0.02, opacity:0.6, transparent:true});
  const points = new THREE.Points(ptsGeo, ptsMat);
  scene.add(points);

  // Mouse parallax targets
  const state = {rx:0, ry:0, tx:0, ty:0};
  window.addEventListener('mousemove', (e)=>{
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    state.tx = nx * 0.6;
    state.ty = -ny * 0.4;
  });

  // Resize handling
  function onResize(){
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // GSAP ScrollTrigger animations (require GSAP loaded)
  function setupScroll(){
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined'){
      // retry later
      setTimeout(setupScroll, 200);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Fade in overlay
    gsap.to('.hero-overlay', {autoAlpha:1, y:0, duration:1, ease:'power2.out', onStart:()=>{
      document.querySelector('.hero-overlay')?.classList.add('visible');
    }});

    // Rotate mesh on scroll
    gsap.to(mesh.rotation, {
      x: Math.PI * 0.2,
      y: Math.PI * 0.8,
      z: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-3d', start: 'top top', end: 'bottom top', scrub: 0.9
      }
    });

    // Scale slightly while scrolling
    gsap.to(mesh.scale, {x:1.15,y:1.15,z:1.15, ease:'none', scrollTrigger:{trigger:'.hero-3d', start:'top top', end:'bottom top', scrub:0.9}});

    // Parallax points
    gsap.to(points.rotation, {z:Math.PI*0.2, ease:'none', scrollTrigger:{trigger:'.hero-3d', start:'top top', end:'bottom top', scrub:1}});
  }
  setupScroll();

  // Render loop
  const clock = new THREE.Clock();
  (function animate(){
    const dt = clock.getDelta();
    // smooth parallax
    state.rx += (state.tx - state.rx) * 0.06;
    state.ry += (state.ty - state.ry) * 0.06;
    mesh.rotation.x += (state.ry - mesh.rotation.x) * 0.06;
    mesh.rotation.y += (state.rx - mesh.rotation.y) * 0.06;
    // subtle idle
    mesh.rotation.x += Math.sin(clock.elapsedTime * 0.5) * 0.002;
    mesh.rotation.z += Math.cos(clock.elapsedTime * 0.25) * 0.001;

    points.rotation.y += 0.01 * dt * 60;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

  // initial resize
  setTimeout(onResize,50);
})();
