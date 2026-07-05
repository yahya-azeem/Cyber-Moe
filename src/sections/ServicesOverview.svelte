<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { Shield, Globe, UserCheck, ArrowRight } from 'lucide-svelte';

  let containerRef: HTMLDivElement;
  const baseUrl = import.meta.env.BASE_URL || '/';

  const services = [
    {
      id: '01',
      title: 'Cybersecurity Operations',
      description: 'Practical, technical protection designed for early-stage teams. Active penetration testing, cloud environment hardening, and vulnerability mitigation to block actual threats—not theater.',
      caption: 'Penetration testing • Cloud hardening • Policy design',
      image: `${baseUrl}sec_analyst.jpg`,
      icon: Shield
    },
    {
      id: '02',
      title: 'Geopolitical Risk Mapping',
      description: 'Mapping international risks to your codebase, operations, and suppliers. We assess cross-border data sovereignty, vendor integrity, and supply chain threats to keep you ahead of regulatory sanctions.',
      caption: 'Risk mapping • Vendor due diligence • Scenario planning',
      image: `${baseUrl}globe_meeting.jpg`,
      icon: Globe
    },
    {
      id: '03',
      title: 'vCISO Security Advisory',
      description: 'Factional security leadership that fits your speed. We build compliance programs (SOC 2, ISO 27001) that investors respect, and act as your dedicated security lead during high-stakes deals.',
      caption: 'Roadmaps • Board updates • Investor due diligence',
      image: `${baseUrl}vciso_laptop.jpg`,
      icon: UserCheck
    }
  ];

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.service-card',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  });

  const dispatch = (tabName: string) => {
    // Send event to switch tab
    const event = new CustomEvent('switchtab', { detail: tabName });
    window.dispatchEvent(event);
  };
</script>

<div bind:this={containerRef} class="py-16 lg:py-24 max-w-[1200px] mx-auto px-6">
  <!-- Section Header -->
  <div class="mb-16">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
      <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">Operations Payload</span>
    </div>
    <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
      Offensive & <span class="text-[#e0a92e]">Advisory Services</span>
    </h2>
  </div>

  <!-- Services Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
    {#each services as service}
      <div class="bebop-card flex flex-col p-8 group relative overflow-hidden">
        <!-- Index marker -->
        <span class="font-mono text-xs text-[#e0a92e]/60 mb-6 block tracking-widest uppercase">
          PHASE // {service.id}
        </span>

        <!-- Icon box -->
        <div class="w-14 h-14 bg-[#e0a92e]/5 border border-[#3d3428] group-hover:border-[#e0a92e] flex items-center justify-center mb-6 transition-all duration-300">
          <service.icon size={26} class="text-[#e0a92e]" />
        </div>

        <!-- Title -->
        <h3 class="font-display font-bold text-2xl text-white mb-4 uppercase tracking-tight group-hover:text-[#e0a92e] transition-colors duration-300">
          {service.title}
        </h3>

        <!-- Description -->
        <p class="text-[#f3efe0]/70 text-sm font-light leading-relaxed mb-6 flex-grow">
          {service.description}
        </p>

        <!-- Technical Scope -->
        <div class="mt-auto pt-6 border-t border-[#3d3428] font-mono text-[10px] text-[#e0a92e]/60 uppercase tracking-widest">
          {service.caption}
        </div>
      </div>
    {/each}
  </div>

  <!-- Call to action block -->
  <div class="mt-16 bg-[#0f1115] border-2 border-[#a8201a] p-8 bebop-shadow-red flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="space-y-2 max-w-xl">
      <h4 class="font-display font-bold text-xl uppercase tracking-tight">Flexible Scope & Startups First</h4>
      <p class="text-white/60 text-sm font-light">
        No boilerplate billing tiers. We learn your codebase, analyze risk, and discuss a flexible fee structure once we know what your startup is building.
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
