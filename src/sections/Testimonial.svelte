<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Quote, CheckCircle } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const proofPoints = [
    'SOC 2 support',
    'GDPR guidance',
    'Incident response'
  ];

  let sectionRef: HTMLElement;
  let panelRef: HTMLDivElement;
  let quoteRef: HTMLDivElement;
  let imageRef: HTMLDivElement;

  onMount(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Panel entrance
      scrollTl.fromTo(panelRef,
        { x: '-70vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Quote entrance
      scrollTl.fromTo(quoteRef,
        { scale: 0.98, y: '10vh', opacity: 0 },
        { scale: 1, y: 0, opacity: 1, ease: 'power2.out' },
        0.1
      );

      // Image entrance
      scrollTl.fromTo(imageRef,
        { x: '60vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // EXIT (70-100%)
      scrollTl.fromTo(panelRef,
        { x: 0, opacity: 1 },
        { x: '-30vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(quoteRef,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(imageRef,
        { x: 0, opacity: 1 },
        { x: '18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  });
</script>

<section 
  bind:this={sectionRef} 
  class="section-pinned group/section overflow-hidden"
  style="z-index: 40;"
>
  <!-- Background -->
  <div class="absolute inset-0 bg-black"></div>

  <!-- Diagonal Panel -->
  <div 
    bind:this={panelRef}
    class="absolute inset-0 bg-[#080808] clip-diagonal-left transition-colors duration-1000 group-hover/section:bg-[#0a0a0a]"
  ></div>

  <!-- Content -->
  <div class="relative z-10 h-full flex items-center">
    <div class="w-full px-6 sm:px-12 lg:px-[8vw] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
      
      <!-- Narrative Content -->
      <div bind:this={quoteRef} class="flex flex-col">
        <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white mb-10 lg:mb-16 leading-tight">
          Why startups <br/>trust <span class="text-accent">CyberMoe</span>
        </h2>
        
        <!-- Quote Block -->
        <div class="relative mb-10 group/quote">
          <Quote class="absolute -top-6 -left-4 w-16 h-16 text-accent/10 transition-transform duration-500 group-hover/quote:scale-110" />
          <div class="pl-8 border-l-4 border-accent relative">
            <blockquote class="text-2xl lg:text-3xl text-white/90 leading-relaxed font-light italic">
              "We finally have a security plan we can explain to investors—and actually follow day-to-day."
            </blockquote>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="w-10 h-px bg-white/20"></div>
          <p class="text-white/40 font-mono text-xs uppercase tracking-[0.4em]">
            Founder, B2B SaaS
          </p>
        </div>
      </div>

      <!-- Media & Proof Area -->
      <div bind:this={imageRef} class="relative">
        <div class="relative aspect-[4/5] max-h-[65vh] border border-white/10 overflow-hidden rounded-sm group/img shadow-2xl">
          <img 
            src="/team_collab.jpg" 
            alt="Team collaboration"
            class="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          <!-- Scanline overlay -->
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
        
        <!-- Proof points grid -->
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {#each proofPoints as point}
            <div class="flex items-center gap-3 group/point">
              <div class="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center transition-colors duration-300 group-hover/point:bg-accent/30">
                <CheckCircle size={14} class="text-accent" />
              </div>
              <span class="text-white/50 text-xs font-mono uppercase tracking-widest">{point}</span>
            </div>
          {/each}
        </div>

        <!-- Decorative elements -->
        <div class="absolute -bottom-6 -right-6 w-36 h-36 border-r border-b border-accent/20 transition-all duration-700 group-hover/section:border-accent/40 group-hover/section:w-44 group-hover/section:h-44 pointer-events-none"></div>
      </div>
    </div>
  </div>
</section>
