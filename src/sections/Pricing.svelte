<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let sectionRef: HTMLElement;
  let headlineRef: HTMLDivElement;
  let cardRef: HTMLDivElement;

  const subscriptionFeatures = [
    'Full vCISO leadership & investor-ready security representation',
    'Custom policy development aligned with NIST & ISO 27001 standards',
    'Active penetration testing & cloud security hardening (AWS/GCP/Vercel)',
    'SOC 2 compliance roadmap & audit preparation support',
    'Geopolitical risk mapping, vendor due diligence & supply chain protection',
    'Dedicated Slack workspace communication with <12 hour response latency',
    'Continuous vulnerability tracking & monthly executive status reporting',
    'Incident response planning, mitigation playbooks & on-call advisory'
  ];

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

      // Card animation (smooth slide up)
      gsap.fromTo(cardRef,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
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
  id="pricing"
  class="relative bg-black py-24 lg:py-40 border-t border-white/5"
  style="z-index: 60;"
>
  <!-- Decorative background glows -->
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,45,143,0.03)_0%,transparent_70%)] pointer-events-none"></div>

  <div class="px-6 sm:px-12 lg:px-[8vw] max-w-[1200px] mx-auto">
    <!-- Header -->
    <div bind:this={headlineRef} class="mb-16 lg:mb-24 text-center">
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="w-8 h-px bg-accent"></div>
        <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">
          Single Subscription
        </span>
        <div class="w-8 h-px bg-accent"></div>
      </div>
      <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white leading-tight">
        All-in-One <span class="text-accent underline decoration-accent/20">Startup Security</span>
      </h2>
      <p class="text-white/50 text-base sm:text-lg max-w-xl mx-auto mt-6 font-light">
        Everything your startup needs to satisfy enterprise customers, hardens your stack, and compliance audit preparation, packaged into a single monthly plan.
      </p>
    </div>

    <!-- Pricing Card -->
    <div 
      bind:this={cardRef}
      class="relative bg-[#050505] border border-accent/30 p-8 lg:p-14 transition-all duration-500 rounded-2xl overflow-hidden max-w-4xl mx-auto shadow-[0_20px_60px_rgba(255,45,143,0.08)] group"
    >
      <!-- Preferred choice corner tag -->
      <div class="absolute -top-px left-1/2 -translate-x-1/2">
        <span class="bg-accent text-white text-[10px] font-mono uppercase tracking-[0.2em] px-5 py-2 rounded-b-lg flex items-center gap-2 shadow-lg animate-pulse-glow">
          <Sparkles size={12} />
          Active Security Subscription
        </span>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        <!-- Left Side: Subscription pricing and highlights (Span 5) -->
        <div class="md:col-span-5 flex flex-col justify-center text-center md:text-left h-full">
          <span class="font-mono text-xs text-white/40 uppercase tracking-[0.3em] mb-4 block">
            Startup Security operations
          </span>
          
          <div class="space-y-1 mb-6">
            <div class="text-accent text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
              First Month Fully Trialed
            </div>
            <div class="flex items-baseline justify-center md:justify-start gap-2">
              <span class="font-display font-bold text-5xl lg:text-6xl text-white tracking-tighter">
                $1,250
              </span>
              <span class="text-white/30 text-base font-light font-mono">/mo</span>
            </div>
          </div>

          <p class="text-white/60 text-sm lg:text-base mb-8 font-light leading-relaxed">
            Ongoing security operations, compliance direction, and offensive security capabilities. One subscription, zero friction. Cancel anytime.
          </p>

          <button 
            onclick={scrollToContact}
            class="w-full py-4 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 bg-accent text-white shadow-glow hover:scale-[1.02] hover:bg-magenta/90"
          >
            Deploy Subscription
            <ArrowRight size={18} />
          </button>
        </div>

        <!-- Divider for desktop -->
        <div class="hidden md:block md:col-span-1 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        <!-- Right Side: Features List (Span 6) -->
        <div class="md:col-span-6 space-y-6">
          <h4 class="font-mono text-xs text-white/40 uppercase tracking-[0.2em]">
            Subscription Payload Includes:
          </h4>
          <ul class="space-y-4">
            {#each subscriptionFeatures as feature}
              <li class="flex items-start gap-4 group/item">
                <div class="mt-1 w-5 h-5 rounded-full bg-accent/5 flex items-center justify-center flex-shrink-0">
                  <Check size={12} class="text-accent" />
                </div>
                <span class="text-white/70 text-sm lg:text-base font-light transition-colors group-hover/item:text-white">{feature}</span>
              </li>
            {/each}
          </ul>
        </div>

      </div>

    </div>

    <!-- Assurance -->
    <div class="mt-16 text-center space-y-4">
      <p class="text-white/20 text-xs font-mono uppercase tracking-[0.3em]">
        Operational Standard
      </p>
      <p class="text-white/40 text-sm max-w-xl mx-auto leading-relaxed italic">
        "Your first month is a fully functional test period. Evaluate our reports, communications, and configurations. You only pay if you decide to keep running our security operations program."
      </p>
    </div>
  </div>
</section>
