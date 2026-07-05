<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { parseResume, type ResumeData } from '../lib/resumeParser';

  let sectionRef = $state<HTMLElement>();
  let headerRef = $state<HTMLDivElement>();
  let threeContainer = $state<HTMLDivElement>();

  // Canvases references in DOM
  let canvases = $state<{
    profile?: HTMLCanvasElement;
    achievements?: HTMLCanvasElement;
    education?: HTMLCanvasElement;
    skills?: HTMLCanvasElement;
    projects?: HTMLCanvasElement;
    experience?: HTMLCanvasElement;
  }>({});

  let resumeData = $state<ResumeData | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state('');

  // Individual scroll states
  let projectsScrollY = $state(0);
  let experienceScrollY = $state(0);
  let maxProjectsScroll = $state(0);
  let maxExperienceScroll = $state(0);

  // Mobile viewport scroll state
  let groupScrollY = $state(0);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const resumeUrl = `${baseUrl}resume.tex`;

  // Three.js instances
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let cardGroup: THREE.Group | null = null;
  let bgMesh: THREE.Mesh | null = null;
  let animId = 0;

  // Active textures references
  let textures = $state<{
    profile?: THREE.CanvasTexture;
    achievements?: THREE.CanvasTexture;
    education?: THREE.CanvasTexture;
    skills?: THREE.CanvasTexture;
    projects?: THREE.CanvasTexture;
    experience?: THREE.CanvasTexture;
  }>({});

  // Card meshes list for layout and raycasting
  let cardMeshes: THREE.Object3D[] = [];

  // Parallax and Dragging States
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  // Raycaster for card-level scroll hovering
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCardName = $state('');

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

        // 2. Initialize Three.js after Svelte has updated DOM
        setTimeout(initThree, 150);
      } catch (err: any) {
        console.error(err);
        errorMsg = err.message || 'Error loading resume';
        isLoading = false;
      }
    })();

    return () => {
      // Cleanup
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      
      if (renderer) renderer.dispose();
      Object.values(textures).forEach(tex => tex.dispose());
      if (bgMesh) {
        bgMesh.geometry.dispose();
        (bgMesh.material as THREE.Material).dispose();
      }
    };
  });

  // Draws resume text dynamically onto each card canvas context
  function drawCardText(canvas: HTMLCanvasElement, type: string, data: ResumeData, scrollVal: number): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // Clear background (Slate/Charcoal)
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bebop borders
    ctx.strokeStyle = '#e0a92e';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(224, 169, 46, 0.4)';
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Scanlines filter
    ctx.fillStyle = 'rgba(224, 169, 46, 0.03)';
    for (let y2 = 25; y2 < canvas.height - 25; y2 += 4) {
      ctx.fillRect(25, y2, canvas.width - 50, 2);
    }

    // Header prefix
    let headerText = '';
    if (type === 'profile') headerText = 'Capabilities Matrix';
    if (type === 'achievements') headerText = 'VERIFIED BYPASS';
    if (type === 'education') headerText = 'EDUCATION ARCHIVE';
    if (type === 'skills') headerText = 'TECHNICAL CAPABILITIES';
    if (type === 'projects') headerText = 'PROJECTS ARCHIVE (SCROLLABLE)';
    if (type === 'experience') headerText = 'EXPERIENCE MATRIX (SCROLLABLE)';

    ctx.fillStyle = '#e0a92e';
    ctx.font = 'bold 30px Courier, monospace';
    ctx.fillText(headerText.toUpperCase(), 50, 80);

    // Clip rendering window to keep text inside boundary
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 110, canvas.width - 80, canvas.height - 150);
    ctx.clip();

    let y = 160 - scrollVal;

    if (type === 'profile') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 36px Courier, monospace';
      ctx.fillText(data.contact.name.toUpperCase(), 50, y);
      y += 40;

      ctx.fillStyle = '#e0a92e';
      ctx.font = '22px Courier, monospace';
      ctx.fillText('SECURITY RESEARCHER & SYSTEMS ENGINEER', 50, y);
      y += 50;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '20px Courier, monospace';
      ctx.fillText(`LOCATION: ${data.contact.location}`, 50, y);
      y += 35;
      ctx.fillText(`EMAIL:    ${data.contact.email}`, 50, y);
      y += 35;
      ctx.fillText(`GITHUB:   ${data.contact.githubUrl.replace('https://', '')}`, 50, y);
      y += 35;
      ctx.fillText(`LINKEDIN: linkedin.com/in/muhammad-azeem`, 50, y);
      y += 60;

      ctx.fillStyle = '#e0a92e';
      ctx.font = 'bold 24px Courier, monospace';
      ctx.fillText('// SUMMARY', 50, y);
      y += 35;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '20px Courier, monospace';
      const summaryText = data.summary;
      const words = summaryText.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 140 && n > 0) {
          ctx.fillText(line, 50, y);
          line = words[n] + ' ';
          y += 32;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50, y);
      y += 40;
    } else if (type === 'achievements') {
      if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach(ach => {
          ctx.fillStyle = '#a8201a';
          ctx.font = 'bold 28px Courier, monospace';
          ctx.fillText(ach.title.toUpperCase(), 50, y);
          ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
          ctx.font = '18px Courier, monospace';
          ctx.fillText(ach.date, canvas.width - 220, y);
          
          y += 45;

          ctx.fillStyle = '#f3efe0';
          ctx.font = '20px Courier, monospace';
          ach.bullets.forEach(bullet => {
            const words = bullet.split(' ');
            let line = ' • ';
            for (let n = 0; n < words.length; n++) {
              let testLine = line + words[n] + ' ';
              let metrics = ctx.measureText(testLine);
              if (metrics.width > canvas.width - 140 && n > 0) {
                ctx.fillText(line, 50, y);
                line = '   ' + words[n] + ' ';
                y += 32;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 50, y);
            y += 40;
          });
          
          y += 25;
          ctx.fillStyle = '#e0a92e';
          ctx.font = 'italic 18px Courier, monospace';
          ctx.fillText('HTB Profile: hackthebox.com/users/yahya-azeem', 50, y);
          y += 50;
        });
      }
    } else if (type === 'education') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 28px Courier, monospace';
      ctx.fillText(data.education.school.toUpperCase(), 50, y);
      ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
      ctx.font = '18px Courier, monospace';
      ctx.fillText(data.education.date, canvas.width - 220, y);

      y += 45;
      ctx.fillStyle = '#e0a92e';
      ctx.font = '22px Courier, monospace';
      ctx.fillText(data.education.degree, 50, y);
      y += 35;
      ctx.fillStyle = '#f3efe0';
      ctx.font = '20px Courier, monospace';
      ctx.fillText(`LOCATION: ${data.education.location}`, 50, y);
      y += 40;
    } else if (type === 'skills') {
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
        y += 35;

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
        y += 55;
      });
    } else if (type === 'projects') {
      data.projects.forEach(project => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`[ ${project.title.toUpperCase()} ]`, 50, y);
        
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'italic 18px Courier, monospace';
        ctx.fillText(`Tech: { ${project.tech} }`, 50, y + 24);
        
        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '16px Courier, monospace';
        ctx.fillText(project.date, canvas.width - 240, y);
        
        y += 55;

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

        y += 40;
      });

      if (data.otherProjects && data.otherProjects.length > 0) {
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`// ADDITIONAL CODE BASES`, 50, y);
        y += 45;

        data.otherProjects.forEach(other => {
          ctx.fillStyle = '#f3efe0';
          ctx.font = '20px Courier, monospace';
          ctx.fillText(`• ${other.title}`, 60, y);
          
          ctx.fillStyle = 'rgba(224, 169, 46, 0.6)';
          ctx.font = '16px Courier, monospace';
          ctx.fillText(other.url, 85, y + 22);
          
          y += 50;
        });
      }
    } else if (type === 'experience') {
      data.experience.forEach(job => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 26px Courier, monospace';
        ctx.fillText(`// ${job.role.toUpperCase()}`, 50, y);

        ctx.fillStyle = '#e0a92e';
        ctx.font = '18px Courier, monospace';
        ctx.fillText(`${job.company}`, 50, y + 24);

        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '16px Courier, monospace';
        ctx.fillText(job.date, canvas.width - 240, y);

        y += 55;

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

        y += 40;
      });
    }

    ctx.restore();
    return y + scrollVal;
  }

  function updateCardTexture(name: 'profile' | 'achievements' | 'education' | 'skills' | 'projects' | 'experience') {
    const canvas = canvases[name];
    if (!canvas || !resumeData) return;

    let scrollVal = 0;
    if (name === 'projects') scrollVal = projectsScrollY;
    if (name === 'experience') scrollVal = experienceScrollY;

    const totalHeight = drawCardText(canvas, name, resumeData, scrollVal);

    if (name === 'projects') maxProjectsScroll = Math.max(0, totalHeight - (canvas.height - 120));
    if (name === 'experience') maxExperienceScroll = Math.max(0, totalHeight - (canvas.height - 120));

    const tex = textures[name];
    if (tex) {
      tex.needsUpdate = true;
    }
  }

  // Create card meshes dynamically
  function createCardMesh(name: string, tex: THREE.CanvasTexture): THREE.Group {
    const group = new THREE.Group();

    // 1. Front screen face (canvas texture)
    const screenGeom = new THREE.BoxGeometry(2.8, 2.4, 0.05);
    const screenMatArray = [
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // right
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // left
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // top
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // bottom
      new THREE.MeshBasicMaterial({ map: tex }),                            // front
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 })   // back
    ];
    const screenMesh = new THREE.Mesh(screenGeom, screenMatArray);
    screenMesh.name = name;
    group.add(screenMesh);

    // 2. Bezel backing
    const bezelGeom = new THREE.BoxGeometry(2.95, 2.55, 0.08);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.8, metalness: 0.2 });
    const bezelMesh = new THREE.Mesh(bezelGeom, bezelMat);
    bezelMesh.position.z = -0.05;
    bezelMesh.name = name;
    group.add(bezelMesh);

    // 3. Tapered back casing
    const tubeGeom = new THREE.BoxGeometry(2.6, 2.2, 0.6);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.9, metalness: 0.1 });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.position.z = -0.34;
    tubeMesh.name = name;
    group.add(tubeMesh);

    group.name = name;
    return group;
  }

  // Setup the position coordinates for the 6 cards based on viewport width
  function positionCards() {
    if (!cardGroup || cardGroup.children.length < 6) return;
    const isMobile = window.innerWidth < 768;

    const children = cardGroup.children;

    if (isMobile) {
      // Stack vertically on mobile
      children[0].position.set(0, 6.2, 0);  // profile
      children[1].position.set(0, 3.7, 0);  // skills
      children[2].position.set(0, 1.2, 0);  // education
      children[3].position.set(0, -1.3, 0); // projects
      children[4].position.set(0, -3.8, 0); // achievements
      children[5].position.set(0, -6.3, 0); // experience
      cardGroup.rotation.set(0, 0, 0);
    } else {
      // 3 Columns, 2 Rows on Desktop
      children[0].position.set(-3.2, 1.4, 0);  // profile
      children[1].position.set(-3.2, -1.3, 0); // skills
      children[2].position.set(0, 1.4, 0);     // education
      children[3].position.set(0, -1.3, 0);    // projects
      children[4].position.set(3.2, 1.4, 0);   // achievements
      children[5].position.set(3.2, -1.3, 0);  // experience
    }
  }

  // Initialize Three.js scene
  function initThree() {
    if (!threeContainer || !canvases.profile) return;

    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    // 1. Scene setup
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = width < 768 ? 9.0 : 7.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0a92e, 1.4);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 3. Load Cowboy Bebop Background image
    const bgLoader = new THREE.TextureLoader();
    bgLoader.load(`${baseUrl}bebop_bg.jpg`, (bgTexture) => {
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      const bgGeom = new THREE.PlaneGeometry(30, 18);
      const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture, depthWrite: false });
      bgMesh = new THREE.Mesh(bgGeom, bgMat);
      bgMesh.position.z = -7;
      scene?.add(bgMesh);
    });

    // 4. Generate all 6 cards
    const cardNames: ('profile' | 'skills' | 'education' | 'projects' | 'achievements' | 'experience')[] = [
      'profile', 'skills', 'education', 'projects', 'achievements', 'experience'
    ];

    cardGroup = new THREE.Group();
    cardMeshes = [];

    cardNames.forEach(name => {
      const canvas = canvases[name];
      if (!canvas) return;

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[name] = tex;

      updateCardTexture(name);

      const card = createCardMesh(name, tex);
      cardGroup!.add(card);

      // Save references of screen face meshes specifically for raycasting
      const screenMesh = card.children[0];
      cardMeshes.push(screenMesh);
    });

    scene.add(cardGroup);
    positionCards();

    // 5. Global Event Listeners
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);

    tick();
  }

  function tick() {
    animId = requestAnimationFrame(tick);

    if (renderer && scene && camera && cardGroup) {
      const time = Date.now() * 0.001;

      // Parallax mouse damping
      if (!isDragging) {
        if (window.innerWidth >= 768) {
          targetRotX = mouseY * 0.4;
          targetRotY = mouseX * 0.4;

          cardGroup.rotation.x += (targetRotX - cardGroup.rotation.x) * 0.08;
          cardGroup.rotation.y += (targetRotY - cardGroup.rotation.y) * 0.08;
        }
      }

      // Smooth vertical scroll damping for mobile
      if (window.innerWidth < 768) {
        cardGroup.position.y += (groupScrollY - cardGroup.position.y) * 0.1;
      } else {
        cardGroup.position.y = 0;
      }

      renderer.render(scene, camera);
    }
  }

  // Raycast hover tracking for scroll targets
  function handleMouseMoveGlobal(e: MouseEvent) {
    if (!renderer || !camera) return;
    const rect = renderer.domElement.getBoundingClientRect();
    
    // Normalize coordinates
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cardMeshes);

    if (intersects.length > 0) {
      hoveredCardName = intersects[0].object.name;
    } else {
      hoveredCardName = '';
    }

    if (isDragging && cardGroup) {
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      if (window.innerWidth < 768) {
        groupScrollY = Math.max(-8, Math.min(8, groupScrollY + deltaY * 0.025));
      } else {
        cardGroup.rotation.y += deltaX * 0.005;
        cardGroup.rotation.x += deltaY * 0.005;
      }

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    }
  }

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  }

  function handleMouseUpGlobal() {
    isDragging = false;
  }

  // Handle local wheel scrolling on target cards
  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    if (hoveredCardName === 'projects') {
      projectsScrollY = Math.max(0, Math.min(maxProjectsScroll, projectsScrollY + e.deltaY * 0.45));
    } else if (hoveredCardName === 'experience') {
      experienceScrollY = Math.max(0, Math.min(maxExperienceScroll, experienceScrollY + e.deltaY * 0.45));
    } else {
      // Scroll the vertical list on mobile
      if (window.innerWidth < 768) {
        groupScrollY = Math.max(-8, Math.min(8, groupScrollY - e.deltaY * 0.008));
      }
    }
  }

  // React to scroll variables changing
  $effect(() => {
    if (resumeData && canvases.profile) {
      projectsScrollY;
      experienceScrollY;

      updateCardTexture('profile');
      updateCardTexture('skills');
      updateCardTexture('education');
      updateCardTexture('projects');
      updateCardTexture('achievements');
      updateCardTexture('experience');
    }
  });

  function handleResize() {
    if (!threeContainer || !renderer || !camera) return;
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;
    camera.aspect = width / height;
    camera.position.z = width < 768 ? 9.0 : 7.5;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    positionCards();
  }
</script>

<svelte:window onresize={handleResize} />

<section 
  bind:this={sectionRef}
  id="capabilities"
  class="relative bg-black border-t-2 border-[#3d3428] overflow-hidden"
  style="z-index: 50;"
>
  <!-- Main full-width 3D scene box -->
  <div class="relative w-full h-[85vh] bg-[#050608]">
    <!-- Three.js Render Target -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      bind:this={threeContainer} 
      onmousedown={handleMouseDown}
      onwheel={handleWheel}
      class="w-full h-full cursor-grab active:cursor-grabbing"
      role="region"
      aria-label="3D Capabilities Board Controls"
    ></div>

    <!-- Retro overlay HUD reading -->
    <div class="absolute top-6 left-6 pointer-events-none select-none font-mono text-[10px] text-[#e0a92e] space-y-1">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-[#e0a92e] animate-ping"></span>
        <span class="font-bold tracking-widest">// HUD MONITOR: CAPABILITIES MATRIX</span>
      </div>
      <p class="text-white/40 font-light">SOURCE: Dynamic LaTeX compiler load // 100% Ok</p>
    </div>

    <div class="absolute bottom-6 left-6 pointer-events-none select-none font-mono text-[9px] text-[#e0a92e]/60 space-y-1">
      <p class="uppercase font-semibold tracking-wider">Drag to rotate HUD matrix</p>
      <p class="uppercase font-semibold tracking-wider">Scroll over dynamic cards to scan files</p>
      {#if hoveredCardName}
        <p class="text-[#a8201a] font-bold uppercase tracking-widest mt-1">>> HOVERING REGION: {hoveredCardName}</p>
      {/if}
    </div>

    <!-- Hidden dynamic canvas texture targets -->
    <canvas bind:this={canvases.profile} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.skills} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.education} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.projects} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.achievements} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.experience} width="1024" height="1024" class="hidden"></canvas>
  </div>
</section>
