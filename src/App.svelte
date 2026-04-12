<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Navigation from './sections/Navigation.svelte';
  import Hero from './sections/Hero.svelte';
  import ServicesOverview from './sections/ServicesOverview.svelte';
  import ServiceDetail from './sections/ServiceDetail.svelte';
  import Testimonial from './sections/Testimonial.svelte';
  import Process from './sections/Process.svelte';
  import Pricing from './sections/Pricing.svelte';
  import FAQ from './sections/FAQ.svelte';
  import CTA from './sections/CTA.svelte';
  import Contact from './sections/Contact.svelte';

  gsap.registerPlugin(ScrollTrigger);

  let mainRef: HTMLDivElement;

  onMount(() => {
    // Global snap for pinned sections
    const setupGlobalSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
            if (!inPinned) return value;
            
            const target = pinnedRanges.reduce((closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: "power2.out"
        }
      });
    };

    // Delay to ensure all ScrollTriggers are created
    const timer = setTimeout(setupGlobalSnap, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  });
</script>

<div bind:this={mainRef} class="relative bg-black text-white overflow-x-hidden">
  <!-- Grain overlay -->
  <div class="grain-overlay"></div>
  
  <!-- Navigation -->
  <Navigation></Navigation>
  
  <!-- Main content -->
  <main class="relative">
    <!-- Section 1: Hero -->
    <Hero></Hero>
    
    <!-- Section 2: Services Overview -->
    <ServicesOverview></ServicesOverview>
    
    <!-- Section 3: Cybersecurity Detail -->
    <ServiceDetail 
      id="cybersecurity"
      title="Cybersecurity"
      description="From first firewall to incident response—practical protection designed for small teams. We prioritize what actually reduces risk, so you don't waste budget on theater."
      cta="Get a security review"
      caption="Penetration testing • Cloud hardening • Policy design"
      image="sec_analyst.jpg"
      layout="left"
    />
    
    <!-- Section 4: Geopolitics Detail -->
    <ServiceDetail 
      id="geopolitics"
      title="Geopolitics"
      description="Sanctions, supply chains, and data sovereignty aren't just headlines—they're operational risks. We translate global events into clear priorities for your business."
      cta="Talk to CyberMoe"
      caption="Risk mapping • Vendor due diligence • Scenario planning"
      image="globe_meeting.jpg"
      layout="right"
    />
    
    <!-- Section 5: vCISO Detail -->
    <ServiceDetail 
      id="vciso"
      title="vCISO Subscription"
      description="Ongoing security leadership without the full-time hire. A predictable monthly engagement that scales as your team and compliance needs evolve."
      cta="View plans"
      caption="Monthly advisory • Roadmaps • Board updates"
      image="vciso_laptop.jpg"
      layout="left"
    />
    
    <!-- Section 6: Testimonial -->
    <Testimonial />
    
    <!-- Section 7: Process -->
    <Process />
    
    <!-- Section 8: Pricing -->
    <Pricing />
    
    <!-- Section 9: FAQ -->
    <FAQ />
    
    <!-- Section 10: CTA -->
    <CTA />
    
    <!-- Section 11: Contact -->
    <Contact />
  </main>
</div>
