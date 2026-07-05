<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { parseResume, type ResumeData } from '../lib/resumeParser';

  let sectionRef = $state<HTMLElement>();
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

  // Scroll states for projects and experience
  let projectsScrollY = $state(0);
  let experienceScrollY = $state(0);
  let maxProjectsScroll = $state(0);
  let maxExperienceScroll = $state(0);

  // Mobile scroll offset
  let groupScrollY = $state(0);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const resumeUrl = `${baseUrl}resume.tex`;

  // Three.js instances
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let cardGroup: THREE.Group | null = null;
  let animId = 0;

  // Active textures
  let textures = $state<{
    profile?: THREE.CanvasTexture;
    achievements?: THREE.CanvasTexture;
    education?: THREE.CanvasTexture;
    skills?: THREE.CanvasTexture;
    projects?: THREE.CanvasTexture;
    experience?: THREE.CanvasTexture;
  }>({});

  // Card screen submeshes for raycast hovering
  let cardMeshes: THREE.Object3D[] = [];

  // Parallax and Dragging States
  let mouseX = 0;
  let mouseY = 0;
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;

  // Raycaster for card-level scroll hovering and focus
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCardName = $state('');

  // Pinned Default Scattered Layouts
  const defaultLayouts = {
    profile:      { x: -3.4, y: 1.5,  z: 0.15, rx: 0.05,  ry: 0.08,  rz: -0.04 },
    skills:       { x: -3.1, y: -1.4, z: -0.25, rx: -0.03, ry: -0.05, rz: 0.03 },
    education:    { x: -0.1, y: 1.55, z: -0.1,  rx: 0.02,  ry: 0.02,  rz: 0.02 },
    projects:     { x: 0.25, y: -1.3, z: 0.1,  rx: -0.03, ry: -0.03, rz: -0.03 },
    achievements: { x: 3.35, y: 1.45, z: 0.3,  rx: 0.04,  ry: -0.08, rz: 0.05 },
    experience:   { x: 3.4,  y: -1.45, z: -0.2,  rx: -0.02, ry: 0.06,  rz: -0.02 }
  };

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
      // Cleanup Three.js loop and events
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      
      if (renderer) renderer.dispose();
      Object.values(textures).forEach(tex => tex.dispose());
    };
  });

  // Draws resume text dynamically onto each card canvas context with enlarged fonts
  function drawCardText(canvas: HTMLCanvasElement, type: string, data: ResumeData, scrollVal: number): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // Background color (Slate/Charcoal)
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bebop borders
    ctx.strokeStyle = '#e0a92e';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(224, 169, 46, 0.4)';
    ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

    // Scanlines filter
    ctx.fillStyle = 'rgba(224, 169, 46, 0.035)';
    for (let y2 = 25; y2 < canvas.height - 25; y2 += 6) {
      ctx.fillRect(25, y2, canvas.width - 50, 3);
    }

    // Header prefix (Dotted size: 48px)
    let headerText = '';
    if (type === 'profile') headerText = 'Capabilities Matrix';
    if (type === 'achievements') headerText = 'VERIFIED BYPASS';
    if (type === 'education') headerText = 'EDUCATION ARCHIVE';
    if (type === 'skills') headerText = 'TECHNICAL CAPABILITIES';
    if (type === 'projects') headerText = 'PROJECTS (SCROLLABLE)';
    if (type === 'experience') headerText = 'EXPERIENCE (SCROLLABLE)';

    ctx.fillStyle = '#e0a92e';
    ctx.font = 'bold 44px Courier, monospace';
    ctx.fillText(headerText.toUpperCase(), 50, 95);

    // Clip rendering window to keep text inside boundary
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 130, canvas.width - 80, canvas.height - 180);
    ctx.clip();

    let y = 180 - scrollVal;

    if (type === 'profile') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 50px Courier, monospace';
      ctx.fillText(data.contact.name.toUpperCase(), 50, y);
      y += 60;

      ctx.fillStyle = '#e0a92e';
      ctx.font = '28px Courier, monospace';
      ctx.fillText('SECURITY RESEARCHER & SYSTEMS ENGINEER', 50, y);
      y += 70;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Courier, monospace';
      ctx.fillText(`LOCATION: ${data.contact.location}`, 50, y);
      y += 45;
      ctx.fillText(`EMAIL:    ${data.contact.email}`, 50, y);
      y += 45;
      ctx.fillText(`GITHUB:   ${data.contact.githubUrl.replace('https://', '')}`, 50, y);
      y += 45;
      ctx.fillText(`LINKEDIN: linkedin.com/in/muhammad-azeem`, 50, y);
      y += 80;

      ctx.fillStyle = '#e0a92e';
      ctx.font = 'bold 32px Courier, monospace';
      ctx.fillText('// SUMMARY', 50, y);
      y += 50;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Courier, monospace';
      const summaryText = data.summary;
      const words = summaryText.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 120 && n > 0) {
          ctx.fillText(line, 50, y);
          line = words[n] + ' ';
          y += 40;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50, y);
      y += 50;
    } else if (type === 'achievements') {
      if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach(ach => {
          ctx.fillStyle = '#a8201a';
          ctx.font = 'bold 36px Courier, monospace';
          ctx.fillText(ach.title.toUpperCase(), 50, y);
          ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
          ctx.font = '22px Courier, monospace';
          ctx.fillText(ach.date, canvas.width - 240, y);
          
          y += 60;

          ctx.fillStyle = '#f3efe0';
          ctx.font = '28px Courier, monospace';
          ach.bullets.forEach(bullet => {
            const words = bullet.split(' ');
            let line = ' • ';
            for (let n = 0; n < words.length; n++) {
              let testLine = line + words[n] + ' ';
              let metrics = ctx.measureText(testLine);
              if (metrics.width > canvas.width - 120 && n > 0) {
                ctx.fillText(line, 50, y);
                line = '   ' + words[n] + ' ';
                y += 40;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, 50, y);
            y += 45;
          });
          
          y += 35;
          ctx.fillStyle = '#e0a92e';
          ctx.font = 'italic 22px Courier, monospace';
          ctx.fillText('HTB Profile: hackthebox.com/users/yahya-azeem', 50, y);
          y += 70;
        });
      }
    } else if (type === 'education') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 36px Courier, monospace';
      ctx.fillText(data.education.school.toUpperCase(), 50, y);
      ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
      ctx.font = '22px Courier, monospace';
      ctx.fillText(data.education.date, canvas.width - 220, y);

      y += 65;
      ctx.fillStyle = '#e0a92e';
      ctx.font = '28px Courier, monospace';
      ctx.fillText(data.education.degree, 50, y);
      y += 45;
      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Courier, monospace';
      ctx.fillText(`LOCATION: ${data.education.location}`, 50, y);
      y += 50;
    } else if (type === 'skills') {
      const skillsCategories = [
        { label: 'Programming Languages', items: data.skills.languages },
        { label: 'Systems & Architecture', items: data.skills.systems },
        { label: 'Deep Learning & Optimization', items: data.skills.deepLearning },
        { label: 'Offensive Security', items: data.skills.offensiveSecurity }
      ];

      skillsCategories.forEach(cat => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 36px Courier, monospace';
        ctx.fillText(`> ${cat.label.toUpperCase()}`, 50, y);
        y += 50;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '28px Courier, monospace';

        const text = cat.items.join(', ');
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > canvas.width - 140 && n > 0) {
            ctx.fillText(line, 80, y);
            line = words[n] + ' ';
            y += 40;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 80, y);
        y += 75;
      });
    } else if (type === 'projects') {
      data.projects.forEach(project => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 36px Courier, monospace';
        ctx.fillText(`[ ${project.title.toUpperCase()} ]`, 50, y);
        
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'italic 24px Courier, monospace';
        ctx.fillText(`Tech: { ${project.tech} }`, 50, y + 30);
        
        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '22px Courier, monospace';
        ctx.fillText(project.date, canvas.width - 240, y);
        
        y += 80;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '26px Courier, monospace';
        project.bullets.forEach(bullet => {
          const words = bullet.split(' ');
          let line = '  • ';
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 140 && n > 0) {
              ctx.fillText(line, 75, y);
              line = '    ' + words[n] + ' ';
              y += 36;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 75, y);
          y += 46;
        });

        y += 60;
      });

      if (data.otherProjects && data.otherProjects.length > 0) {
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'bold 36px Courier, monospace';
        ctx.fillText(`// ADDITIONAL CODE BASES`, 50, y);
        y += 60;

        data.otherProjects.forEach(other => {
          ctx.fillStyle = '#f3efe0';
          ctx.font = '26px Courier, monospace';
          ctx.fillText(`• ${other.title}`, 60, y);
          
          ctx.fillStyle = 'rgba(224, 169, 46, 0.6)';
          ctx.font = '22px Courier, monospace';
          ctx.fillText(other.url, 85, y + 30);
          
          y += 70;
        });
      }
    } else if (type === 'experience') {
      data.experience.forEach(job => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 36px Courier, monospace';
        ctx.fillText(`// ${job.role.toUpperCase()}`, 50, y);

        ctx.fillStyle = '#e0a92e';
        ctx.font = '24px Courier, monospace';
        ctx.fillText(`${job.company}`, 50, y + 30);

        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '22px Courier, monospace';
        ctx.fillText(job.date, canvas.width - 240, y);

        y += 80;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '26px Courier, monospace';
        job.bullets.forEach(bullet => {
          const words = bullet.split(' ');
          let line = '  • ';
          for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 140 && n > 0) {
              ctx.fillText(line, 75, y);
              line = '    ' + words[n] + ' ';
              y += 36;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, 75, y);
          y += 46;
        });

        y += 60;
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

    if (name === 'projects') maxProjectsScroll = Math.max(0, totalHeight - (canvas.height - 130));
    if (name === 'experience') maxExperienceScroll = Math.max(0, totalHeight - (canvas.height - 130));

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

  // Position cards in space dynamically
  function positionCards() {
    if (!cardGroup || cardGroup.children.length < 6) return;
    const isMobile = window.innerWidth < 768;

    cardGroup.children.forEach(card => {
      const name = card.name as keyof typeof defaultLayouts;
      const def = defaultLayouts[name];
      if (!def) return;

      if (isMobile) {
        let yPos = 6.2;
        if (name === 'profile') yPos = 6.2;
        if (name === 'skills') yPos = 3.7;
        if (name === 'education') yPos = 1.2;
        if (name === 'projects') yPos = -1.3;
        if (name === 'achievements') yPos = -3.8;
        if (name === 'experience') yPos = -6.3;

        card.position.set(0, yPos, 0);
        card.rotation.set(0, 0, 0);
      } else {
        // Scattered layout coordinates
        card.position.set(def.x, def.y, def.z);
        card.rotation.set(def.rx, def.ry, def.rz);
      }
    });
  }

  // Initialize Three.js scene
  function initThree() {
    if (!threeContainer || !canvases.profile) return;

    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.04); // subtle deep fog

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = width < 768 ? 9.0 : 7.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0a92e, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 3. Load Cowboy Bebop Background image directly to scene.background
    const bgLoader = new THREE.TextureLoader();
    bgLoader.load(`${baseUrl}bebop_bg.jpg`, (bgTexture) => {
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      if (scene) {
        scene.background = bgTexture; // Replace void with Bebop background image
      }
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

      // Animate card group parallax (subtle overall drift)
      if (!isDragging && window.innerWidth >= 768) {
        cardGroup.rotation.y = Math.sin(time * 0.3) * 0.02;
        cardGroup.rotation.x = Math.cos(time * 0.3) * 0.01;
      }

      // Card-specific hover parallax, elevation and return states
      cardGroup.children.forEach(card => {
        const isHovered = card.name === hoveredCardName;
        const name = card.name as keyof typeof defaultLayouts;
        const def = defaultLayouts[name];
        if (!def) return;

        // Hover depth lift and scale transition
        const targetZ = isHovered ? def.z + 0.5 : def.z;
        const targetScale = isHovered ? 1.06 : 1.0;

        card.position.z += (targetZ - card.position.z) * 0.1;
        
        const currentScale = card.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.1;
        card.scale.setScalar(newScale);

        if (isHovered && !isDragging) {
          // Tilt the hovered card specifically to follow cursor relative to its base rotation
          const targetRotX = def.rx + mouseY * 0.5;
          const targetRotY = def.ry + mouseX * 0.5;

          card.rotation.x += (targetRotX - card.rotation.x) * 0.1;
          card.rotation.y += (targetRotY - card.rotation.y) * 0.1;
        } else if (!isDragging) {
          // Return unhovered card to its default scattered rotation angles
          card.rotation.x += (def.rx - card.rotation.x) * 0.12;
          card.rotation.y += (def.ry - card.rotation.y) * 0.12;
          card.rotation.z += (def.rz - card.rotation.z) * 0.12;
        }
      });

      // Smooth vertical scroll damping for mobile
      if (window.innerWidth < 768) {
        cardGroup.position.y += (groupScrollY - cardGroup.position.y) * 0.1;
      } else {
        cardGroup.position.y = 0;
      }

      renderer.render(scene, camera);
    }
  }

  // Raycast hover tracking for scroll targets and unique card interaction
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
      projectsScrollY = Math.max(0, Math.min(maxProjectsScroll, projectsScrollY + e.deltaY * 0.5));
    } else if (hoveredCardName === 'experience') {
      experienceScrollY = Math.max(0, Math.min(maxExperienceScroll, experienceScrollY + e.deltaY * 0.5));
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
  <div class="relative w-full h-[88vh] bg-[#050608]">
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
      <p class="text-white/70 font-light">SOURCE: Dynamic LaTeX compiler load // 100% Ok</p>
    </div>

    <div class="absolute bottom-6 left-6 pointer-events-none select-none font-mono text-[9px] text-[#e0a92e]/70 space-y-1">
      <p class="uppercase font-semibold tracking-wider">Drag void to rotate board</p>
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
