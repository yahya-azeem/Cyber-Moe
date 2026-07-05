<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { ArrowRight, ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let sectionRef: HTMLElement;
  let panelRef: HTMLDivElement;
  let headlineRef: HTMLHeadingElement;
  let subheadRef: HTMLParagraphElement;
  let ctaRef: HTMLDivElement;
  let labelRef: HTMLSpanElement;
  let bgRef: HTMLDivElement;

  onMount(() => {
    const ctx = gsap.context(() => {
      // Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(bgRef,
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2 }
      );

      tl.fromTo(panelRef,
        { x: '-60vw', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.8'
      );

      tl.fromTo(labelRef,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.4'
      );

      const words = headlineRef.querySelectorAll('.word');
      tl.fromTo(words,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
        '-=0.3'
      );

      tl.fromTo(subheadRef,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      );

      tl.fromTo(ctaRef,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'
      );

      // Scroll-driven Exit Timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            gsap.set([panelRef, headlineRef, subheadRef, ctaRef, labelRef], {
              opacity: 1, x: 0, y: 0
            });
            gsap.set(bgRef, { scale: 1, y: 0 });
          }
        }
      });

      scrollTl.fromTo(headlineRef,
        { x: 0, opacity: 1 },
        { x: '-18vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(subheadRef,
        { x: 0, opacity: 1 },
        { x: '-14vw', opacity: 0, ease: 'power2.in' },
        0.72
      );

      scrollTl.fromTo(ctaRef,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.74
      );

      scrollTl.fromTo(labelRef,
        { x: 0, opacity: 1 },
        { x: '-12vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(panelRef,
        { x: 0, opacity: 1 },
        { x: '-40vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(bgRef,
        { y: 0, scale: 1 },
        { y: '-10vh', scale: 1.06, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  });

  const scrollToServices = () => document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToPricing = () => document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
</script>

<section 
  bind:this={sectionRef} 
  class="section-pinned z-10"
>
  <!-- Background Image -->
  <div 
    bind:this={bgRef}
    class="absolute inset-0 w-full h-full"
  >
    <img 
      src="hero_city.jpg" 
      alt="Cyberpunk city" 
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent lg:via-black/50"></div>
  </div>

  <!-- Diagonal Panel -->
  <div 
    bind:this={panelRef}
    class="absolute inset-0 bg-black/75 lg:bg-black/70 clip-diagonal-left hidden sm:block"
  ></div>
  <div class="absolute inset-0 bg-black/60 sm:hidden"></div>

  <!-- Content -->
  <div class="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-[6vw]">
    <!-- Label -->
    <span 
      bind:this={labelRef}
      class="font-mono text-xs lg:text-sm text-accent uppercase tracking-[0.3em] mb-6 block"
    >
      Startup Security & Geopolitics
    </span>

    <!-- Headline -->
    <h1 
      bind:this={headlineRef}
      class="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.9] max-w-[700px] mb-8"
    >
      <span class="word inline-block">Security,</span>{' '}
      <span class="word inline-block text-gradient">simplified</span>
    </h1>

    <!-- Subheadline -->
    <p 
      bind:this={subheadRef}
      class="text-lg lg:text-xl text-white/70 max-w-[520px] mb-10 leading-relaxed font-light"
    >
      CyberMoe helps early-stage teams harden systems, meet compliance, and navigate 
      geopolitical risk—backed by hands-on engineering capability and research.
    </p>

    <!-- CTAs -->
    <div bind:this={ctaRef} class="flex flex-col sm:flex-row gap-5">
      <button 
        onclick={scrollToContact}
        class="btn-primary flex items-center justify-center gap-3 py-4 px-8 text-lg"
      >
        Book a call
        <ArrowRight size={20} />
      </button>
      <button 
        onclick={scrollToPricing}
        class="px-8 py-4 text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 rounded-md backdrop-blur-sm"
      >
        View subscription
        <ChevronDown size={20} />
      </button>
    </div>
  </div>

  <!-- Decorative line -->
  <div class="absolute left-[52vw] top-[15vh] bottom-[15vh] w-px hairline hidden lg:block"></div>
  
  <!-- Scroll Indicator -->
  <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-float lg:hidden">
    <span class="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
    <ChevronDown size={16} />
  </div>
</section>
