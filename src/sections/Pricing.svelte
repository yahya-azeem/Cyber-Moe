<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Check, ArrowRight, Sparkles } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const tiers = [
    {
      name: 'Starter',
      price: '$500',
      period: '/mo',
      description: 'Essential security hygiene for small teams.',
      features: [
        'Monthly check-in call',
        'Security policy templates',
        'Email support',
        'Basic risk assessment',
        'Vendor security review (1/mo)',
        'Incident response guidance'
      ],
      cta: 'Get started',
      highlighted: false
    },
    {
      name: 'Growth',
      price: '$1,000',
      period: '/mo',
      description: 'More coverage, faster response, deeper roadmaps.',
      features: [
        'Bi-weekly check-in calls',
        'Custom policy development',
        'Priority Slack + Email support',
        'Comprehensive risk assessment',
        'Vendor security review (3/mo)',
        'On-demand advisory calls',
        'Compliance roadmap',
        'Monthly security report'
      ],
      cta: 'Most popular',
      highlighted: true
    },
    {
      name: 'Scale',
      price: '$1,500',
      period: '/mo',
      description: 'Hands-on support for teams with compliance deadlines.',
      features: [
        'Weekly check-in calls',
        'Full vCISO function',
        'Dedicated Slack channel',
        'Continuous risk monitoring',
        'Unlimited vendor reviews',
        'Unlimited on-demand calls',
        'Full compliance program',
        'Board-ready updates',
        'Incident response on-call'
      ],
      cta: 'Contact us',
      highlighted: false
    }
  ];

  let sectionRef: HTMLElement;
  let headlineRef: HTMLDivElement;
  let cards: HTMLElement[] = [];

  onMount(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(headlineRef,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headlineRef,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards animation
      cards.forEach((card, i) => {
        if (!card) return;
        const directions = [
          { x: -60, y: 0 },
          { x: 0, y: 40 },
          { x: 60, y: 0 }
        ];
        
        gsap.fromTo(card,
          { x: directions[i].x, y: directions[i].y, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  });

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };
</script>

<section 
  bind:this={sectionRef} 
  id="pricing"
  class="relative bg-black py-24 lg:py-40"
  style="z-index: 60;"
>
  <div class="px-6 sm:px-12 lg:px-[8vw]">
    <!-- Header -->
    <div bind:this={headlineRef} class="mb-16 lg:mb-24">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-8 h-px bg-accent"></div>
        <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">
          Flexible Plans
        </span>
      </div>
      <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white max-w-3xl leading-tight">
        Pricing that respects <br/><span class="text-accent underline decoration-accent/20">startup budgets</span>
      </h2>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch">
      {#each tiers as tier, i}
        <div
          bind:this={cards[i]}
          class={cn(
            "relative flex flex-col p-8 lg:p-10 transition-all duration-500 rounded-xl overflow-hidden group",
            tier.highlighted 
              ? "bg-gradient-to-b from-accent/10 via-black to-black border-accent/40 md:-mt-6 md:mb-6 shadow-[0_20px_60px_rgba(255,45,143,0.1)]" 
              : "bg-[#050505] border-white/5 hover:border-white/10"
          )}
          style="border-width: 1px;"
        >
          <!-- Highlighted badge -->
          {#if tier.highlighted}
            <div class="absolute -top-px left-1/2 -translate-x-1/2">
              <span class="bg-accent text-white text-[10px] font-mono uppercase tracking-[0.2em] px-4 py-1.5 rounded-b-lg flex items-center gap-2 shadow-lg">
                <Sparkles size={12} />
                Preferred Choice
              </span>
            </div>
          {/if}

          <!-- Tier name -->
          <span class="font-mono text-xs text-white/40 uppercase tracking-[0.3em] mb-6 block">
            {tier.name}
          </span>

          <!-- Price -->
          <div class="flex items-baseline gap-2 mb-6">
            <span class="font-display font-bold text-5xl lg:text-6xl text-white tracking-tighter">
              {tier.price}
            </span>
            <span class="text-white/30 text-base font-light font-mono">{tier.period}</span>
          </div>

          <!-- Description -->
          <p class="text-white/50 text-base lg:text-lg mb-10 min-h-[3rem] font-light leading-relaxed">
            {tier.description}
          </p>

          <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10"></div>

          <!-- Features -->
          <ul class="space-y-4 mb-12 flex-grow">
            {#each tier.features as feature}
              <li class="flex items-start gap-4 group/item">
                <div class="mt-1 w-5 h-5 rounded-full bg-accent/5 flex items-center justify-center transition-colors group-hover/item:bg-accent/20">
                  <Check size={14} class="text-accent" />
                </div>
                <span class="text-white/60 text-sm lg:text-base font-light transition-colors group-hover/item:text-white/90">{feature}</span>
              </li>
            {/each}
          </ul>

          <!-- CTA -->
          <button 
            onclick={scrollToContact}
            class={cn(
              "w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-500",
              tier.highlighted
                ? "bg-accent text-white shadow-glow hover:scale-[1.02]"
                : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {tier.cta}
            <ArrowRight size={18} class="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      {/each}
    </div>

    <!-- Assurance -->
    <div class="mt-16 text-center space-y-4">
      <p class="text-white/20 text-xs font-mono uppercase tracking-[0.3em]">
        Standard Assurance Protocol
      </p>
      <p class="text-white/40 text-sm max-w-xl mx-auto leading-relaxed italic">
        "All engagements include a 14-day satisfaction guarantee. We prioritize operational continuity and zero-friction integration."
      </p>
    </div>
  </div>
</section>
