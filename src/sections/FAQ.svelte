<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  const faqs = [
    {
      question: 'Do we need to be a tech company to work with you?',
      answer: 'Not at all. While many of our clients are tech startups, we work with any business that handles sensitive data or operates across borders. If you have digital assets to protect, we can help.'
    },
    {
      question: 'How fast can we get started?',
      answer: 'Typically, we can begin within 48 hours of our initial call. The roadmap delivery takes 3-5 business days, and implementation can start immediately after that.'
    },
    {
      question: 'Can you help with SOC 2 or ISO 27001?',
      answer: 'Absolutely. We have experience guiding startups through SOC 2 Type I and II, as well as ISO 27001 certification. We focus on practical implementation, not just checkbox compliance.'
    },
    {
      question: "What if we don't have a security team yet?",
      answer: "That's exactly why we're here. Most of our clients are early-stage companies without dedicated security staff. We act as your fractional security team, providing expertise without the full-time hire."
    },
    {
      question: 'Do you handle incident response?',
      answer: 'Yes. All our plans include incident response guidance. Growth and Scale plans include on-call support for active incidents. We help you prepare, detect, and respond effectively.'
    },
    {
      question: 'Is there a long-term contract?',
      answer: 'No. All plans are month-to-month. We believe in earning your business every month. You can upgrade, downgrade, or cancel at any time with 30 days notice.'
    }
  ];

  let sectionRef: HTMLElement;
  let headlineRef: HTMLDivElement;
  let items: HTMLElement[] = [];
  let openIndex = $state<number | null>(null);

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

      // Items animation
      items.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(item,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: i * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  });

  const toggleItem = (index: number) => {
    openIndex = openIndex === index ? null : index;
  };
</script>

<section 
  bind:this={sectionRef} 
  id="faq"
  class="relative bg-black py-24 lg:py-40 border-t border-white/5"
  style="z-index: 70;"
>
  <div class="px-6 sm:px-12 lg:px-[8vw]">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
      <!-- Header -->
      <div bind:this={headlineRef}>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-px bg-accent"></div>
          <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">Support</span>
        </div>
        <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white sticky top-32 leading-tight">
          Frequently asked<br /><span class="text-accent">questions</span>
        </h2>
        <p class="mt-8 text-white/40 text-lg font-light leading-relaxed max-w-sm hidden lg:block">
          Answers to the most common questions about our partnership model and operational security.
        </p>
      </div>

      <!-- Accordion Grid -->
      <div class="flex flex-col gap-4 relative">
        {#each faqs as faq, i}
          <div
            bind:this={items[i]}
            class={cn(
              "group border border-white/5 bg-black/40 backdrop-blur-md transition-all duration-500 rounded-lg overflow-hidden",
              openIndex === i ? "border-accent/40 bg-black/60 shadow-[0_0_20px_rgba(255,45,143,0.05)]" : "hover:border-white/20"
            )}
          >
            <button
              onclick={() => toggleItem(i)}
              class="w-full flex items-center justify-between p-6 lg:p-8 text-left transition-colors duration-300"
            >
              <span class={cn(
                "font-display font-bold text-lg sm:text-xl lg:text-2xl transition-colors duration-300",
                openIndex === i ? "text-accent" : "text-white/80 group-hover:text-white"
              )}>
                {faq.question}
              </span>
              <div class={cn(
                "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-4",
                openIndex === i ? "border-accent bg-accent text-white rotate-180" : "border-white/10 text-white/40 group-hover:border-white/30 group-hover:text-white"
              )}>
                <ChevronDown size={20} />
              </div>
            </button>
            
            <div 
              class={cn(
                "grid transition-all duration-500 ease-in-out",
                openIndex === i ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div class="overflow-hidden">
                <p class="px-6 lg:px-8 text-white/50 text-base lg:text-lg leading-relaxed font-light">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        {/each}

        <!-- Bottom Note -->
        <div class="mt-12 p-6 border border-dashed border-white/10 rounded-lg bg-white/[0.02] flex items-center justify-between gap-6 group/cta">
           <p class="text-white/40 text-sm font-light">
             Can't find what you're looking for?
           </p>
           <button class="text-accent font-mono text-xs uppercase tracking-widest border-b border-accent/20 pb-1 group-hover/cta:border-accent transition-all">
             Contact support
           </button>
        </div>
      </div>
    </div>
  </div>
</section>
