<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { Shield, Globe, UserCheck, ArrowRight, Server, Landmark } from 'lucide-svelte';

  let containerRef: HTMLDivElement;
  const baseUrl = import.meta.env.BASE_URL || '/';

  const pillars = [
    {
      title: 'Technical Hardening & Offensive Ops',
      description: 'Active penetration testing, source code audits, and cloud infrastructure hardening (AWS/GCP/Vercel). We build and run systems virtualizations to discover kernel-level exploits before attackers do.',
      caption: 'Cloud security • Exploit testing • Kernel auditing',
      icon: Server
    },
    {
      title: 'vCISO Advisory & Compliance GRC',
      description: 'Fractional security leadership to guide your startup through vendor checks, SOC 2 audits, and investor due diligence. We design custom security policies aligned with NIST and ISO 27001 standards.',
      caption: 'SOC 2 readiness • NIST assessments • GRC roadmaps',
      icon: UserCheck
    },
    {
      title: 'Geopolitical Supply Chain Risk Mapping',
      description: 'Translating global events and regulations into startup priorities. We map cross-border dependencies, audit vendor risks, and design data residency controls to protect against supply-chain disruption.',
      caption: 'Vendor due diligence • Data sovereignty • Supply chain GRC',
      icon: Globe
    }
  ];

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pillar-card',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  });

  const dispatch = (tabName: string) => {
    const event = new CustomEvent('switchtab', { detail: tabName });
    window.dispatchEvent(event);
  };
</script>

<div bind:this={containerRef} class="py-16 lg:py-24 max-w-[1200px] mx-auto px-6">
  <!-- Section Header -->
  <div class="mb-16">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
      <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">Operations payload // unified</span>
    </div>
    <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
      Cybersecurity <span class="text-[#e0a92e]">Operations & Risk</span>
    </h2>
    <p class="text-white/60 text-sm sm:text-base max-w-2xl mt-4 font-light leading-relaxed">
      A single, comprehensive cybersecurity framework for early-stage ventures. We combine deep technical exploit research with compliance GRC and global risk mapping.
    </p>
  </div>

  <!-- Unified Pillars Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
    {#each pillars as pillar, idx}
      <div class="bebop-card flex flex-col p-8 group relative overflow-hidden pillar-card">
        <!-- Index marker -->
        <span class="font-mono text-xs text-[#e0a92e]/60 mb-6 block tracking-widest uppercase">
          CAPABILITY // 0{idx + 1}
        </span>

        <!-- Icon box -->
        <div class="w-14 h-14 bg-[#e0a92e]/5 border border-[#3d3428] group-hover:border-[#e0a92e] flex items-center justify-center mb-6 transition-all duration-300">
          <pillar.icon size={26} class="text-[#e0a92e]" />
        </div>

        <!-- Title -->
        <h3 class="font-display font-bold text-xl text-white mb-4 uppercase tracking-tight group-hover:text-[#e0a92e] transition-colors duration-300">
          {pillar.title}
        </h3>

        <!-- Description -->
        <p class="text-[#f3efe0]/70 text-sm font-light leading-relaxed mb-6 flex-grow">
          {pillar.description}
        </p>

        <!-- Technical Scope -->
        <div class="mt-auto pt-6 border-t border-[#3d3428] font-mono text-[9px] text-[#e0a92e]/60 uppercase tracking-widest">
          {pillar.caption}
        </div>
      </div>
    {/each}
  </div>

  <!-- Call to action block -->
  <div class="mt-16 bg-[#0f1115] border-2 border-[#a8201a] p-8 bebop-shadow-red flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="space-y-2 max-w-xl">
      <h4 class="font-display font-bold text-xl uppercase tracking-tight">Flexible Scope & Startups First</h4>
      <p class="text-white/60 text-sm font-light">
        No corporate packages or boilerplate consulting tiers. We audit your stack, map out your vendor risks, and discuss a flexible fee structure once we know what your startup is building.
      </p>
    </div>
    <button 
      onclick={() => dispatch('contact')}
      class="btn-bebop-red whitespace-nowrap"
    >
      Initiate Scope Chat
      <ArrowRight class="inline ml-1" size={16} />
    </button>
  </div>
</div>
