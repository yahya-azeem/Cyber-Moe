<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { ArrowRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    id: string;
    title: string;
    description: string;
    cta: string;
    caption: string;
    image: string;
    layout: 'left' | 'right';
  }

  let { id, title, description, cta, caption, image, layout }: Props = $props();

  let sectionRef: HTMLElement;
  let panelRef: HTMLDivElement;
  let contentRef: HTMLDivElement;
  let imageRef: HTMLDivElement;

  const isLeft = $derived(layout === 'left');

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
      const panelFrom = isLeft ? '-70vw' : '70vw';
      scrollTl.fromTo(panelRef,
        { x: panelFrom, opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Content entrance
      scrollTl.fromTo(contentRef,
        { y: '14vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.06
      );

      // Image entrance
      const imageFrom = isLeft ? '60vw' : '-60vw';
      scrollTl.fromTo(imageRef,
        { x: imageFrom, opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // EXIT (70-100%)
      const panelExit = isLeft ? '-30vw' : '30vw';
      scrollTl.fromTo(panelRef,
        { x: 0, opacity: 1 },
        { x: panelExit, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(contentRef,
        { y: 0, opacity: 1 },
        { y: '10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      const imageExit = isLeft ? '18vw' : '-18vw';
      scrollTl.fromTo(imageRef,
        { x: 0, opacity: 1 },
        { x: imageExit, opacity: 0, ease: 'power2.in' },
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
  {id}
  class="section-pinned group/section"
  style="z-index: 30;"
>
  <!-- Background -->
  <div class="absolute inset-0 bg-black"></div>

  <!-- Diagonal Panel -->
  <div 
    bind:this={panelRef}
    class={cn(
      "absolute inset-0 bg-[#070707] transition-colors duration-1000 group-hover/section:bg-[#0a0a0a]",
      isLeft ? 'clip-diagonal-left' : 'clip-diagonal-right'
    )}
  ></div>

  <!-- Content -->
  <div class="relative z-10 h-full flex items-center">
    <div class={cn(
      "w-full px-6 sm:px-12 lg:px-[8vw] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center",
      !isLeft && "lg:grid-flow-dense"
    )}>
      
      <!-- Text Content -->
      <div 
        bind:this={contentRef}
        class={cn(!isLeft && "lg:col-start-2")}
      >
        <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-8 leading-tight">
          {title}
        </h2>
        
        <p class="text-white/60 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl font-light">
          {description}
        </p>
        
        <button 
          onclick={scrollToContact}
          class="btn-primary flex items-center gap-3 py-4 px-8 text-lg group"
        >
          {cta}
          <ArrowRight size={20} class="transition-transform duration-300 group-hover:translate-x-1" />
        </button>

        <div class="mt-12 pt-8 border-t border-white/5">
          <p class="font-mono text-xs text-accent/50 uppercase tracking-[0.3em]">
            {caption}
          </p>
        </div>
      </div>

      <!-- Image Area -->
      <div 
        bind:this={imageRef}
        class={cn("relative", isLeft ? "lg:col-start-2" : "lg:col-start-1 lg:row-start-1")}
      >
        <div class="relative aspect-[4/5] max-h-[65vh] border border-white/10 overflow-hidden rounded-sm group/img">
          <img 
            src={image} 
            alt={title}
            class="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          
          <!-- Scanline effect overlay -->
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
        
        <!-- Decorative corner -->
        <div class={cn(
          "absolute -bottom-6 w-32 h-32 border-accent/20 transition-all duration-700 group-hover/section:border-accent/40 group-hover/section:w-40 group-hover/section:h-40 pointer-events-none",
          isLeft ? "-right-6 border-r border-b" : "-left-6 border-l border-b"
        )}></div>
      </div>
    </div>
  </div>
</section>
