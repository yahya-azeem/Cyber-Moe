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
  
  // Widescreen Background plane
  let bgMesh: THREE.Mesh | null = null;

  // 2D Fullscreen Water overlay post-process
  let postScene: THREE.Scene | null = null;
  let postCamera: THREE.OrthographicCamera | null = null;
  let waterMesh: THREE.Mesh | null = null;
  let waterMaterial: THREE.ShaderMaterial | null = null;
  let renderTarget: THREE.WebGLRenderTarget | null = null;

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

  // Card screen submeshes for raycast hovering
  let cardMeshes: THREE.Object3D[] = [];

  // Parallax mouse position
  let mouseX = 0;
  let mouseY = 0;

  // Raycaster for card-level scroll hovering
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCardName = $state('');

  // Pinned Default Scattered Layouts
  const defaultLayouts = {
    profile:      { x: -3.4, y: 1.5,  z: 0.15, rx: 0.05,  ry: 0.08,  rz: -0.04 },
    skills:       { x: -3.1, y: -1.3, z: -0.25, rx: -0.03, ry: -0.05, rz: 0.03 },
    education:    { x: -0.1, y: 1.55, z: -0.1,  rx: 0.02,  ry: 0.02,  rz: 0.02 },
    projects:     { x: 0.25, y: -1.3, z: 0.1,  rx: -0.03, ry: -0.03, rz: -0.03 },
    achievements: { x: 3.35, y: 1.45, z: 0.3,  rx: 0.04,  ry: -0.08, rz: 0.05 },
    experience:   { x: 3.4,  y: -1.45, z: -0.2,  rx: -0.02, ry: 0.06,  rz: -0.02 }
  };

  // Ripple simulation queue (coordinates in UV space: 0.0 to 1.0)
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
      if (renderTarget) renderTarget.dispose();
    };
  });

  // Inject a ripple in UV coordinates
  function addRipple(u: number, v: number) {
    const now = Date.now() * 0.001;
    activeRipples.push({ x: u, y: v, time: now });

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
    }
  }

  // Handles clicking on the water to spawn a 2D splash ripple overlay
  function handleMouseDown(e: MouseEvent) {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    
    // Normalized screen UV coords
    const u = (e.clientX - rect.left) / rect.width;
    const v = 1.0 - (e.clientY - rect.top) / rect.height;
    
    addRipple(u, v);
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length > 0 && renderer) {
      const rect = renderer.domElement.getBoundingClientRect();
      const u = (e.touches[0].clientX - rect.left) / rect.width;
      const v = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
      addRipple(u, v);
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
    ctx.font = 'bold 44px Times New Roman, serif';
    ctx.fillText(headerText.toUpperCase(), 50, 95);

    // Clip rendering window to keep text inside boundary
    ctx.save();
    ctx.beginPath();
    ctx.rect(40, 130, canvas.width - 80, canvas.height - 180);
    ctx.clip();

    let y = 180 - scrollVal;

    if (type === 'profile') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 50px Times New Roman, serif';
      ctx.fillText(data.contact.name.toUpperCase(), 50, y);
      y += 60;

      ctx.fillStyle = '#e0a92e';
      ctx.font = '28px Times New Roman, serif';
      ctx.fillText('SECURITY RESEARCHER & SYSTEMS ENGINEER', 50, y);
      y += 70;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Times New Roman, serif';
      ctx.fillText(`LOCATION: ${data.contact.location}`, 50, y);
      y += 45;
      ctx.fillText(`EMAIL:    ${data.contact.email}`, 50, y);
      y += 45;
      ctx.fillText(`GITHUB:   ${data.contact.githubUrl.replace('https://', '')}`, 50, y);
      y += 45;
      ctx.fillText(`LINKEDIN: linkedin.com/in/muhammad-azeem`, 50, y);
      y += 80;

      ctx.fillStyle = '#e0a92e';
      ctx.font = 'bold 32px Times New Roman, serif';
      ctx.fillText('// SUMMARY', 50, y);
      y += 50;

      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Times New Roman, serif';
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
          ctx.font = 'bold 36px Times New Roman, serif';
          ctx.fillText(ach.title.toUpperCase(), 50, y);
          ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
          ctx.font = '22px Times New Roman, serif';
          ctx.fillText(ach.date, canvas.width - 240, y);
          
          y += 60;

          ctx.fillStyle = '#f3efe0';
          ctx.font = '28px Times New Roman, serif';
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
          ctx.font = 'italic 22px Times New Roman, serif';
          ctx.fillText('HTB Profile: hackthebox.com/users/yahya-azeem', 50, y);
          y += 70;
        });
      }
    } else if (type === 'education') {
      ctx.fillStyle = '#a8201a';
      ctx.font = 'bold 36px Times New Roman, serif';
      ctx.fillText(data.education.school.toUpperCase(), 50, y);
      ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
      ctx.font = '22px Times New Roman, serif';
      ctx.fillText(data.education.date, canvas.width - 220, y);

      y += 65;
      ctx.fillStyle = '#e0a92e';
      ctx.font = '28px Times New Roman, serif';
      ctx.fillText(data.education.degree, 50, y);
      y += 45;
      ctx.fillStyle = '#f3efe0';
      ctx.font = '28px Times New Roman, serif';
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
        ctx.font = 'bold 36px Times New Roman, serif';
        ctx.fillText(`> ${cat.label.toUpperCase()}`, 50, y);
        y += 50;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '28px Times New Roman, serif';

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
        ctx.font = 'bold 36px Times New Roman, serif';
        ctx.fillText(`[ ${project.title.toUpperCase()} ]`, 50, y);
        
        ctx.fillStyle = '#e0a92e';
        ctx.font = 'italic 24px Times New Roman, serif';
        ctx.fillText(`Tech: { ${project.tech} }`, 50, y + 30);
        
        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '22px Times New Roman, serif';
        ctx.fillText(project.date, canvas.width - 240, y);
        
        y += 80;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '26px Times New Roman, serif';
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
        ctx.font = 'bold 36px Times New Roman, serif';
        ctx.fillText(`// ADDITIONAL CODE BASES`, 50, y);
        y += 60;

        data.otherProjects.forEach(other => {
          ctx.fillStyle = '#f3efe0';
          ctx.font = '26px Times New Roman, serif';
          ctx.fillText(`• ${other.title}`, 60, y);
          
          ctx.fillStyle = 'rgba(224, 169, 46, 0.6)';
          ctx.font = '22px Times New Roman, serif';
          ctx.fillText(other.url, 85, y + 30);
          
          y += 70;
        });
      }
    } else if (type === 'experience') {
      data.experience.forEach(job => {
        ctx.fillStyle = '#a8201a';
        ctx.font = 'bold 36px Times New Roman, serif';
        ctx.fillText(`// ${job.role.toUpperCase()}`, 50, y);

        ctx.fillStyle = '#e0a92e';
        ctx.font = '24px Times New Roman, serif';
        ctx.fillText(`${job.company}`, 50, y + 30);

        ctx.fillStyle = 'rgba(243, 239, 224, 0.4)';
        ctx.font = '22px Times New Roman, serif';
        ctx.fillText(job.date, canvas.width - 240, y);

        y += 80;

        ctx.fillStyle = '#f3efe0';
        ctx.font = '26px Times New Roman, serif';
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

    // Custom CRT Screen Shader Material
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
    const pixelRatio = window.devicePixelRatio || 1;

    // 1. Scene setup
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, width < 768 ? 9.0 : 7.5);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(pixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);

    // 2. High-res WebGLRenderTarget without mipmap blurriness
    const targetWidth = width * Math.min(pixelRatio, 2);
    const targetHeight = height * Math.min(pixelRatio, 2);
    renderTarget = new THREE.WebGLRenderTarget(targetWidth, targetHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      colorSpace: THREE.SRGBColorSpace
    });

    // 3. Post-processing scene and orthographic camera for pixel-perfect 2D overlay
    postScene = new THREE.Scene();
    postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0a92e, 1.7);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // 5. Load Cowboy Bebop Background plane in scene background
    const bgLoader = new THREE.TextureLoader();
    bgLoader.load(`${baseUrl}bebop_bg.jpg`, (bgTexture) => {
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      
      const bgGeom = new THREE.PlaneGeometry(30, 18);
      const bgMat = new THREE.MeshBasicMaterial({ map: bgTexture, depthWrite: false });
      bgMesh = new THREE.Mesh(bgGeom, bgMat);
      bgMesh.position.z = -7.0;
      scene?.add(bgMesh);
    });

    // 6. Generate all 6 cards floating at z = 0
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

      const screenMesh = card.children[0];
      cardMeshes.push(screenMesh);
    });

    scene.add(cardGroup);
    positionCards();

    // 7. Setup Ajarus Water ShaderMaterial for the fullscreen 2D overlay
    const aspect = width / height;
    waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        aspect: { value: aspect },
        bebopTexture: { value: renderTarget.texture },
        ripples: { value: Array.from({ length: 8 }, () => new THREE.Vector3(0, 0, -999)) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float aspect;
        uniform sampler2D bebopTexture;
        varying vec2 vUv;
        
        uniform vec3 ripples[8];

        void main() {
          vec2 uv = vUv;
          float timeVal = time * 1.5;
          
          // Amplified overlapping wave heights for high-visibility fluid movement
          float wave1 = sin(uv.x * 18.0 + timeVal) * 0.018;
          float wave2 = cos(uv.y * 18.0 + timeVal * 1.2) * 0.018;
          float wave3 = sin((uv.x + uv.y) * 12.0 - timeVal * 1.4) * 0.012;
          
          vec2 offset = vec2(wave1 + wave3, wave2 + wave3);
          
          // Concentric ripples from click / touch coordinates
          for (int i = 0; i < 8; i++) {
            vec3 ripple = ripples[i];
            if (ripple.z < -90.0) continue; // static skip of inactive elements
            float age = time - ripple.z;
            if (age < 0.0 || age > 4.0) continue;

            vec2 uvAspect = uv * vec2(aspect, 1.0);
            vec2 rippleAspect = ripple.xy * vec2(aspect, 1.0);
            float dist = distance(uvAspect, rippleAspect);

            float waveSpeed = 0.75;
            float waveFront = waveSpeed * age;

            if (dist < waveFront && dist > 0.0) {
              float diff = dist - waveFront;
              // High frequency ripple rings
              float wave = sin(32.0 * diff) * exp(-1.4 * age) * 0.12;
              vec2 dir = (uvAspect - rippleAspect) / dist;
              offset += dir * wave * 0.45; // Amplified displacement
            }
          }

          // Sample refracted scene texture
          vec4 colTex = texture2D(bebopTexture, uv + offset);
          
          // Specular highlight: white/blue tint reflecting wave slopes
          float sheen = abs(offset.x + offset.y) * 8.0;
          colTex.rgb += vec3(sheen * 0.08, sheen * 0.11, sheen * 0.18);
          
          gl_FragColor = colTex;
        }
      `,
      depthTest: false,
      depthWrite: false
    });

    // 2D fullscreen quad in postScene
    const waterGeom = new THREE.PlaneGeometry(2, 2);
    waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
    waterMesh.frustumCulled = false;
    postScene.add(waterMesh);

    // 8. Global Mouse Move Listener
    window.addEventListener('mousemove', handleMouseMoveGlobal);

    tick();
  }

  function tick() {
    animId = requestAnimationFrame(tick);

    if (renderer && scene && camera && cardGroup && postScene && postCamera && renderTarget) {
      const time = Date.now() * 0.001;

      // Update shader times
      if (waterMaterial) {
        waterMaterial.uniforms.time.value = time;
      }
      crtMaterials.forEach(mat => {
        mat.uniforms.time.value = time;
      });

      // Hover-specific parallax adjustments
      const isMobile = window.innerWidth < 768;

      cardGroup.children.forEach(card => {
        const isHovered = card.name === hoveredCardName;
        const name = card.name as keyof typeof defaultLayouts;
        const def = defaultLayouts[name];
        if (!def) return;

        // Hover depth lift and scale
        const targetZ = isHovered ? def.z + 0.5 : def.z;
        const targetScale = isHovered ? 1.06 : 1.0;

        card.position.z += (targetZ - card.position.z) * 0.1;
        card.scale.setScalar(card.scale.x + (targetScale - card.scale.x) * 0.1);

        if (!isMobile) {
          if (isHovered) {
            const targetRotX = def.rx + mouseY * 0.45;
            const targetRotY = def.ry + mouseX * 0.45;

            card.rotation.x += (targetRotX - card.rotation.x) * 0.1;
            card.rotation.y += (targetRotY - card.rotation.y) * 0.1;
          } else {
            card.rotation.x += (def.rx - card.rotation.x) * 0.12;
            card.rotation.y += (def.ry - card.rotation.y) * 0.12;
            card.rotation.z += (def.rz - card.rotation.z) * 0.12;
          }
        }
      });

      // Smooth vertical scroll on mobile
      if (isMobile) {
        cardGroup.position.y += (groupScrollY - cardGroup.position.y) * 0.1;
      } else {
        cardGroup.position.y = 0;
      }

      // 1. Render 3D cards and background plane to high-res render target
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      
      // 2. Render final 2D water post-process overlay plane directly to screen
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
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
    if (!threeContainer || !renderer || !camera || !waterMesh || !renderTarget) return;
    const width = threeContainer.clientWidth;
    const height = threeContainer.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    camera.aspect = width / height;
    camera.position.set(0, 0, width < 768 ? 9.0 : 7.5);
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    
    const targetWidth = width * Math.min(pixelRatio, 2);
    const targetHeight = height * Math.min(pixelRatio, 2);
    renderTarget.setSize(targetWidth, targetHeight);

    if (waterMaterial) {
      waterMaterial.uniforms.aspect.value = width / height;
    }

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
