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

  const dispatch = (tabName: string) => {
    const event = new CustomEvent('switchtab', { detail: tabName });
    window.dispatchEvent(event);
  };
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
          Unlike corporate security consultants who deliver boilerplate PDF checklists, I help early-stage startup teams actively secure codebases, harden cloud layers, and map out vendor/supply-chain risk. If you are building high-performance or high-risk tech, I ensure it is protected from day one.
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

  <!-- Featured Projects Section -->
  <div class="mt-16 pt-12 border-t-2 border-[#3d3428] space-y-8">
    <div class="retro-animate flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
        <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">// FEATURED CODE BASES</span>
      </div>
      <button 
        onclick={() => dispatch('resume')} 
        class="text-xs font-mono text-[#e0a92e] hover:underline uppercase text-left"
      >
        View Full Capabilities & Diagnostics →
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- ShadPS5 Emulator -->
      <div class="bebop-card p-6 flex flex-col justify-between h-full relative group">
        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <span class="font-mono text-[10px] text-[#a8201a] uppercase font-bold tracking-wider">// SYSTEM EMULATION</span>
            <a href="https://github.com/yahya-azeem/ShadPS5" target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="ShadPS5 Repository">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
          <h3 class="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#e0a92e] transition-colors">ShadPS5 PS5 Emulator</h3>
          <p class="text-white/60 text-xs font-light leading-relaxed">
            Engineered the ELF/SELF loader & linker in Rust translating 200+ Cryptographic Name Identifiers (NIDs) to link guest library imports. Built a translation engine mapping PS5 guest shader instructions to host Vulkan SPIR-V bytecode to render 3D geometry.
          </p>
        </div>
        <div class="mt-6 flex flex-wrap gap-1.5 font-mono text-[9px] text-[#e0a92e]">
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">RUST</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">VULKAN 1.3</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">ASH</span>
        </div>
      </div>

      <!-- Project Golf Ball -->
      <div class="bebop-card p-6 flex flex-col justify-between h-full relative group">
        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <span class="font-mono text-[10px] text-[#a8201a] uppercase font-bold tracking-wider">// DEEP LEARNING</span>
            <a href="https://github.com/yahya-azeem/Project-Golf-Ball" target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="Project Golf Ball Repository">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
          <h3 class="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#e0a92e] transition-colors">Project Golf Ball</h3>
          <p class="text-white/60 text-xs font-light leading-relaxed">
            Designed an 11-layer Transformer language model (512-dim embeddings) trained on 100M+ FineWeb tokens. Engineered optimization passes to strictly fit the model within a 16MB file artifact limit.
          </p>
        </div>
        <div class="mt-6 flex flex-wrap gap-1.5 font-mono text-[9px] text-[#e0a92e]">
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">PYTHON</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">PYTORCH</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">CUDA</span>
        </div>
      </div>

      <!-- Polymarket Copytrade Bot -->
      <div class="bebop-card p-6 flex flex-col justify-between h-full relative group">
        <div class="space-y-4">
          <div class="flex justify-between items-start">
            <span class="font-mono text-[10px] text-[#a8201a] uppercase font-bold tracking-wider">// NETWORK / ALGORITHMIC</span>
            <a href="https://github.com/yahya-azeem/polymarket-copy-bot-rust" target="_blank" rel="noopener noreferrer" class="text-white/40 hover:text-white transition-colors" aria-label="Polymarket Copy Bot Repository">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
          <h3 class="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#e0a92e] transition-colors">Polymarket Copytrade Bot</h3>
          <p class="text-white/60 text-xs font-light leading-relaxed">
            Asynchronous order copying system mirror trade signals with sub-5ms execution latency using Rust, Tokio WebSockets, and Polymarket CLOB. Integrated daily drawdown guards to protect trading assets.
          </p>
        </div>
        <div class="mt-6 flex flex-wrap gap-1.5 font-mono text-[9px] text-[#e0a92e]">
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">RUST</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">TOKIO</span>
          <span class="px-2 py-0.5 bg-[#e0a92e]/5 border border-[#3d3428] rounded">WEBSOCKETS</span>
        </div>
      </div>
    </div>
  </div>
</div>
