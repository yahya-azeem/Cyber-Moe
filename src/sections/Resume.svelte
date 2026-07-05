<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import * as THREE from 'three';
  import { 
    Terminal, 
    Cpu, 
    ShieldAlert, 
    Code, 
    ExternalLink, 
    BookOpen, 
    Briefcase,
    MapPin,
    Mail
  } from 'lucide-svelte';
  import { parseResume, type ResumeData } from '../lib/resumeParser';
  import { cn } from '$lib/utils';

  let sectionRef = $state<HTMLElement>();
  let headerRef = $state<HTMLDivElement>();
  let summaryCardRef = $state<HTMLDivElement>();
  let threeContainer = $state<HTMLDivElement>();
  let canvas2D = $state<HTMLCanvasElement>();

  let resumeData = $state<ResumeData | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state('');
  let activeTab = $state<'skills' | 'projects' | 'experience'>('skills');

  let scrollY = $state(0);
  let maxScroll = $state(0);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const resumeUrl = `${baseUrl}resume.tex`;
  const aboutMeImg = `${baseUrl}about_me.png`;

  // Three.js instances
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let texture: THREE.CanvasTexture | null = null;
  let cardGroup: THREE.Group | null = null;
  let stars: THREE.Points | null = null;
  let animId = 0;

  // Parallax mouse position
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  onMount(() => {
    // 1. Fetch & Parse LaTeX Resume in background IIFE
    (async () => {
      try {
        const response = await fetch(resumeUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch resume from ${resumeUrl}`);
        }
        const texText = await response.text();
        resumeData = parseResume(texText);
        isLoading = false;

        // 2. Initialize GSAP animations for profile elements
        setTimeout(setupSummaryAnimations, 100);
        
        // 3. Initialize Three.js after Svelte has updated DOM
        setTimeout(initThree, 150);
      } catch (err: any) {
        console.error(err);
        errorMsg = err.message || 'Error loading resume';
        isLoading = false;
      }
    })();

    return () => {
      // Cleanup Three.js loop and events
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      if (renderer) {
        renderer.dispose();
      }
      if (texture) {
        texture.dispose();
      }
      if (stars) {
        stars.geometry.dispose();
        (stars.material as THREE.Material).dispose();
      }
    };
  });

  function setupSummaryAnimations() {
    if (!sectionRef) return;
    gsap.context(() => {
      if (headerRef) {
        gsap.fromTo(headerRef, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      }
      if (summaryCardRef) {
        gsap.fromTo(summaryCardRef, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
      }
    }, sectionRef);
  }

  // Draw resume text onto dynamic canvas texture
  function drawResumeText(canvas: HTMLCanvasElement, tab: 'skills' | 'projects' | 'experience', data: ResumeData, scrollY: number): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // Background color (Slate/Charcoal)
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bebop dual borders
    ctx.strokeStyle = '#e0a92e';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(224, 169, 46, 0.4)';
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Low-fi scanline pattern
    ctx.fillStyle = 'rgba(224, 169, 46, 0.03)';
    for (let y2 = 25; y2 < canvas.height - 25; y2 += 4) {
      ctx.fillRect(25, y2, canvas.width - 50, 2);
    }

    // Dynamic header (DotGothic16 pixel style)
    ctx.fillStyle = '#e0a92e';
    ctx.font = 'bold 36px Courier, monospace';
    ctx.fillText(`// SYSTEM: ${tab.toUpperCase()} MATRIX`, 50, 80);

    // Clip rendering window to keep text inside boundary
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 110, canvas.width - 80, canvas.height - 150);
    ctx.clip();

    let y = 160 - scrollY;

    if (tab === 'skills') {
      const skillsCategories = [
        { label: 'Programming Languages', items: data.skills.languages },
        { label: 'Systems & Architecture', items: data.skills.systems },
        { label: 'Deep Learning & Optimization', items: data.skills.deepLearning },
        { label: 'Offensive Security', items: data.skills.offensiveSecurity }
      ];

      skillsCategories.forEach(cat => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`> ${cat.label.toUpperCase()}`, 50, y);
        y += 40;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '20px Courier, monospace';

        const text = cat.items.join(', ');
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > canvas.width - 140 && n > 0) {
            ctx.fillText(line, 80, y);
            line = words[n] + ' ';
            y += 32;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);
        y += 65;
      });
    } else if (tab === 'projects') {
      data.projects.forEach(project => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`[ ${project.title.toUpperCase()} ]`, 50, y);
        
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'italic 18px Courier, monospace';
        ctx.fillText(`Tech: { ${project.tech} }`, 50, y + 26);
        
        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '16px Courier, monospace';
        ctx.fillText(project.date, canvas.width - 240, y);
        
        y += 65;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '18px Courier, monospace';
        project.bullets.forEach(bullet => {
          const words = bullet.split(' ');
          let line = '  • ';
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 140 && n > 0) {
              ctx.fillText(line, 75, y);
              line = '    ' + words[n] + ' ';
              y += 28;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 75, y);
          y += 36;
        });

        y += 45;
      });

      // Additional repositories listing
      if (data.otherProjects && data.otherProjects.length > 0) {
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`// ADDITIONAL CODE BASES`, 50, y);
        y += 50;

        data.otherProjects.forEach(other => {
          ctx.fillStyle = '#f3efe0';
          ctx.font = '20px Courier, monospace';
          ctx.fillText(`• ${other.title}`, 60, y);
          
          ctx.fillStyle = 'rgba(224, 169, 46, 0.6)';
          ctx.font = '16px Courier, monospace';
          ctx.fillText(other.url, 85, y + 24);
          
          y += 55;
        });
      }
    } else if (tab === 'experience') {
      data.experience.forEach(job => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`// ${job.role.toUpperCase()}`, 50, y);

        ctx.fillStyle = '#e0a92e';
        ctx.font = '18px Courier, monospace';
        ctx.fillText(`${job.company}`, 50, y + 26);

        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '16px Courier, monospace';
        ctx.fillText(job.date, canvas.width - 240, y);

        y += 65;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '18px Courier, monospace';
        job.bullets.forEach(bullet => {
          const words = bullet.split(' ');
          let line = '  • ';
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 140 && n > 0) {
              ctx.fillText(line, 75, y);
              line = '    ' + words[n] + ' ';
              y += 28;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 75, y);
          y += 36;
        });

        y += 45;
      });
    }

    ctx.restore();
    return y + scrollY; // Returns total drawn height
  }

  function updateCanvasTexture() {
    if (!canvas2D || !resumeData) return;
    const totalHeight = drawResumeText(canvas2D, activeTab, resumeData, scrollY);
    
    // Clamp height parameters
    maxScroll = Math.max(0, totalHeight - (canvas2D.height - 120));
    
    if (texture) {
      texture.needsUpdate = true;
    }
  }

  // Initialize Three.js scene
  function initThree() {
    if (!threeContainer || !canvas2D) return;

    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    // 1. Scene & Render
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.08);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7.5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0a92e, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 3. Dynamic Canvas Texture
    texture = new THREE.CanvasTexture(canvas2D);
    texture.colorSpace = THREE.SRGBColorSpace;
    updateCanvasTexture();

    // 4. CRT Card/Monitor Mesh Group
    cardGroup = new THREE.Group();

    // 4a. Front display screen
    const screenGeom = new THREE.BoxGeometry(3.5, 3.5, 0.05);
    const screenMatArray = [
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // right
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // left
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // top
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // bottom
      new THREE.MeshBasicMaterial({ map: texture }),                       // front
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 })  // back
    ];
    const screenMesh = new THREE.Mesh(screenGeom, screenMatArray);
    cardGroup.add(screenMesh);

    // 4b. Frame bezel
    const bezelGeom = new THREE.BoxGeometry(3.7, 3.7, 0.1);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.8, metalness: 0.2 });
    const bezelMesh = new THREE.Mesh(bezelGeom, bezelMat);
    bezelMesh.position.z = -0.06;
    cardGroup.add(bezelMesh);

    // 4c. Back CRT tube tapered box casing
    const tubeGeom = new THREE.BoxGeometry(3.2, 3.2, 0.9);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.9, metalness: 0.1 });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.position.z = -0.52;
    cardGroup.add(tubeMesh);

    scene.add(cardGroup);

    // 5. Star Particle void
    const starsCount = 400;
    const starsGeom = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPositions[i] = (Math.random() - 0.5) * 20;     // X
      starsPositions[i + 1] = (Math.random() - 0.5) * 20; // Y
      starsPositions[i + 2] = (Math.random() - 0.5) * 20; // Z
    }

    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xe0a92e,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      fog: true
    });
    stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    // 6. Global Parallax & Resize listeners
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);

    // 7. Kickoff loop
    tick();
  }

  function tick() {
    animId = requestAnimationFrame(tick);

    if (renderer && scene && camera && cardGroup) {
      const time = Date.now() * 0.001;

      // Star rotation
      if (stars) {
        stars.rotation.y = time * 0.015;
      }

      // Parallax mouse damping
      if (!isDragging) {
        targetRotX = mouseY * 0.5;
        targetRotY = mouseX * 0.5;
        
        // Floating hover motion added
        targetRotX += Math.sin(time * 1.5) * 0.05;
        targetRotY += Math.cos(time * 1.5) * 0.05;

        cardGroup.rotation.x += (targetRotX - cardGroup.rotation.x) * 0.08;
        cardGroup.rotation.y += (targetRotY - cardGroup.rotation.y) * 0.08;
      }

      renderer.render(scene, camera);
    }
  }

  // Handle local dragging on monitor container
  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  }

  function handleMouseMoveGlobal(e: MouseEvent) {
    // Record screen relative mouse coordinates for parallax
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;

    if (isDragging && cardGroup) {
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      cardGroup.rotation.y += deltaX * 0.01;
      cardGroup.rotation.x += deltaY * 0.01;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    }
  }

  function handleMouseUpGlobal() {
    isDragging = false;
  }

  // Handle scroll wheel events to scroll canvas texture
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    scrollY = Math.max(0, Math.min(maxScroll, scrollY + e.deltaY * 0.5));
  }

  // Snappy GSAP spin animation upon tab switches
  function switchTab(newTab: 'skills' | 'projects' | 'experience') {
    if (activeTab === newTab) return;
    
    activeTab = newTab;
    scrollY = 0;

    if (cardGroup) {
      // Snappy 360 degree spin on Y-axis
      gsap.to(cardGroup.rotation, {
        y: cardGroup.rotation.y + Math.PI * 2,
        duration: 0.65,
        ease: 'back.out(1.15)',
        onStart: () => {
          // Mid-spin texture switch
          setTimeout(() => {
            updateCanvasTexture();
          }, 200);
        }
      });
    }
  }

  // React to scroll changes
  $effect(() => {
    if (resumeData && canvas2D) {
      scrollY;
      updateCanvasTexture();
    }
  });

  // Handle window resizing
  function handleResize() {
    if (!threeContainer || !renderer || !camera) return;
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
</script>

<svelte:window onresize={handleResize} />

<section 
  bind:this={sectionRef}
  id="capabilities"
  class="relative bg-black py-16 lg:py-24 border-t-2 border-[#3d3428] overflow-hidden"
  style="z-index: 50;"
>
  <div class="px-6 sm:px-12 lg:px-[8vw] max-w-[1300px] mx-auto relative z-10">
    
    <!-- Section Header -->
    <div bind:this={headerRef} class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
        <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">Capabilities Matrix</span>
      </div>
      <h2 class="font-dots text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
        Interactive <span class="text-[#e0a92e]">Resume</span>
      </h2>
    </div>

    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-[#e0a92e] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span class="font-mono text-xs text-[#e0a92e]/60 uppercase tracking-widest">Parsing resume.tex...</span>
      </div>
    {:else if errorMsg}
      <!-- Error State -->
      <div class="border-2 border-[#a8201a] bg-[#a8201a]/5 p-8 text-center bebop-shadow-red max-w-xl mx-auto">
        <p class="text-[#a8201a] font-mono font-bold mb-2">!! EXCEPTION OCCURRED WHILE RESOLVING RESUME !!</p>
        <p class="text-white/80 text-sm font-mono">{errorMsg}</p>
        <div class="mt-4 pt-4 border-t border-[#a8201a]/20">
          <p class="text-white/50 text-xs font-mono">Verify that public/resume.tex exists at root.</p>
        </div>
      </div>
    {:else if resumeData}
      <!-- Resume Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <!-- Left Side: Profile Card & Education (Span 5) -->
        <div bind:this={summaryCardRef} class="lg:col-span-5 space-y-8">
          
          <!-- Founder Profile Card -->
          <div class="bg-[#0f1115] border-2 border-[#3d3428] p-8 relative overflow-hidden group bebop-shadow">
            <!-- Glow background overlay -->
            <div class="absolute -right-20 -top-20 w-48 h-48 bg-[#e0a92e]/5 blur-3xl rounded-full"></div>
            
            <div class="flex flex-col sm:flex-row lg:flex-col gap-6 items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center">
              <!-- Avatar -->
              <div class="relative w-36 h-36 border-2 border-[#e0a92e] p-1 bg-black overflow-hidden flex-shrink-0">
                <img 
                  src={aboutMeImg} 
                  alt="Muhammad Yahya Azeem" 
                  class="w-full h-full object-cover scale-100"
                  onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/about_me.png'; }}
                />
              </div>

              <!-- Name & Title -->
              <div>
                <h3 class="font-display font-bold text-2xl lg:text-3xl text-white mb-2 tracking-tight uppercase">
                  {resumeData.contact.name}
                </h3>
                <p class="font-mono text-xs text-[#e0a92e] uppercase tracking-widest mb-4">
                  Security Researcher & Systems Engineer
                </p>
                <div class="flex flex-wrap justify-center sm:justify-start lg:justify-center gap-3 text-white/70 text-xs font-mono">
                  <span class="flex items-center gap-1.5">
                    <MapPin size={12} class="text-[#e0a92e]" />
                    {resumeData.contact.location}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <Mail size={12} class="text-[#e0a92e]" />
                    {resumeData.contact.email}
                  </span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="w-full h-0.5 bg-[#3d3428] my-6"></div>

            <!-- Summary -->
            <div>
              <span class="font-mono text-[10px] text-[#e0a92e] uppercase tracking-[0.2em] mb-3 block">
                // Research Summary
              </span>
              <p class="text-white/70 text-sm leading-relaxed font-light">
                {resumeData.summary}
              </p>
            </div>
            
            <!-- Links / Social -->
            <div class="mt-6 flex flex-wrap gap-3">
              <a 
                href={resumeData.contact.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-[#0b0c10] border border-[#3d3428] hover:border-[#e0a92e] hover:bg-[#0f1115] text-white/70 hover:text-white px-4 py-2.5 transition-all"
              >
                <svg class="w-3.5 h-3.5 fill-current text-[#e0a92e]" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                github.com/yahya-azeem
              </a>
              <a 
                href={resumeData.contact.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-[#0b0c10] border border-[#3d3428] hover:border-[#e0a92e] hover:bg-[#0f1115] text-white/70 hover:text-white px-4 py-2.5 transition-all"
              >
                <ExternalLink size={14} class="text-[#e0a92e]" />
                LinkedIn
              </a>
            </div>
          </div>

          <!-- Offensive Security Proof of Work -->
          {#if resumeData.achievements && resumeData.achievements.length > 0}
            <div class="bg-[#0f1115] border-2 border-[#a8201a] p-8 relative overflow-hidden group bebop-shadow-red">
              <div class="absolute top-0 right-0 bg-[#a8201a] text-[#f3efe0] px-3 py-1 text-[9px] font-mono uppercase tracking-widest">
                VERIFIED BYPASS
              </div>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-none bg-[#a8201a]/10 border border-[#a8201a] flex items-center justify-center text-[#a8201a]">
                  <ShieldAlert size={18} />
                </div>
                <span class="font-mono text-xs text-[#a8201a] uppercase tracking-widest font-bold">
                  Offensive Achievements
                </span>
              </div>

              {#each resumeData.achievements as ach}
                <div class="space-y-4 font-mono">
                  <div class="flex justify-between items-baseline gap-4">
                    <h4 class="text-base font-bold text-white group-hover:text-[#a8201a] transition-colors uppercase">
                      {ach.title}
                    </h4>
                    <span class="text-[#a8201a] text-[10px] whitespace-nowrap">
                      {ach.date}
                    </span>
                  </div>
                  <ul class="space-y-3 font-sans text-white/70 text-sm font-light leading-relaxed">
                    {#each ach.bullets as bullet}
                      <li class="flex items-start gap-3">
                        <span class="text-[#a8201a] mt-1.5 font-bold text-xs">•</span>
                        <span>{bullet}</span>
                      </li>
                    {/each}
                  </ul>
                  <a 
                    href={resumeData.contact.htbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-xs font-mono text-[#a8201a] hover:underline pt-2"
                  >
                    HTB Verification Profile <ExternalLink size={12} />
                  </a>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Education Card -->
          <div class="bg-[#0f1115] border-2 border-[#3d3428] p-8 relative overflow-hidden bebop-shadow-blue">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-[#1b4965]/10 border border-[#1b4965] flex items-center justify-center text-white">
                <BookOpen size={18} class="text-[#e0a92e]" />
              </div>
              <span class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-0 block">
                Education
              </span>
            </div>
            
            <div class="space-y-2 font-mono">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-base text-white uppercase">
                  {resumeData.education.school}
                </h4>
                <span class="text-[#e0a92e] text-xs whitespace-nowrap ml-2">
                  {resumeData.education.date}
                </span>
              </div>
              <p class="text-white/60 text-sm font-light">
                {resumeData.education.degree}
              </p>
              <div class="flex items-center gap-1.5 text-white/30 text-xs pt-1">
                <MapPin size={10} />
                {resumeData.education.location}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Three.js Interactive CRT Console (Span 7) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Terminal Tabs Navigation -->
          <div class="flex border-2 border-[#3d3428] bg-black p-1">
            <button 
              onclick={() => switchTab('skills')}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'skills' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Cpu size={14} />
              Skills Matrix
            </button>
            <button 
              onclick={() => switchTab('projects')}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'projects' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Code size={14} />
              Projects
            </button>
            <button 
              onclick={() => switchTab('experience')}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'experience' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Briefcase size={14} />
              Experience
            </button>
          </div>

          <!-- Three.js Canvas Container Box -->
          <div class="relative w-full h-[600px] bg-black border-2 border-[#3d3428] overflow-hidden group select-none">
            <!-- Three.js Canvas Container -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div 
              bind:this={threeContainer} 
              onmousedown={handleMouseDown}
              onwheel={handleWheel} 
              class="w-full h-full cursor-grab active:cursor-grabbing"
              role="region"
              aria-label="3D CRT Screen Controls"
            ></div>

            <!-- Offscreen 2D Canvas used for texture mapping -->
            <canvas 
              bind:this={canvas2D} 
              width="1024" 
              height="1024" 
              class="hidden"
            ></canvas>

            <!-- Retro CRT Terminal overlay decals -->
            <div class="absolute bottom-4 left-4 bg-black/60 border border-[#e0a92e]/40 px-3 py-1 font-mono text-[9px] text-[#e0a92e] uppercase tracking-wider pointer-events-none select-none">
              SYS STATUS: ACTIVE // SCROLL TO SCAN // DRAG TO ROTATE
            </div>
            
            <div class="absolute bottom-4 right-4 bg-black/60 border border-[#a8201a]/40 px-3 py-1 font-mono text-[9px] text-[#a8201a] uppercase tracking-wider pointer-events-none select-none">
              CRT RENDER: 3D MONITOR MODE
            </div>
          </div>

        </div>
      </div>
    {/if}
  </div>
</section>
