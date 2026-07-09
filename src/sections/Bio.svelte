<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import * as THREE from 'three';
  import { ExternalLink, GitCommit, Code } from 'lucide-svelte';
  import { parseResume, type ResumeData } from '../lib/resumeParser';
  import { fetchUserEvents, type GitHubEvent } from '../lib/github';

  let containerRef = $state<HTMLDivElement>();
  let resumeData = $state<ResumeData | null>(null);
  let events = $state<GitHubEvent[]>([]);
  let isLoading = $state(true);
  let isLoadingEvents = $state(true);
  let bhCanvas = $state<HTMLCanvasElement>();
  let cleanupBH = () => {};

  const baseUrl = import.meta.env.BASE_URL || '/';
  const aboutMeImg = `${baseUrl}about_me.png`;
  const resumeUrl = `${baseUrl}resume.tex`;

  let matrixCanvas = $state<HTMLCanvasElement>();

  function initMatrixRain() {
    if (!matrixCanvas) return () => {};
    const canvas = matrixCanvas;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return () => {};

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();

    const katakana = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    const alphabet = katakana.split("");
    const fontSize = 16;
    let columns = canvas.width / fontSize;

    let rainDrops: number[] = [];
    for (let x = 0; x < columns; x++) {
      rainDrops[x] = Math.random() * -50;
    }

    function draw() {
      ctx.fillStyle = 'rgba(11, 12, 16, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ff2a85'; // Pink
      ctx.font = 'bold ' + fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        const xPos = i * fontSize;
        const yPos = rainDrops[i] * fontSize;

        ctx.fillText(text, xPos, yPos);

        if (yPos > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      resizeCanvas();
      columns = canvas.width / fontSize;
      rainDrops = [];
      for (let x = 0; x < columns; x++) {
        rainDrops[x] = Math.random() * -50;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }

  onMount(() => {
    // Entrance animations
    const ctx = gsap.context(() => {
      gsap.fromTo('.retro-animate',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);

    const cleanupMatrix = initMatrixRain();

    // Fetch dynamic content in IIFE
    (async () => {
      try {
        const response = await fetch(resumeUrl);
        if (response.ok) {
          const texText = await response.text();
          resumeData = parseResume(texText);
        }
        isLoading = false;
      } catch (e) {
        console.error(e);
        isLoading = false;
      }



      try {
        const userEvents = await fetchUserEvents();
        events = userEvents.slice(0, 5);
        isLoadingEvents = false;
      } catch (e) {
        console.error(e);
        isLoadingEvents = false;
      }
    })();

    cleanupBH = initBlackHole();

    return () => {
      ctx.revert();
      cleanupMatrix();
      cleanupBH();
    };
  });



  // Helper to format event names into readable Bebop logs
  function formatBebopEvent(event: GitHubEvent): string {
    const time = new Date(event.created_at).toLocaleDateString();
    const repoName = event.repo.name.replace('yahya-azeem/', '');
    
    switch (event.type) {
      case 'PushEvent':
        return `[${time}] PUSHED COMMITS TO // ${repoName}`;
      case 'CreateEvent':
        return `[${time}] CREATED REPOSITORY // ${repoName}`;
      case 'WatchEvent':
        return `[${time}] STARRED ARCHIVE // ${repoName}`;
      case 'ForkEvent':
        return `[${time}] FORKED SOURCE // ${repoName}`;
      default:
        return `[${time}] UPDATED LOG // ${repoName}`;
    }
  }

  // Raymarching Black Hole Accretion Disk Shader setup
  let bhRenderer: THREE.WebGLRenderer | null = null;
  let bhScene: THREE.Scene | null = null;
  let bhCamera: THREE.Camera | null = null;
  let bhMaterial: THREE.ShaderMaterial | null = null;
  let bhAnimId = 0;
  let bhMouse = new THREE.Vector2(0.5, 0.5);

  function initBlackHole() {
    if (!bhCanvas) return () => {};

    const width = bhCanvas.clientWidth;
    const height = bhCanvas.clientHeight;

    bhScene = new THREE.Scene();
    bhCamera = new THREE.Camera(); // simple orthographic camera for fullscreen quad

    bhRenderer = new THREE.WebGLRenderer({ canvas: bhCanvas, antialias: true });
    bhRenderer.setSize(width, height);
    bhRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const bgLoader = new THREE.TextureLoader();
    const noiseTex = bgLoader.load(`${baseUrl}bebop_bg.jpg`);
    noiseTex.wrapS = THREE.RepeatWrapping;
    noiseTex.wrapT = THREE.RepeatWrapping;

    bhMaterial = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(width, height) },
        iMouse: { value: new THREE.Vector2(width * 0.5, height * 0.5) },
        iChannel0: { value: noiseTex }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 iMouse;
        uniform sampler2D iChannel0;
        varying vec2 vUv;

        #define AA 1
        #define _Speed 3.0
        #define _Steps 12.0
        #define _Size 0.3

        float hash(float x){ return fract(sin(x)*152754.742);}
        float hash(vec2 x){	return hash(x.x + hash(x.y));}

        float value(vec2 p, float f)
        {
            float bl = hash(floor(p*f + vec2(0.,0.)));
            float br = hash(floor(p*f + vec2(1.,0.)));
            float tl = hash(floor(p*f + vec2(0.,1.)));
            float tr = hash(floor(p*f + vec2(1.,1.)));
            
            vec2 fr = fract(p*f);    
            fr = (3. - 2.*fr)*fr*fr;	
            float b = mix(bl, br, fr.x);	
            float t = mix(tl, tr, fr.x);
            return  mix(b,t, fr.y);
        }

        vec4 background(vec3 ray)
        {
            vec2 uv = ray.xy;
            if( abs(ray.x) > 0.5)
                uv.x = ray.z;
            else if( abs(ray.y) > 0.5)
                uv.y = ray.z;
                
            float brightness = value( uv*3., 100.);
            float color = value( uv*2., 20.); 
            brightness = pow(brightness, 256.);
            brightness = brightness*100.;
            brightness = clamp(brightness, 0., 1.);
            
            vec3 stars = brightness * mix(vec3(1., .6, .2), vec3(.2, .6, 1), color);

            vec4 nebulae = texture2D(iChannel0, uv*1.5);
            nebulae.xyz += nebulae.xxx + nebulae.yyy + nebulae.zzz;
            nebulae.xyz *= 0.25;
            
            nebulae*= nebulae;
            nebulae*= nebulae;
            nebulae*= nebulae;
            nebulae*= nebulae;
         
            nebulae.xyz += stars;
            return nebulae;
        }

        vec4 raymarchDisk(vec3 ray, vec3 zeroPos)
        {
            vec3 position = zeroPos;      
            float lengthPos = length(position.xz);
            float dist = min(1., lengthPos*(1./_Size) *0.5) * _Size * 0.4 *(1./_Steps) /( abs(ray.y) );

            position += dist*_Steps*ray*0.5;     

            vec2 deltaPos;
            deltaPos.x = -zeroPos.z*0.01 + zeroPos.x;
            deltaPos.y = zeroPos.x*0.01 + zeroPos.z;
            deltaPos = normalize(deltaPos - zeroPos.xz);
            
            float parallel = dot(ray.xz, deltaPos);
            parallel /= sqrt(lengthPos);
            parallel *= 0.5;
            float redShift = parallel +0.3;
            redShift *= redShift;

            redShift = clamp(redShift, 0., 1.);
            
            float disMix = clamp((lengthPos - _Size * 2.)*(1./_Size)*0.24, 0., 1.);
            vec3 insideCol =  mix(vec3(1.0,0.8,0.0), vec3(0.5,0.13,0.02)*0.2, disMix);
            
            insideCol *= mix(vec3(0.4, 0.2, 0.1), vec3(1.6, 2.4, 4.0), redShift);
            insideCol *= 1.25;
            redShift += 0.12;
            redShift *= redShift;

            vec4 o = vec4(0.);

            for(float i = 0. ; i < _Steps; i++)
            {                      
                position -= dist * ray ;  

                float intensity =clamp( 1. - abs((i - 0.8) * (1./_Steps) * 2.), 0., 1.); 
                float lengthPos = length(position.xz);
                float distMult = 1.;

                distMult *=  clamp((lengthPos -  _Size * 0.75) * (1./_Size) * 1.5, 0., 1.);        
                distMult *= clamp(( _Size * 10. -lengthPos) * (1./_Size) * 0.20, 0., 1.);
                distMult *= distMult;

                float u = lengthPos + iTime* _Size*0.3 + intensity * _Size * 0.2;

                vec2 xy ;
                float rot = mod(iTime*_Speed, 8192.);
                xy.x = -position.z*sin(rot) + position.x*cos(rot);
                xy.y = position.x*sin(rot) + position.z*cos(rot);

                float x = abs( xy.x/(xy.y));         
                float angle = 0.02*atan(x);
          
                const float f = 70.;
                float noise = value( vec2( angle, u * (1./_Size) * 0.05), f);
                noise = noise*0.66 + 0.33*value( vec2( angle, u * (1./_Size) * 0.05), f*2.);     

                float extraWidth =  noise * 1. * (1. -  clamp(i * (1./_Steps)*2. - 1., 0., 1.));

                float alpha = clamp(noise*(intensity + extraWidth)*( (1./_Size) * 10.  + 0.01 ) *  dist * distMult , 0., 1.);

                vec3 col = 2.*mix(vec3(0.3,0.2,0.15)*insideCol, insideCol, min(1.,intensity*2.));
                o = clamp(vec4(col*alpha + o.rgb*(1.-alpha), o.a*(1.-alpha) + alpha), vec4(0.), vec4(1.));

                lengthPos *= (1./_Size);
           
                o.rgb+= redShift*(intensity*1. + 0.5)* (1./_Steps) * 100.*distMult/(lengthPos*lengthPos);
            }  
         
            o.rgb = clamp(o.rgb - 0.005, 0., 1.);
            return o ;
        }

        void Rotate( inout vec3 vector, vec2 angle )
        {
            vector.yz = cos(angle.y)*vector.yz
                        +sin(angle.y)*vec2(-1,1)*vector.zy;
            vector.xz = cos(angle.x)*vector.xz
                        +sin(angle.x)*vec2(-1,1)*vector.zx;
        }

        void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            vec4 colOut = vec4(0.);
            
            vec2 fragCoordRot;
            fragCoordRot.x = fragCoord.x*0.985 + fragCoord.y * 0.174;
            fragCoordRot.y = fragCoord.y*0.985 - fragCoord.x * 0.174;
            fragCoordRot += vec2(-0.06, 0.12) * iResolution.xy;
            
            for( int j=0; j<AA; j++ )
            for( int i=0; i<AA; i++ )
            {
                float maxDim = max(iResolution.x, iResolution.y);
                vec3 ray = normalize( vec3((fragCoordRot-iResolution.xy*.5  + vec2(i,j)/(float(AA)))/maxDim, 1 )); 
                float mouseZ = (20.*(iMouse.x/iResolution.x)-10.);
                vec3 pos = vec3(0.,0.05,-mouseZ*mouseZ*.05); 
                vec2 angle = vec2(iTime*0.1,.2);      
                angle.y = (2.*iMouse.y/iResolution.y)*3.14 + 0.1 + 3.14;
                float dist = length(pos);
                Rotate(pos,angle);
                angle.xy -= min(.3/dist , 3.14) * vec2(1, 0.5);
                Rotate(ray,angle);

                vec4 col = vec4(0.); 
                vec4 glow = vec4(0.); 
                vec4 outCol =vec4(100.);

                for(int disks = 0; disks< 20; disks++)
                {
                    for (int h = 0; h < 6; h++)
                    {
                        float dotpos = dot(pos,pos);
                        float invDist = inversesqrt(dotpos);
                        float centDist = dotpos * invDist; 	
                        float stepDist = 0.92 * abs(pos.y /(ray.y));  
                        float farLimit = centDist * 0.5;
                        float closeLimit = centDist*0.1 + 0.05*centDist*centDist*(1./_Size);
                        stepDist = min(stepDist, min(farLimit, closeLimit));
                        
                        float invDistSqr = invDist * invDist;
                        float bendForce = stepDist * invDistSqr * _Size * 0.625;
                        ray =  normalize(ray - (bendForce * invDist )*pos);
                        pos += stepDist * ray; 
                        
                        glow += vec4(1.2,1.1,1, 1.0) *(0.01*stepDist * invDistSqr * invDistSqr *clamp( centDist*(2.) - 1.2,0.,1.));
                    }

                    float dist2 = length(pos);

                    if(dist2 < _Size * 0.1)
                    {
                        outCol =  vec4( col.rgb * col.a + glow.rgb *(1.-col.a ) ,1.) ;
                        break;
                    }
                    else if(dist2 > _Size * 1000.)
                    {                   
                        vec4 bg = background(ray);
                        outCol = vec4(col.rgb*col.a + bg.rgb*(1.-col.a)  + glow.rgb *(1.-col.a    ), 1.);       
                        break;
                    }
                    else if (abs(pos.y) <= _Size * 0.002 )
                    {                             
                        vec4 diskCol = raymarchDisk(ray, pos);
                        pos.y = 0.;
                        pos += abs(_Size * 0.001 /ray.y) * ray;  
                        col = vec4(diskCol.rgb*(1.-col.a) + col.rgb, col.a + diskCol.a*(1.-col.a));
                    }	
                }
           
                if(outCol.r == 100.)
                    outCol = vec4(col.rgb + glow.rgb *(col.a +  glow.a) , 1.);

                col = outCol;
                col.rgb =  pow( col.rgb, vec3(0.6) );
                
                colOut += col/float(AA*AA);
            }
            gl_FragColor = colOut;
        }
      `
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bhMaterial);
    bhScene.add(mesh);

    // Mouse and Touch listeners inside canvas for cross-device support
    const handleMouseMove = (e: MouseEvent) => {
      const rect = bhCanvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.height - (e.clientY - rect.top);
      bhMouse.set(x, y);
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = bhCanvas!.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = rect.height - (e.touches[0].clientY - rect.top);
        bhMouse.set(x, y);
      }
    };

    bhCanvas.addEventListener('mousemove', handleMouseMove);
    bhCanvas.addEventListener('touchstart', handleTouch, { passive: true });
    bhCanvas.addEventListener('touchmove', handleTouch, { passive: true });

    const tick = () => {
      if (!bhRenderer || !bhScene || !bhCamera || !bhMaterial) return;
      bhAnimId = requestAnimationFrame(tick);

      bhMaterial.uniforms.iTime.value = Date.now() * 0.001;
      bhMaterial.uniforms.iMouse.value.lerp(bhMouse, 0.05);

      bhRenderer.render(bhScene, bhCamera);
    };

    tick();

    return () => {
      cancelAnimationFrame(bhAnimId);
      if (bhCanvas) {
        bhCanvas.removeEventListener('mousemove', handleMouseMove);
        bhCanvas.removeEventListener('touchstart', handleTouch);
        bhCanvas.removeEventListener('touchmove', handleTouch);
      }
      if (bhRenderer) bhRenderer.dispose();
      noiseTex.dispose();
    };
  }

  function handleBhResize() {
    if (!bhCanvas || !bhRenderer || !bhMaterial) return;
    const width = bhCanvas.clientWidth;
    const height = bhCanvas.clientHeight;
    bhRenderer.setSize(width, height);
    bhMaterial.uniforms.iResolution.value.set(width, height);
  }
</script>

<svelte:window onresize={handleBhResize} />

<div bind:this={containerRef} class="py-12 lg:py-20 max-w-[1200px] mx-auto px-6 relative z-10">
  <!-- Matrix rain background overlay -->
  <canvas 
    bind:this={matrixCanvas} 
    class="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-25"
  ></canvas>
  
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">
    
    <div class="lg:col-span-7 space-y-8 order-2 lg:order-1">
      <div class="retro-animate flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
          <h1 class="font-dots text-4xl sm:text-5xl text-[#e0a92e] uppercase tracking-tight">
            About me
          </h1>
        </div>
      </div>

      <!-- Projects from Resume -->
      <div class="space-y-6">
        {#if isLoading}
          <div class="py-20 text-center bg-[#0f1115] border-2 border-[#3d3428] font-mono text-xs text-white/40">
            <span class="inline-block animate-pulse">QUERYING RESUME PROJECTS...</span>
          </div>
        {:else if !resumeData || resumeData.projects.length === 0}
          <div class="py-12 text-center bg-[#0f1115] border-2 border-[#3d3428] font-mono text-xs text-white/40">
            <span>NO RESUME PROJECTS RETURNED</span>
          </div>
        {:else}
          {#each resumeData.projects as project}
            <div class="bebop-card p-6 flex flex-col justify-between relative group retro-animate">
              
              <div class="space-y-4">
                <div class="flex justify-between items-start gap-4">
                  <span class="font-mono text-[9px] text-[#a8201a] uppercase font-bold tracking-wider">
                    // KEY TECHNOLOGIES: {project.tech}
                  </span>
                  <div class="flex items-center gap-3">
                    <span class="text-[#e0a92e] text-xs font-mono hidden sm:inline">{project.date}</span>
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="text-white/40 hover:text-white transition-colors"
                      aria-label="GitHub Repository"
                    >
                      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  </div>
                </div>
                
                <h3 class="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#e0a92e] transition-colors">
                  {project.title}
                </h3>
                
                <ul class="space-y-2 text-[#f3efe0]/70 text-xs font-light leading-relaxed list-disc pl-4">
                  {#each project.bullets as bullet}
                    <li>{bullet}</li>
                  {/each}
                </ul>
              </div>
            </div>
          {/each}
          
          <!-- Render Other Projects in inline listing -->
          {#if resumeData.otherProjects && resumeData.otherProjects.length > 0}
            <div class="bg-[#0f1115]/40 border-2 border-[#3d3428] p-6 tab-item-card transition-all retro-animate">
              <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] mb-4 border-b border-[#3d3428] pb-2">
                Additional Repositories
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each resumeData.otherProjects as other}
                  <a 
                    href={other.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="flex items-center justify-between p-4 bg-black border border-[#3d3428] hover:border-[#e0a92e] group transition-all"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-[#e0a92e]/5 border border-[#3d3428] flex items-center justify-center group-hover:bg-[#e0a92e]/20 transition-colors">
                        <Code size={14} class="text-[#e0a92e]" />
                      </div>
                      <span class="text-white/70 group-hover:text-white font-mono text-sm transition-colors">{other.title}</span>
                    </div>
                    <ExternalLink size={14} class="text-white/30 group-hover:text-white transition-colors" />
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Live Activity Feed -->
      <div class="retro-animate space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-0.5 bg-[#a8201a]"></div>
          <h2 class="font-dots text-xl text-[#a8201a] uppercase tracking-wider">Live signal feed</h2>
        </div>

        <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 space-y-4 bebop-shadow-red font-mono text-xs">
          {#if isLoadingEvents}
            <p class="text-white/30 animate-pulse">// BUFFERING LIVE TRANSMISSIONS...</p>
          {:else if events.length === 0}
            <p class="text-white/30">// NO LIVE EVENTS IN BUFFER REGISTERED</p>
          {:else}
            <ul class="space-y-4">
              {#each events as event}
                <li class="border-b border-[#3d3428]/35 pb-2 last:border-b-0 last:pb-0 space-y-1">
                  <div class="flex items-center gap-2 text-[#e0a92e]">
                    <GitCommit size={12} />
                    <span class="font-bold text-[10px]">{event.type.replace('Event', '')}</span>
                  </div>
                  <p class="text-white/70 tracking-wide">{formatBebopEvent(event)}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <!-- Embedded local visual_decay GIF -->
        <div class="border-2 border-[#e0a92e] relative group bebop-shadow transition-all duration-300 hover:border-[#a8201a] overflow-hidden bg-black w-full max-w-[280px] mx-auto mt-4">
          <img 
            src={`${baseUrl}visual_decay.gif`} 
            alt="Orbital Decay Feed" 
            class="w-full h-auto block"
            onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/visual_decay.gif'; }}
          />
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
          <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
        </div>
      </div>
    </div>

    <!-- Right Area - Picture & Contacts (Span 5) -->
    <div class="lg:col-span-5 space-y-8 order-1 lg:order-2">
      
      <!-- Styled Avatar Card -->
      <div class="retro-animate relative group flex justify-center">
        <!-- Offset solid background border shadow -->
        <div class="absolute inset-0 bg-[#a8201a] border-2 border-[#a8201a] transform translate-x-3 translate-y-3 pointer-events-none"></div>
        
        <!-- Main Image Container -->
        <div class="relative w-full max-w-[380px] aspect-[4/5] bg-[#0f1115] border-2 border-[#e0a92e] p-2 overflow-hidden flex-shrink-0">
          <img 
            src={aboutMeImg} 
            alt="Muhammad Yahya Azeem" 
            class="w-full h-full object-cover scale-100"
            onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/about_me.png'; }}
          />
          <!-- Low-Fi Scanline overlay on image -->
          <div class="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
        </div>
      </div>

      <!-- Quick Contacts Block -->
      <div class="retro-animate bg-[#0f1115] border-2 border-[#3d3428] p-6 space-y-4">
        <h4 class="font-dots text-base text-[#e0a92e] uppercase tracking-wider border-b border-[#3d3428] pb-2">
          OPERATOR DIRECTORY
        </h4>
        
        <div class="space-y-4 font-mono text-xs text-[#f3efe0]/80">
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">EMAIL SIGNAL</span>
            <a href="mailto:yahyaazeem44@gmail.com" class="text-[#f3efe0] hover:text-[#e0a92e] transition-colors underline font-semibold text-sm">
              yahyaazeem44@gmail.com
            </a>
          </div>
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">LINKEDIN DISPATCH</span>
            <a 
              href="https://www.linkedin.com/in/muhammad-azeem-474612357/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-[#f3efe0] hover:text-[#e0a92e] transition-colors underline font-semibold text-sm"
            >
              linkedin.com/in/muhammad-azeem
            </a>
          </div>
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">BASE OF OPERATIONS</span>
            <span class="text-white text-xs">Irving, Texas // Global Friendly</span>
          </div>
        </div>
      </div>
      
      <!-- Telemetry Visualizer: Signal Loop -->
      <div class="retro-animate border-2 border-[#e0a92e] relative group bebop-shadow transition-all duration-300 hover:border-[#a8201a] overflow-hidden bg-black w-full max-w-[260px] mx-auto">
        <img 
          src={`${baseUrl}signal_loop.gif`} 
          alt="Interstellar Decay Mapping" 
          class="w-full h-auto block"
          onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/signal_loop.gif'; }}
        />
        <!-- Scanning lines overlay -->
        <div class="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
        <!-- Retro CRT Vignette -->
        <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
      </div>

      <!-- Social Feed -->
      <div class="retro-animate space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
          <h2 class="font-dots text-xl text-[#e0a92e] uppercase tracking-wider">Social Feed</h2>
        </div>

        <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 text-center space-y-5 bebop-shadow font-mono">
          <p class="text-[#f3efe0]/70 text-xs leading-relaxed">
            Access systems R&D updates, vulnerability analysis reports, and research dispatches directly on my LinkedIn activity feed.
          </p>
          <a 
            href="https://www.linkedin.com/in/muhammad-azeem-474612357/detail/recent-activity/shares/" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-bebop w-full block py-2.5 text-xs uppercase"
          >
            Open LinkedIn Dispatch
            <ExternalLink size={12} class="inline ml-1" />
          </a>
        </div>
      </div>

    </div>

  </div>
</div>

<!-- Black Hole Accretion Disk Shader Section (Singularity Monitor) -->
<div class="relative w-full h-[45vh] sm:h-[70vh] border-t-2 border-[#3d3428] bg-black overflow-hidden select-none">
  <div class="absolute top-6 left-6 z-10 font-dots text-[#e0a92e] text-sm uppercase tracking-widest flex items-center gap-3 bg-black/60 p-3 border border-[#3d3428]">
    <div class="w-3 h-3 bg-[#e0a92e] animate-ping rounded-full"></div>
    SINGULARITY DISPATCH MONITOR // SES-02
  </div>
  <canvas bind:this={bhCanvas} class="w-full h-full block cursor-crosshair"></canvas>
</div>
