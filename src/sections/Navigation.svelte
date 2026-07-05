<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, X } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let isScrolled = $state(false);
  let isMobileMenuOpen = $state(false);
  let isNavHidden = $state(false);
  let lastScrollY = $state(0);

  onMount(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      isScrolled = currentScrollY > 50;
      
      if (currentScrollY > window.innerHeight * 0.8) {
        if (currentScrollY > lastScrollY && !isMobileMenuOpen) {
          isNavHidden = true;
        } else {
          isNavHidden = false;
        }
      } else {
        isNavHidden = false;
      }
      
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Subscription', href: '#pricing' },
    { label: 'Process', href: '#process' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    isMobileMenuOpen = false;
  };

  const scrollToTop = (e: MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
</script>

<nav 
  class={cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform",
    isScrolled 
      ? "bg-black/90 backdrop-blur-md border-b border-white/10 py-1" 
      : "bg-transparent py-3",
    isNavHidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
  )}
>
  <div class="w-full px-6 lg:px-12">
    <div class="flex items-center justify-between h-14 lg:h-18">
      <!-- Logo -->
      <a 
        href="/" 
        onclick={scrollToTop}
        class="flex items-center gap-3 group"
      >
        <div class="relative">
          <img 
            src="logo.png" 
            alt="CyberMoe" 
            class="h-8 lg:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <!-- Subtle glow to make it more visible -->
          <div class="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </a>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center gap-10">
        {#each navLinks as link}
          <button
            onclick={() => scrollToSection(link.href)}
            class="text-sm text-white/70 hover:text-white transition-colors duration-300 font-mono uppercase tracking-widest relative group"
          >
            {link.label}
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full"></span>
          </button>
        {/each}
      </div>

      <!-- CTA Button -->
      <div class="hidden lg:block">
        <button 
          onclick={() => scrollToSection('#contact')}
          class="btn-primary text-sm tracking-wider uppercase font-mono"
        >
          Book a free call
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button
        onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
        class="lg:hidden p-2 text-white hover:text-accent transition-colors duration-300"
        aria-label="Toggle menu"
      >
        {#if isMobileMenuOpen}
          <X size={28} />
        {:else}
          <Menu size={28} />
        {/if}
      </button>
    </div>
  </div>
</nav>

<!-- Mobile Menu -->
<div 
  class={cn(
    "fixed inset-0 z-40 bg-black/98 backdrop-blur-2xl transition-all duration-500 lg:hidden flex flex-col items-center justify-center gap-10",
    isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
  )}
>
  {#each navLinks as link}
    <button
      onclick={() => scrollToSection(link.href)}
      class="text-3xl text-white/80 hover:text-accent transition-all duration-300 font-display font-bold tracking-tight"
    >
      {link.label}
    </button>
  {/each}
  <button 
    onclick={() => scrollToSection('#contact')}
    class="btn-primary mt-6 text-lg px-10 py-4 shadow-glow animate-pulse-glow"
  >
    Book a free call
  </button>
</div>
