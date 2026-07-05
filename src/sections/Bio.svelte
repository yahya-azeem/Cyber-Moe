<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { Shield, Cpu, Terminal, ExternalLink, Code } from 'lucide-svelte';

  let containerRef: HTMLDivElement;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const aboutMeImg = `${baseUrl}about_me.png`;

  onMount(() => {
    // Snappy retro terminal entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.retro-animate',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  });
</script>

<div bind:this={containerRef} class="py-12 lg:py-20 max-w-[1200px] mx-auto px-6">
  <!-- Retro Bebop Header Banner -->
  <div class="retro-animate bg-[#a8201a] text-[#f3efe0] font-mono text-xs font-semibold px-4 py-2 uppercase tracking-[0.3em] mb-12 flex justify-between items-center border border-[#a8201a] bebop-shadow">
    <span>SYSTEM ID: YAHYA-0945 // STARTUP OFFENSIVE SECURITY & EMULATION</span>
    <span class="hidden md:inline">SESSION #01 // "3, 2, 1, LET'S JAM!"</span>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
    
    <!-- Left Area - Narrative and Info (Span 7) -->
    <div class="lg:col-span-7 space-y-8">
      <div class="retro-animate space-y-3">
        <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em] block">
          // THE OPERATIVE
        </span>
        <h1 class="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight uppercase leading-none">
          Muhammad <br/>
          <span class="text-[#e0a92e]">Yahya Azeem</span>
        </h1>
        <p class="font-mono text-sm text-[#e0a92e] tracking-wider uppercase font-semibold">
          SYSTEMS DEVELOPER • REVERSE ENGINEER • OFFENSIVE RESEARCHER
        </p>
      </div>

      <div class="retro-animate prose prose-invert max-w-none text-[#f3efe0]/80 text-base sm:text-lg font-light leading-relaxed space-y-6">
        <p>
          I am a systems researcher and developer specializing in low-level emulation, OS kernel security, and deep learning optimizer hardening. I build real software (like PlayStation 5 emulation libraries and custom OS kernels) and audit high-risk infrastructure for startups.
        </p>
        <p>
          Unlike corporate security consultants who deliver boilerplate PDF checklists, I help early-stage startup teams actively secure codebases, hardness cloud layers, and map out vendor/supply-chain risk. If you are building high-performance or high-risk tech, I ensure it is protected from day one.
        </p>
      </div>

      <!-- Retro Terminal Status Log -->
      <div class="retro-animate bg-[#0f1115] border-2 border-[#3d3428] p-6 font-mono text-xs sm:text-sm space-y-2 relative overflow-hidden bebop-shadow-blue">
        <div class="absolute top-0 right-0 bg-[#3d3428] text-[#f3efe0] px-3 py-1 text-[9px] uppercase tracking-wider">
          LIVE STATUS
        </div>
        <p class="text-[#f3efe0]/40">// TARGET ACQUIRED</p>
        <p class="text-white"><span class="text-[#e0a92e]">></span> SCOPE: Hardening early-stage software & cloud layers</p>
        <p class="text-white"><span class="text-[#e0a92e]">></span> CURRENT OPERATION: Cybervigilance Risk Assessment</p>
        <p class="text-white"><span class="text-[#e0a92e]">></span> EMULATION R&D: ShadPS5 (GPU Shader Translator & SELF Loader)</p>
        <p class="text-white"><span class="text-[#e0a92e]">></span> DEEP LEARNING: Project Golf Ball Parameter LLM Optimizer</p>
        <p class="text-[#e0a92e]/80">> SYSTEM LOGS LOADED STATUS: 100% OK</p>
      </div>

      <!-- Cowboy Bebop Catchphrase -->
      <div class="retro-animate pt-4 font-mono text-right italic text-[#e0a92e]/40 text-xs tracking-widest uppercase">
        "Easy come, easy go... See You Space Cowboy..."
      </div>
    </div>

    <!-- Right Area - Profile Picture & Quick Capabilities (Span 5) -->
    <div class="lg:col-span-5 space-y-8">
      
      <!-- Styled Avatar Card -->
      <div class="retro-animate relative group flex justify-center">
        <!-- Offset solid background red border shadow -->
        <div class="absolute inset-0 bg-[#a8201a] border-2 border-[#a8201a] transform translate-x-3 translate-y-3 pointer-events-none"></div>
        
        <!-- Main Image Container -->
        <div class="relative w-full max-w-[380px] aspect-[4/5] bg-[#0f1115] border-2 border-[#e0a92e] p-2 overflow-hidden flex-shrink-0">
          <img 
            src={aboutMeImg} 
            alt="Muhammad Yahya Azeem" 
            class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500 scale-100"
            onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/about_me.png'; }}
          />
          
          <!-- Low-Fi Scanline overlay on image -->
          <div class="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
          
          <!-- Retro catalog text -->
          <div class="absolute bottom-4 left-4 bg-[#e0a92e] text-[#0b0c10] font-mono text-[9px] px-2 py-0.5 uppercase tracking-widest font-bold">
            FOUNDER PORTRAIT // 738677806
          </div>
        </div>
      </div>

      <!-- Quick Actions / Quick Skills -->
      <div class="retro-animate bg-[#0f1115] border-2 border-[#3d3428] p-6 space-y-4">
        <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] border-b border-[#3d3428] pb-2">
          OPERATIONAL CAPABILITIES
        </h4>
        
        <ul class="space-y-3 text-sm font-light text-[#f3efe0]/70">
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#a8201a] flex-shrink-0"></span>
            <span>OS kernel exploits & system reverse engineering</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#a8201a] flex-shrink-0"></span>
            <span>Cloud infrastructure hardening (AWS/GCP/Vercel)</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#a8201a] flex-shrink-0"></span>
            <span>NIST, ISO 27001 GRC & Risk Assessments</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#a8201a] flex-shrink-0"></span>
            <span>Transformer R&D, custom optimizers & quantization</span>
          </li>
        </ul>
      </div>

    </div>

  </div>
</div>
