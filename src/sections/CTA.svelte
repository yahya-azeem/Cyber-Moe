<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { ArrowRight, Mail } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let sectionRef: HTMLElement;
  let panelRef: HTMLDivElement;
  let contentRef: HTMLDivElement;
  let imageRef: HTMLDivElement;

  onMount(() => {
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef,
          start: 'top top',
          end: '+=120%',
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

      // Content entrance
      scrollTl.fromTo(contentRef,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
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

      scrollTl.fromTo(contentRef,
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

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };
</script>

<section 
  bind:this={sectionRef} 
  class="section-pinned group/section"
  style="z-index: 80;"
>
  <!-- Background -->
  <div class="absolute inset-0 bg-black"></div>

  <!-- Diagonal Panel -->
  <div 
    bind:this={panelRef}
    class="absolute inset-0 bg-[#070707] clip-diagonal-left transition-colors duration-1000 group-hover/section:bg-[#0a0a0a]"
  ></div>

  <!-- Content -->
  <div class="relative z-10 h-full flex items-center">
    <div class="w-full px-6 sm:px-12 lg:px-[8vw] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
      
      <!-- Text Content -->
      <div bind:this={contentRef}>
         <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-px bg-accent"></div>
          <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">Next Step</span>
        </div>

        <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white mb-8 leading-tight">
          Ready to <br/><span class="text-accent underline decoration-accent/20">Harden</span> your stack?
        </h2>
        
        <p class="text-white/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl font-light">
          Tell me what you're building. I'll share a clear, actionable plan to protect it—no high-pressure pitch, just straight expertise.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-6 items-start">
          <button 
            onclick={scrollToContact}
            class="btn-primary flex items-center justify-center gap-3 py-4 px-10 text-lg group/btn hover:scale-105 transition-all shadow-glow"
          >
            Schedule a call
            <ArrowRight size={22} class="transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>

          <a 
            href="mailto:hello@cybermoe.co"
            class="inline-flex items-center gap-3 text-white/40 hover:text-white transition-all duration-300 py-4 px-2 group/mail"
          >
            <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover/mail:border-accent group-hover/mail:text-accent transition-colors">
              <Mail size={18} />
            </div>
            <span class="text-sm font-light">Or email hello@cybermoe.co</span>
          </a>
        </div>
      </div>

      <!-- Media Area -->
      <div bind:this={imageRef} class="relative">
        <div class="relative aspect-[4/5] max-h-[65vh] border border-white/10 overflow-hidden rounded-sm group/img shadow-2xl">
          <img 
            src="/consulting.jpg" 
            alt="Consultation"
            class="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <!-- Scanline overlay -->
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
        
        <!-- Decorative corner -->
        <div class="absolute -bottom-6 -right-6 w-36 h-36 border-r border-b border-accent/20 transition-all duration-700 group-hover/section:border-accent/50 group-hover/section:w-44 group-hover/section:h-44 pointer-events-none"></div>
      </div>
    </div>
  </div>
</section>
