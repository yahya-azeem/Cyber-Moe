<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { Mail, MapPin, Clock, Send, Globe, Share2, X } from 'lucide-svelte';

  let containerRef: HTMLDivElement;
  let formRef: HTMLFormElement;
  let showDialog = $state(false);
  let formData = $state({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const baseUrl = import.meta.env.BASE_URL || '/';

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-animate',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    showDialog = true;
    formData = { name: '', email: '', company: '', message: '' };
  };
</script>

<div bind:this={containerRef} class="py-16 lg:py-24 max-w-[1200px] mx-auto px-6">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
    
    <!-- Left Column - Info (Span 5) -->
    <div class="lg:col-span-5 flex flex-col justify-between space-y-8">
      <div class="space-y-6 contact-animate">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
          <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">Scope Alignment</span>
        </div>
        <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none">
          Initiate <br/><span class="text-[#e0a92e]">Transmission</span>
        </h2>
        
        <p class="text-[#f3efe0]/70 text-base font-light leading-relaxed">
          I don't charge generic consulting rates or force startups into enterprise tiers. Tell me what you're building, your timeline, and your team structure. We'll align on technical security scope first, and discuss flexible fees or pay-later plans once I understand your startup.
        </p>
      </div>

      <div class="space-y-6 contact-animate font-mono text-xs">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 border border-[#3d3428] flex items-center justify-center text-[#e0a92e] flex-shrink-0">
            <Mail size={16} />
          </div>
          <div>
            <span class="text-[#e0a92e] block uppercase tracking-wider mb-1">EMAIL SIGNAL</span>
            <a href="mailto:yahyaazeem44@gmail.com" class="text-white hover:underline text-sm">
              yahyaazeem44@gmail.com
            </a>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 border border-[#3d3428] flex items-center justify-center text-[#e0a92e] flex-shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <span class="text-[#e0a92e] block uppercase tracking-wider mb-1">OPERATIONS HUB</span>
            <span class="text-white text-sm">Remote / Irving, Texas (EST Friendly)</span>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <div class="w-10 h-10 border border-[#3d3428] flex items-center justify-center text-[#e0a92e] flex-shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <span class="text-[#e0a92e] block uppercase tracking-wider mb-1">RESPONSE LATENCY</span>
            <span class="text-white text-sm">Under 12 Hours</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column - Form (Span 7) -->
    <div class="lg:col-span-7 contact-animate">
      <form 
        bind:this={formRef} 
        onsubmit={handleSubmit} 
        class="bg-[#0f1115] border-2 border-[#3d3428] p-8 lg:p-10 bebop-shadow"
      >
        <div class="space-y-6">
          <div>
            <label for="name" class="text-[#e0a92e] text-xs font-mono uppercase tracking-widest block mb-2">// SENDER IDENTITY</label>
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              required
              class="w-full bg-black border-2 border-[#3d3428] focus:border-[#e0a92e] px-4 py-3 text-white placeholder:text-white/20 outline-none transition-colors font-mono text-sm"
              placeholder="Your name"
            />
          </div>

          <div>
            <label for="email" class="text-[#e0a92e] text-xs font-mono uppercase tracking-widest block mb-2">// RETURN FREQUENCY (EMAIL)</label>
            <input
              type="email"
              id="email"
              bind:value={formData.email}
              required
              class="w-full bg-black border-2 border-[#3d3428] focus:border-[#e0a92e] px-4 py-3 text-white placeholder:text-white/20 outline-none transition-colors font-mono text-sm"
              placeholder="you@startup.com"
            />
          </div>

          <div>
            <label for="company" class="text-[#e0a92e] text-xs font-mono uppercase tracking-widest block mb-2">// STARTUP VENTURE</label>
            <input
              type="text"
              id="company"
              bind:value={formData.company}
              class="w-full bg-black border-2 border-[#3d3428] focus:border-[#e0a92e] px-4 py-3 text-white placeholder:text-white/20 outline-none transition-colors font-mono text-sm"
              placeholder="Company name / project stage"
            />
          </div>

          <div>
            <label for="message" class="text-[#e0a92e] text-xs font-mono uppercase tracking-widest block mb-2">// PAYLOAD TRANSMISSION</label>
            <textarea
              id="message"
              bind:value={formData.message}
              required
              rows={4}
              class="w-full bg-black border-2 border-[#3d3428] focus:border-[#e0a92e] px-4 py-3 text-white placeholder:text-white/20 outline-none transition-colors font-mono text-sm resize-none"
              placeholder="Describe your tech stack, security goals, or compliance needs..."
            ></textarea>
          </div>

          <button
            type="submit"
            class="btn-bebop w-full flex items-center justify-center gap-3 py-4 text-base"
          >
            Initiate Secure Transmission
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>

  </div>

  <!-- Footer Block -->
  <footer class="mt-20 pt-8 border-t-2 border-[#3d3428] flex flex-col sm:flex-row justify-between items-center gap-6 font-mono text-[10px] text-white/40">
    <div class="flex items-center gap-4">
      <img 
        src={`${baseUrl}logo.png`}
        alt="CyberMoe" 
        class="h-6 w-auto object-contain brightness-90 filter grayscale"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
      />
      <span>OPERATIONAL ADVISORY // YAHYA</span>
    </div>
    <div class="flex gap-6">
      <a href="/" onclick={(e) => e.preventDefault()} class="hover:text-[#e0a92e] transition-colors">SECURITY</a>
      <a href="/" onclick={(e) => e.preventDefault()} class="hover:text-[#e0a92e] transition-colors">COMPLIANCE</a>
      <a href="/" onclick={(e) => e.preventDefault()} class="hover:text-[#e0a92e] transition-colors">GRC</a>
    </div>
    <div>
      © {new Date().getFullYear()} MUHAMMAD YAHYA AZEEM. ALL RIGHTS RESERVED.
    </div>
  </footer>

  <!-- Dialog box -->
  {#if showDialog}
    <div 
      class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-[#0f1115] border-2 border-[#e0a92e] p-8 max-w-md w-full text-center relative bebop-shadow font-mono">
        <button 
          onclick={() => showDialog = false}
          class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div class="w-16 h-16 border-2 border-[#e0a92e] bg-[#e0a92e]/5 flex items-center justify-center mx-auto mb-6 text-[#e0a92e]">
          <Send size={24} />
        </div>

        <h3 class="text-lg font-bold text-white mb-2 uppercase tracking-wider">TRANSMISSION ENCRYPTED</h3>
        <p class="text-white/60 text-xs leading-relaxed mb-6 font-light">
          Your transmission signal has been encrypted and queue loaded. I will respond to this return address in under 12 hours.
        </p>

        <button 
          onclick={() => showDialog = false}
          class="btn-bebop text-xs py-2 px-8 uppercase"
        >
          CLOSE SESSION
        </button>
      </div>
    </div>
  {/if}
</div>
