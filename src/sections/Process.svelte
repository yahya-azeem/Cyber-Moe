<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Phone, Map, Zap, Shield } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const steps = [
    {
      id: '01',
      title: 'Book a free call',
      description: 'Share your stack, risks, and goals.',
      icon: Phone
    },
    {
      id: '02',
      title: 'Get a roadmap',
      description: 'Prioritized fixes aligned to your budget.',
      icon: Map
    },
    {
      id: '03',
      title: 'Implement fast',
      description: 'Hands-on help or clear guides—your choice.',
      icon: Zap
    },
    {
      id: '04',
      title: 'Stay protected',
      description: 'Ongoing checks, updates, and support.',
      icon: Shield
    }
  ];

  let sectionRef: HTMLElement;
  let headlineRef: HTMLHeadingElement;
  let timelineRef: HTMLDivElement;
  let bgRef: HTMLDivElement;
  let cards: HTMLElement[] = [];

  onMount(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Background
      scrollTl.fromTo(bgRef,
        { scale: 1.05, opacity: 0.7 },
        { scale: 1, opacity: 1, ease: 'none' },
        0
      );

      // Headline
      scrollTl.fromTo(headlineRef,
        { y: '8vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Timeline line
      scrollTl.fromTo(timelineRef,
        { scaleX: 0 },
        { scaleX: 1, ease: 'power2.out' },
        0.1
      );

      // Cards
      cards.forEach((card, i) => {
        if (!card) return;
        scrollTl.fromTo(card,
          { y: '40vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out' },
          0.14 + i * 0.04
        );
      });

      // EXIT (70-100%)
      scrollTl.fromTo(headlineRef,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      cards.forEach((card) => {
        if (!card) return;
        scrollTl.fromTo(card,
          { y: 0, opacity: 1 },
          { y: '12vh', opacity: 0, ease: 'power2.in' },
          0.7
        );
      });

      scrollTl.fromTo(timelineRef,
        { scaleX: 1, opacity: 1 },
        { scaleX: 0, opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  });
</script>

<section 
  bind:this={sectionRef} 
  id="process"
  class="section-pinned group/section"
  style="z-index: 50;"
>
  <!-- Background -->
  <div 
    bind:this={bgRef}
    class="absolute inset-0 w-full h-full"
  >
    <img 
      src="/hero_city.jpg" 
      alt="City background" 
      class="w-full h-full object-cover opacity-20"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-[8vw]">
    <!-- Label -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-px bg-accent"></div>
      <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">
        Our Process
      </span>
    </div>

    <!-- Headline -->
    <h2 
      bind:this={headlineRef}
      class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white mb-16 lg:mb-24 leading-tight"
    >
      From chaos to <br/><span class="text-accent">Compliance</span>
    </h2>

    <!-- Timeline Wrapper -->
    <div class="relative">
      <!-- Horizontal Line (Desktop) -->
      <div 
        bind:this={timelineRef}
        class="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 origin-left hidden lg:block"
      ></div>

      <!-- Vertical Line (Mobile) -->
      <div class="absolute left-10 top-0 bottom-0 w-px bg-accent/20 lg:hidden"></div>

      <!-- Steps Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
        {#each steps as step, i}
          <div
            bind:this={cards[i]}
            class="relative flex flex-col group/step"
          >
            <!-- Step icon/number -->
            <div class="w-20 h-20 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover/step:border-accent/40 group-hover/step:shadow-[0_0_30px_rgba(255,45,143,0.15)] group-hover/step:-translate-y-2">
              <step.icon size={32} class="text-accent" />
              <div class="absolute -top-3 -right-3 font-mono text-xs text-accent/40 bg-black px-2 py-1 border border-white/5 rounded">
                {step.id}
              </div>
            </div>

            <!-- Content Card -->
            <div class="bg-black/40 backdrop-blur-md border border-white/5 p-8 rounded-lg group-hover/step:bg-black/60 transition-colors duration-500">
              <h3 class="font-display font-bold text-xl lg:text-2xl text-white mb-4 group-hover/step:text-accent transition-colors duration-300">
                {step.title}
              </h3>
              <p class="text-white/50 text-base leading-relaxed font-light">
                {step.description}
              </p>
            </div>
            
            <!-- Connection indicator (Mobile) -->
            <div class="absolute left-10 top-20 w-px h-12 bg-accent/20 -translate-x-1/2 lg:hidden"></div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
