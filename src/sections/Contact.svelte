<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { Mail, MapPin, Clock, Send, Globe, Share2, X } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  let sectionRef: HTMLElement;
  let contentRef: HTMLDivElement;
  let formRef: HTMLFormElement;
  let showDialog = $state(false);
  let formData = $state({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      const fields = formRef.querySelectorAll('.form-field');
      gsap.fromTo(fields,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    showDialog = true;
    formData = { name: '', email: '', company: '', message: '' };
  };
</script>

<section 
  bind:this={sectionRef} 
  id="contact"
  class="relative bg-[#050505] py-24 lg:py-40 border-t border-white/5"
  style="z-index: 90;"
>
  <div class="px-6 sm:px-12 lg:px-[8vw]">
    <div bind:this={contentRef} class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
      
      <!-- Left Column - Contact Info -->
      <div class="flex flex-col">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-px bg-accent"></div>
          <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">Get in touch</span>
        </div>
        <h2 class="font-display font-bold text-5xl lg:text-7xl text-white mb-10 leading-tight">
          Let's secure your <br/><span class="text-accent underline decoration-accent/20">Future.</span>
        </h2>
        
        <div class="space-y-8 mb-12">
          <div class="flex items-start gap-6 group">
            <div class="w-12 h-12 rounded-xl bg-accent/5 border border-white/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-accent/20 group-hover:border-accent/40">
              <Mail size={20} class="text-accent" />
            </div>
            <div>
              <span class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-2">Email protocol</span>
              <a 
                href="mailto:hello@cybermoe.co"
                class="text-xl text-white/90 hover:text-accent font-light transition-all"
              >
                hello@cybermoe.co
              </a>
            </div>
          </div>

          <div class="flex items-start gap-6 group">
            <div class="w-12 h-12 rounded-xl bg-accent/5 border border-white/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-accent/20 group-hover:border-accent/40">
              <MapPin size={20} class="text-accent" />
            </div>
            <div>
              <span class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-2">Base of operations</span>
              <span class="text-xl text-white/90 font-light">Remote / Global (EST Friendly)</span>
            </div>
          </div>

          <div class="flex items-start gap-6 group">
            <div class="w-12 h-12 rounded-xl bg-accent/5 border border-white/5 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-accent/20 group-hover:border-accent/40">
              <Clock size={20} class="text-accent" />
            </div>
            <div>
              <span class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-2">Response latency</span>
              <span class="text-xl text-white/90 font-light">Under 24 hours</span>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="flex gap-4 mt-auto pt-8 border-t border-white/5">
          <a 
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-magenta/10 hover:border-magenta/30 transition-all group"
          >
            <Globe size={22} class="text-white/40 group-hover:text-white transition-colors" />
          </a>
          <a 
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            class="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-magenta/10 hover:border-magenta/30 transition-all group"
          >
            <Share2 size={22} class="text-white/40 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      <!-- Right Column - Form -->
      <form 
        bind:this={formRef} 
        onsubmit={handleSubmit} 
        class="bg-white/[0.02] border border-white/5 p-8 lg:p-12 rounded-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <!-- Subtle background glow -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div class="space-y-6 relative z-10">
          <div class="form-field">
            <label for="name" class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-3">Identity</label>
            <input
              type="text"
              id="name"
              name="name"
              bind:value={formData.name}
              required
              class="w-full bg-black/60 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-300 font-light"
              placeholder="Your name"
            />
          </div>

          <div class="form-field">
            <label for="email" class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-3">Frequency (Email)</label>
            <input
              type="email"
              id="email"
              name="email"
              bind:value={formData.email}
              required
              class="w-full bg-black/60 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-300 font-light"
              placeholder="you@organization.com"
            />
          </div>

          <div class="form-field">
            <label for="company" class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-3">Organization</label>
            <input
              type="text"
              id="company"
              name="company"
              bind:value={formData.company}
              class="w-full bg-black/60 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-300 font-light"
              placeholder="Your company"
            />
          </div>

          <div class="form-field">
            <label for="message" class="text-white/30 text-xs font-mono uppercase tracking-widest block mb-3">Transmission (Message)</label>
            <textarea
              id="message"
              name="message"
              bind:value={formData.message}
              required
              rows={4}
              class="w-full bg-black/60 border border-white/10 rounded-lg px-6 py-4 text-white placeholder:text-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-300 font-light resize-none"
              placeholder="Describe your security requirements..."
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center gap-3 py-5 text-lg font-bold group shadow-glow translate-y-2 hover:translate-y-1 transition-all"
          >
            Initiate Contact
            <Send size={20} class="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <footer class="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <div class="flex items-center gap-4">
        <img 
          src="/logo.png" 
          alt="CyberMoe" 
          class="h-10 lg:h-12 w-auto object-contain brightness-110 drop-shadow-[0_0_10px_rgba(255,45,143,0.3)]"
        />
        <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
        <p class="text-white/20 text-xs font-mono uppercase tracking-widest px-2">
          Secure Operations
        </p>
      </div>
      
      <nav class="flex items-center gap-8">
        <a href="/" class="text-white/30 hover:text-accent text-xs font-mono uppercase tracking-[0.2em] transition-colors">Privacy</a>
        <a href="/" class="text-white/30 hover:text-accent text-xs font-mono uppercase tracking-[0.2em] transition-colors">Terms</a>
        <a href="/" class="text-white/30 hover:text-accent text-xs font-mono uppercase tracking-[0.2em] transition-colors">Security</a>
      </nav>
      
      <div class="text-right">
        <p class="text-white/30 text-xs font-mono uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} CyberMoe. All Rights Reserved.
        </p>
      </div>
    </footer>
  </div>

  <!-- Success Modal -->
  {#if showDialog}
    <div 
      class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-[#0a0a0a] border border-accent/30 p-10 max-w-md w-full rounded-2xl text-center relative group">
        <div class="absolute inset-0 bg-accent/5 blur-3xl rounded-full opacity-50"></div>
        
        <button 
          onclick={() => showDialog = false}
          class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div class="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8 border border-accent/20 group-hover:scale-110 transition-transform duration-500">
          <Send size={32} class="text-accent" />
        </div>

        <h3 class="font-display font-bold text-3xl text-white mb-4 tracking-tight">Transmission Received</h3>
        <p class="text-white/50 text-lg font-light leading-relaxed mb-8">
          Your message has been encrypted and sent to our team. We will respond within the next 24 hours.
        </p>

        <button 
          onclick={() => showDialog = false}
          class="btn-primary px-10 py-3 text-base uppercase tracking-widest"
        >
          Close Session
        </button>
      </div>
    </div>
  {/if}
</section>
