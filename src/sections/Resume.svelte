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
  let waterMesh: THREE.Mesh | null = null;
  let animId = 0;

  // Active textures & CRT shaders
  let textures = $state<{
    profile?: THREE.CanvasTexture;
    achievements?: THREE.CanvasTexture;
    education?: THREE.CanvasTexture;
    skills?: THREE.CanvasTexture;
    projects?: THREE.CanvasTexture;
    experience?: THREE.CanvasTexture;
  }>({});

  let crtMaterials: THREE.ShaderMaterial[] = [];
  let waterMaterial: THREE.ShaderMaterial | null = null;

  // Card screen submeshes for raycast hovering
  let cardMeshes: THREE.Object3D[] = [];

  // Parallax mouse position
  let mouseX = 0;
  let mouseY = 0;

  // Raycaster for card-level scroll hovering and ripple injection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCardName = $state('');

  // Pinned Default Anchors on pool surface
  const anchors = {
    profile:      { x: -3.3, z: 0.8 },
    skills:       { x: -3.0, z: -1.6 },
    education:    { x: -0.1, z: 1.2 },
    projects:     { x: 0.2,  z: -1.3 },
    achievements: { x: 3.2,  z: 0.8 },
    experience:   { x: 3.0,  z: -1.6 }
  };

  // Drifting floaty velocity vectors
  let velocities = {
    profile:      { x: 0.001,  z: -0.001 },
    skills:       { x: -0.001, z: 0.0015 },
    education:    { x: 0.0008, z: 0.0008 },
    projects:     { x: -0.0012, z: -0.0008 },
    achievements: { x: 0.001,  z: -0.0012 },
    experience:   { x: -0.0008, z: 0.0008 }
  };

  // Ripple simulation queue
  let activeRipples: { x: number; y: number; time: number }[] = [];

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
      
      if (renderer) renderer.dispose();
      Object.values(textures).forEach(tex => tex.dispose());
      if (waterMesh) {
        waterMesh.geometry.dispose();
        (waterMesh.material as THREE.Material).dispose();
      }
    };
  });

  // Wave height calculation equation (matches Shader math)
  function getWaveHeight(x: number, z: number, t: number): number {
    const h1 = 0.15 * Math.sin(0.8 * x + 1.5 * t);
    const h2 = 0.15 * Math.cos(0.8 * z + 1.2 * t);
    return h1 + h2;
  }

  // Wave slope calculator to tilt the cards
  function getWaveSlope(x: number, z: number, t: number) {
    const dfdx = 0.15 * 0.8 * Math.cos(0.8 * x + 1.5 * t);
    const dfdz = -0.15 * 0.8 * Math.sin(0.8 * z + 1.2 * t);
    return { dfdx, dfdz };
  }

  // Inject a ripple on click/touch
  function addRipple(lx: number, ly: number) {
    const now = Date.now() * 0.001;
    activeRipples.push({ x: lx, y: ly, time: now });

    // Keep only latest 8 ripples
    if (activeRipples.length > 8) {
      activeRipples.shift();
    }

    if (waterMaterial) {
      const rippleVectors = Array.from({ length: 8 }, (_, i) => {
        if (i < activeRipples.length) {
          return new THREE.Vector3(activeRipples[i].x, activeRipples[i].y, activeRipples[i].time);
        }
        return new THREE.Vector3(0, 0, -999);
      });
      waterMaterial.uniforms.ripples.value = rippleVectors;
      waterMaterial.uniforms.activeRipplesCount.value = activeRipples.length;
    }
  }

  // Handles clicking on the water to spawn a splash ripple
  function handleWaterClick(clientX: number, clientY: number) {
    if (!renderer || !camera || !waterMesh) return;
    const rect = renderer.domElement.getBoundingClientRect();
    
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(waterMesh);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const localPt = waterMesh.worldToLocal(hit.point.clone());
      addRipple(localPt.x, localPt.y);
    }
  }

  function handleMouseDown(e: MouseEvent) {
    handleWaterClick(e.clientX, e.clientY);
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      handleWaterClick(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  // Draws resume text dynamically onto each card canvas context with enlarged fonts
  function drawCardText(canvas: HTMLCanvasElement, type: string, data: ResumeData, scrollVal: number): number {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    // Clear background
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

    // Header prefix
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

    // Custom CRT Screen Shader Material (curved glass warp, scanlines, aberration)
    const screenMat = new THREE.ShaderMaterial({
      uniforms: {
        screenTexture: { value: tex },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D screenTexture;
        uniform float time;
        varying vec2 vUv;
        
        vec2 curve(vec2 uv) {
          uv = (uv - 0.5) * 2.0;
          uv.x *= 1.0 + pow((uv.y / 5.0), 2.0);
          uv.y *= 1.0 + pow((uv.x / 5.0), 2.0);
          uv = (uv / 2.0) + 0.5;
          return uv * 0.94 + 0.03;
        }
        
        void main() {
          vec2 uv = curve(vUv);
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.04, 0.04, 0.06, 1.0);
            return;
          }
          
          float split = 0.003;
          vec4 col;
          col.r = texture2D(screenTexture, vec2(uv.x - split, uv.y)).r;
          col.g = texture2D(screenTexture, uv).g;
          col.b = texture2D(screenTexture, vec2(uv.x + split, uv.y)).b;
          col.a = 1.0;
          
          float scanline = sin(uv.y * 380.0 + time * 5.0) * 0.045;
          col.rgb -= vec3(scanline);
          
          gl_FragColor = col;
        }
      `
    });

    crtMaterials.push(screenMat);

    // 1. Front screen face (uses CRT Shader)
    const screenGeom = new THREE.BoxGeometry(2.8, 2.4, 0.05);
    const screenMatArray = [
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // right
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // left
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // top
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.6 }), // bottom
      screenMat,                                                           // front (CRT Shader)
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
      const name = card.name as keyof typeof anchors;
      const anchor = anchors[name];
      if (!anchor) return;

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
        card.position.set(anchor.x, -0.5, anchor.z);
        card.rotation.set(0, 0, 0);
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
    scene.fog = new THREE.FogExp2(0x0a0b10, 0.035);

    // Elevated camera looking slightly down at the pool
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, width < 768 ? 9.5 : 8.0);
    camera.lookAt(0, -0.5, -0.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0a92e, 1.7);
    dirLight.position.set(5, 7, 5);
    scene.add(dirLight);

    // 3. Setup water material custom Ajarus + Interactive Ripples shader
    waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bebopTexture: { value: new THREE.Texture() },
        ripples: { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, 0, -999)) },
        activeRipplesCount: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        varying vec3 vPosition;
        varying vec3 vLocalPosition;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          vLocalPosition = position;
          
          // Physical wave height deforming surface vertically
          float h1 = 0.15 * sin(0.8 * pos.x + 1.5 * time);
          float h2 = 0.15 * cos(0.8 * pos.y + 1.2 * time); // pos.y is Z in local coordinates before rotation
          pos.z += h1 + h2;
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D bebopTexture;
        varying vec3 vPosition;
        varying vec3 vLocalPosition;
        varying vec2 vUv;
        
        // Ripples tracking (x, y are local water coords, z is birthTime)
        uniform vec3 ripples[8];
        uniform int activeRipplesCount;

        const float PI = 3.1415926535897932;

        // Ajarus shader params
        const float speed = 0.2;
        const float speed_x = 0.3;
        const float speed_y = 0.3;

        const float emboss = 0.50;
        const float intensity = 2.4;
        const int steps = 8;
        const float frequency = 6.0;
        const int angle = 7;

        const float delta = 60.0;
        const float gain = 700.0;
        const float reflectionCutOff = 0.012;
        const float reflectionIntensity = 200000.0;

        float col(vec2 coord, float timeVal)
        {
          float delta_theta = 2.0 * PI / float(angle);
          float colVal = 0.0;
          float theta = 0.0;
          for (int i = 0; i < steps; i++)
          {
            vec2 adjc = coord;
            theta = delta_theta * float(i);
            adjc.x += cos(theta) * timeVal * speed + timeVal * speed_x;
            adjc.y -= sin(theta) * timeVal * speed - timeVal * speed_y;
            colVal = colVal + cos((adjc.x * cos(theta) - adjc.y * sin(theta)) * frequency) * intensity;
          }
          return cos(colVal);
        }

        void main() {
          float timeVal = time * 1.3;
          vec2 p = vUv;
          vec2 c1 = p;
          vec2 c2 = p;
          
          // 1. Calculate Ajarus displacement
          float cc1 = col(c1, timeVal);

          c2.x += 1.0 / delta;
          float dx = emboss * (cc1 - col(c2, timeVal)) / delta;

          c2.x = p.x;
          c2.y += 1.0 / delta;
          float dy = emboss * (cc1 - col(c2, timeVal)) / delta;

          // 2. Add interactive expanding ripples (analytical wave equation)
          for (int i = 0; i < 8; i++) {
            if (i >= activeRipplesCount) break;
            vec3 ripple = ripples[i];
            float age = time - ripple.z;
            if (age < 0.0 || age > 4.5) continue;

            float dist = distance(vLocalPosition.xy, ripple.xy);
            float waveSpeed = 4.5;
            float waveFront = waveSpeed * age;

            if (dist < waveFront && dist > 0.0) {
              float diff = dist - waveFront;
              float wave = sin(8.0 * diff) * exp(-1.5 * age) * 0.35;
              vec2 dir = (vLocalPosition.xy - ripple.xy) / dist;
              
              dx += dir.x * wave * 0.02;
              dy += dir.y * wave * 0.02;
            }
          }

          // Refract UV coordinates
          c1.x += dx * 2.0;
          c1.y = fract(c1.y + dy * 2.0);

          float alpha = 1.0 + dot(dx, dy) * gain;
          
          float ddx = dx - reflectionCutOff;
          float ddy = dy - reflectionCutOff;
          if (ddx > 0.0 && ddy > 0.0) {
            alpha = pow(alpha, ddx * ddy * reflectionIntensity);
          }
          
          // Sample refracted texture
          vec4 colTex = texture2D(bebopTexture, c1) * alpha;
          gl_FragColor = colTex;
        }
      `,
      transparent: true,
      depthWrite: false
    });

    const waterGeom = new THREE.PlaneGeometry(32, 22, 64, 64);
    waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
    waterMesh.rotation.x = -Math.PI / 2; // Flat horizontal plane
    waterMesh.position.y = -0.5;         // Pool surface height
    scene.add(waterMesh);

    // 4. Load Cowboy Bebop Background image and assign to scene & water
    const bgLoader = new THREE.TextureLoader();
    bgLoader.load(`${baseUrl}bebop_bg.jpg`, (bgTexture) => {
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      bgTexture.wrapS = THREE.ClampToEdgeWrapping;
      bgTexture.wrapT = THREE.ClampToEdgeWrapping;
      
      if (scene) scene.background = bgTexture;
      if (waterMaterial) {
        waterMaterial.uniforms.bebopTexture.value = bgTexture;
      }
    });

    // 5. Generate all 6 cards
    const cardNames: ('profile' | 'skills' | 'education' | 'projects' | 'achievements' | 'experience')[] = [
      'profile', 'skills', 'education', 'projects', 'achievements', 'experience'
    ];

    cardGroup = new THREE.Group();
    cardMeshes = [];
    crtMaterials = [];

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

    // 6. Global Mouse Move Listener
    window.addEventListener('mousemove', handleMouseMoveGlobal);

    tick();
  }

  function tick() {
    animId = requestAnimationFrame(tick);

    if (renderer && scene && camera && cardGroup) {
      const time = Date.now() * 0.001;

      // Update Shader time uniforms
      if (waterMaterial) {
        waterMaterial.uniforms.time.value = time;
      }
      crtMaterials.forEach(mat => {
        mat.uniforms.time.value = time;
      });

      // Drifting pool floaties physics engine
      const isMobile = window.innerWidth < 768;

      cardGroup.children.forEach(card => {
        const name = card.name as keyof typeof anchors;
        const anchor = anchors[name];
        const vel = velocities[name];
        if (!anchor || !vel) return;

        const isHovered = card.name === hoveredCardName;

        if (!isMobile) {
          // 1. Horizontal Drifting & Restoring Springs
          const dist = Math.sqrt(Math.pow(card.position.x - anchor.x, 2) + Math.pow(card.position.z - anchor.z, 2));
          if (dist > 1.1) {
            // Spring velocity pull back
            vel.x += (anchor.x - card.position.x) * 0.001;
            vel.z += (anchor.z - card.position.z) * 0.001;
          }

          // Subtle Brownian drift pushes
          vel.x += (Math.random() - 0.5) * 0.00015;
          vel.z += (Math.random() - 0.5) * 0.00015;

          // Velocity speed clamp
          const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
          const maxSpeed = 0.006;
          if (speed > maxSpeed) {
            vel.x = (vel.x / speed) * maxSpeed;
            vel.z = (vel.z / speed) * maxSpeed;
          }

          // Apply drift displacements
          card.position.x += vel.x;
          card.position.z += vel.z;

          // 2. Wave height displacement bobbing (floaties physics)
          const localWaveHeight = getWaveHeight(card.position.x, card.position.z, time);
          const targetY = -0.5 + localWaveHeight + (isHovered ? 0.45 : 0.0);
          card.position.y += (targetY - card.position.y) * 0.1;

          // 3. Wave slope alignment tilting (floaties slope calculation)
          const slope = getWaveSlope(card.position.x, card.position.z, time);
          
          // Target scale
          const targetScale = isHovered ? 1.06 : 1.0;
          const currentScale = card.scale.x;
          card.scale.setScalar(currentScale + (targetScale - currentScale) * 0.1);

          if (isHovered) {
            // Hover parallax control
            const targetRotX = slope.dfdz * 0.6 + mouseY * 0.4;
            const targetRotY = mouseX * 0.4;
            const targetRotZ = -slope.dfdx * 0.6;

            card.rotation.x += (targetRotX - card.rotation.x) * 0.1;
            card.rotation.y += (targetRotY - card.rotation.y) * 0.1;
            card.rotation.z += (targetRotZ - card.rotation.z) * 0.1;
          } else {
            // Wave alignment sways
            const targetRotX = slope.dfdz * 0.6;
            const targetRotZ = -slope.dfdx * 0.6;

            card.rotation.x += (targetRotX - card.rotation.x) * 0.12;
            card.rotation.y += (0 - card.rotation.y) * 0.12;
            card.rotation.z += (targetRotZ - card.rotation.z) * 0.12;
          }
        } else {
          // Mobile static spacing positions bobbing
          card.scale.setScalar(1.0);
          card.rotation.set(0, 0, 0);
        }
      });

      // Smooth vertical scroll damping for mobile
      if (isMobile) {
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
    camera.position.set(0, 2.5, width < 768 ? 9.5 : 8.0);
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
      ontouchstart={handleTouchStart}
      onwheel={handleWheel}
      class="w-full h-full"
      role="region"
      aria-label="3D Capabilities Board Controls"
    ></div>

    <!-- Hidden dynamic canvas texture targets -->
    <canvas bind:this={canvases.profile} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.skills} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.education} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.projects} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.achievements} width="1024" height="1024" class="hidden"></canvas>
    <canvas bind:this={canvases.experience} width="1024" height="1024" class="hidden"></canvas>
  </div>
</section>
