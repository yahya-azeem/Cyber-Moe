<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Shield, Globe, UserCheck, ArrowRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const services = [
    {
      id: '01',
      title: 'Cybersecurity',
      description: 'Harden systems, reduce attack surface, and respond with confidence.',
      icon: Shield,
      link: '#cybersecurity'
    },
    {
      id: '02',
      title: 'Geopolitics',
      description: 'Map cross-border risks to infrastructure, vendors, and talent.',
      icon: Globe,
      link: '#geopolitics'
    },
    {
      id: '03',
      title: 'vCISO',
      description: 'Fractional security leadership that moves as fast as you do.',
      icon: UserCheck,
      link: '#vciso'
    }
  ];

  let sectionRef: HTMLElement;
  let headlineRef: HTMLHeadingElement;
  let bgRef: HTMLDivElement;
  let cards: HTMLElement[] = [];

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

      // Background
      scrollTl.fromTo(bgRef,
        { scale: 1.08, y: '8vh', opacity: 0.6 },
        { scale: 1, y: 0, opacity: 1, ease: 'none' },
        0
      );

      // Headline
      scrollTl.fromTo(headlineRef,
        { x: '-12vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Cards
      cards.forEach((card, i) => {
        if (!card) return;
        const directions = [
          { x: '-50vw', y: 0 },
          { x: 0, y: '60vh' },
          { x: '50vw', y: 0 }
        ];
        scrollTl.fromTo(card,
          { x: directions[i].x, y: directions[i].y, opacity: 0 },
          { x: 0, y: 0, opacity: 1, ease: 'power2.out' },
          0.05 + i * 0.03
        );
      });

      // EXIT (70-100%)
      scrollTl.fromTo(headlineRef,
        { x: 0, opacity: 1 },
        { x: '-10vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      cards.forEach((card, i) => {
        if (!card) return;
        const exitDirections = [
          { x: '-18vw', y: 0 },
          { x: 0, y: '10vh' },
          { x: '18vw', y: 0 }
        ];
        scrollTl.fromTo(card,
          { x: 0, y: 0, opacity: 1 },
          { x: exitDirections[i].x, y: exitDirections[i].y, opacity: 0, ease: 'power2.in' },
          0.7
        );
      });

      scrollTl.fromTo(bgRef,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, sectionRef);

    return () => ctx.revert();
  });

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };
</script>

<section 
  bind:this={sectionRef} 
  id="services"
  class="section-pinned z-20"
>
  <!-- Background -->
  <div 
    bind:this={bgRef}
    class="absolute inset-0 w-full h-full"
  >
    <img 
      src="/services_city.jpg" 
      alt="City skyline" 
      class="w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-black/75"></div>
  </div>

  <!-- Content -->
  <div class="relative z-10 h-full flex flex-col justify-center px-6 lg:px-[8vw]">
    <!-- Headline -->
    <h2 
      bind:this={headlineRef}
      class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-12 lg:mb-20 tracking-tight"
    >
      What <span class="text-accent">CyberMoe</span> delivers
    </h2>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
      {#each services as service, i}
        <button
          bind:this={cards[i]}
          class="group relative bg-black/40 backdrop-blur-md border border-white/5 p-8 lg:p-10 card-hover text-left flex flex-col items-start overflow-hidden rounded-lg shadow-2xl"
          onclick={() => scrollToSection(service.link)}
        >
          <!-- Accent top border -->
          <div class="absolute top-0 left-0 w-full h-1 bg-accent/20 transition-all duration-500 group-hover:bg-accent/60"></div>

          <!-- Index -->
          <span class="font-mono text-xs text-accent/60 mb-6 block tracking-widest uppercase">
            Phase {service.id}
          </span>

          <!-- Icon -->
          <div class="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-all duration-500 transform group-hover:rotate-6">
            <service.icon size={28} class="text-accent" />
          </div>

          <!-- Title -->
          <h3 class="font-display font-bold text-2xl lg:text-3xl text-white mb-4 leading-tight group-hover:text-accent transition-colors duration-300">
            {service.title}
          </h3>

          <!-- Description -->
          <p class="text-white/50 text-base lg:text-lg mb-8 leading-relaxed font-light">
            {service.description}
          </p>

          <!-- Link -->
          <span class="mt-auto flex items-center gap-2 text-accent text-sm font-semibold tracking-widest uppercase items-center group-hover:gap-4 transition-all duration-500">
            Learn more
            <ArrowRight size={18} />
          </span>

          <!-- Animated BG element -->
          <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        </button>
      {/each}
    </div>
  </div>
</section>
