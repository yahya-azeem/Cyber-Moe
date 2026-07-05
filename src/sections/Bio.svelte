<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ExternalLink, GitCommit, Code } from 'lucide-svelte';
  import { parseResume, type ResumeData } from '../lib/resumeParser';
  import { fetchUserEvents, type GitHubEvent } from '../lib/github';

  let containerRef = $state<HTMLDivElement>();
  let resumeData = $state<ResumeData | null>(null);
  let events = $state<GitHubEvent[]>([]);
  let isLoading = $state(true);
  let isLoadingEvents = $state(true);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const aboutMeImg = `${baseUrl}about_me.png`;
  const resumeUrl = `${baseUrl}resume.tex`;

  onMount(() => {
    // Entrance animations
    const ctx = gsap.context(() => {
      gsap.fromTo('.retro-animate',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);

    // Fetch dynamic content in IIFE
    (async () => {
      try {
        const response = await fetch(resumeUrl);
        if (response.ok) {
          const texText = await response.text();
          resumeData = parseResume(texText);
        }
        isLoading = false;
      } catch (e) {
        console.error(e);
        isLoading = false;
      }

      try {
        const userEvents = await fetchUserEvents();
        events = userEvents.slice(0, 5);
        isLoadingEvents = false;
      } catch (e) {
        console.error(e);
        isLoadingEvents = false;
      }
    })();

    return () => ctx.revert();
  });

  const dispatch = (tabName: string) => {
    const event = new CustomEvent('switchtab', { detail: tabName });
    window.dispatchEvent(event);
  };

  // Helper to format event names into readable Bebop logs
  function formatBebopEvent(event: GitHubEvent): string {
    const time = new Date(event.created_at).toLocaleDateString();
    const repoName = event.repo.name.replace('yahya-azeem/', '');
    
    switch (event.type) {
      case 'PushEvent':
        return `[${time}] PUSHED COMMITS TO // ${repoName}`;
      case 'CreateEvent':
        return `[${time}] CREATED REPOSITORY // ${repoName}`;
      case 'WatchEvent':
        return `[${time}] STARRED ARCHIVE // ${repoName}`;
      case 'ForkEvent':
        return `[${time}] FORKED SOURCE // ${repoName}`;
      default:
        return `[${time}] UPDATED LOG // ${repoName}`;
    }
  }
</script>

<div bind:this={containerRef} class="py-12 lg:py-20 max-w-[1200px] mx-auto px-6">
  
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
    
    <!-- Left Area - Resume Projects (Span 7) -->
    <div class="lg:col-span-7 space-y-8">
      <div class="retro-animate flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
          <h1 class="font-dots text-4xl sm:text-5xl text-[#e0a92e] uppercase tracking-tight">
            About me
          </h1>
        </div>
        <button 
          onclick={() => dispatch('resume')} 
          class="text-xs font-mono text-[#e0a92e] hover:underline uppercase text-left sm:text-right"
        >
          View Full Capabilities →
        </button>
      </div>

      <!-- Projects from Resume -->
      <div class="space-y-6">
        {#if isLoading}
          <div class="py-20 text-center bg-[#0f1115] border-2 border-[#3d3428] font-mono text-xs text-white/40">
            <span class="inline-block animate-pulse">QUERYING RESUME PROJECTS...</span>
          </div>
        {:else if !resumeData || resumeData.projects.length === 0}
          <div class="py-12 text-center bg-[#0f1115] border-2 border-[#3d3428] font-mono text-xs text-white/40">
            <span>NO RESUME PROJECTS RETURNED</span>
          </div>
        {:else}
          {#each resumeData.projects as project}
            <div class="bebop-card p-6 flex flex-col justify-between relative group retro-animate">
              <div class="absolute top-0 left-0 w-1 h-full bg-[#e0a92e]/20 group-hover:bg-[#e0a92e] transition-colors"></div>
              
              <div class="space-y-4 pl-2">
                <div class="flex justify-between items-start gap-4">
                  <span class="font-mono text-[9px] text-[#a8201a] uppercase font-bold tracking-wider">
                    // KEY TECHNOLOGIES: {project.tech}
                  </span>
                  <div class="flex items-center gap-3">
                    <span class="text-[#e0a92e] text-xs font-mono hidden sm:inline">{project.date}</span>
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="text-white/40 hover:text-white transition-colors"
                      aria-label="GitHub Repository"
                    >
                      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </a>
                  </div>
                </div>
                
                <h3 class="font-display font-bold text-xl uppercase tracking-tight text-white group-hover:text-[#e0a92e] transition-colors">
                  {project.title}
                </h3>
                
                <ul class="space-y-2 text-[#f3efe0]/70 text-xs font-light leading-relaxed list-disc pl-4">
                  {#each project.bullets as bullet}
                    <li>{bullet}</li>
                  {/each}
                </ul>
              </div>
            </div>
          {/each}
          
          <!-- Render Other Projects in inline listing -->
          {#if resumeData.otherProjects && resumeData.otherProjects.length > 0}
            <div class="bg-[#0f1115]/40 border-2 border-[#3d3428] p-6 tab-item-card transition-all retro-animate">
              <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] mb-4 border-b border-[#3d3428] pb-2">
                Additional Repositories
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each resumeData.otherProjects as other}
                  <a 
                    href={other.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="flex items-center justify-between p-4 bg-black border border-[#3d3428] hover:border-[#e0a92e] group transition-all"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-[#e0a92e]/5 border border-[#3d3428] flex items-center justify-center group-hover:bg-[#e0a92e]/20 transition-colors">
                        <Code size={14} class="text-[#e0a92e]" />
                      </div>
                      <span class="text-white/70 group-hover:text-white font-mono text-sm transition-colors">{other.title}</span>
                    </div>
                    <ExternalLink size={14} class="text-white/30 group-hover:text-white transition-colors" />
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Right Area - Picture & Contacts (Span 5) -->
    <div class="lg:col-span-5 space-y-8">
      
      <!-- Styled Avatar Card -->
      <div class="retro-animate relative group flex justify-center">
        <!-- Offset solid background border shadow -->
        <div class="absolute inset-0 bg-[#a8201a] border-2 border-[#a8201a] transform translate-x-3 translate-y-3 pointer-events-none"></div>
        
        <!-- Main Image Container -->
        <div class="relative w-full max-w-[380px] aspect-[4/5] bg-[#0f1115] border-2 border-[#e0a92e] p-2 overflow-hidden flex-shrink-0">
          <img 
            src={aboutMeImg} 
            alt="Muhammad Yahya Azeem" 
            class="w-full h-full object-cover scale-100"
            onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/about_me.png'; }}
          />
          <!-- Low-Fi Scanline overlay on image -->
          <div class="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
        </div>
      </div>

      <!-- Quick Contacts Block -->
      <div class="retro-animate bg-[#0f1115] border-2 border-[#3d3428] p-6 space-y-4">
        <h4 class="font-dots text-base text-[#e0a92e] uppercase tracking-wider border-b border-[#3d3428] pb-2">
          OPERATOR DIRECTORY
        </h4>
        
        <div class="space-y-4 font-mono text-xs text-[#f3efe0]/80">
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">EMAIL SIGNAL</span>
            <a href="mailto:yahyaazeem44@gmail.com" class="text-[#f3efe0] hover:text-[#e0a92e] transition-colors underline font-semibold text-sm">
              yahyaazeem44@gmail.com
            </a>
          </div>
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">LINKEDIN DISPATCH</span>
            <a 
              href="https://www.linkedin.com/in/muhammad-azeem-474612357/" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-[#f3efe0] hover:text-[#e0a92e] transition-colors underline font-semibold text-sm"
            >
              linkedin.com/in/muhammad-azeem
            </a>
          </div>
          <div>
            <span class="text-[#e0a92e]/60 block mb-1">BASE OF OPERATIONS</span>
            <span class="text-white text-xs">Irving, Texas // Global Friendly</span>
          </div>
        </div>
      </div>

    </div>

  </div>

  <!-- Bottom Grid: Feed & LinkedIn -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16 pt-12 border-t-2 border-[#3d3428]">
    
    <!-- Left Area: Live Activity Feed (Span 7) -->
    <div class="lg:col-span-7 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-0.5 bg-[#a8201a]"></div>
        <h2 class="font-dots text-xl text-[#a8201a] uppercase tracking-wider">Live signal feed</h2>
      </div>

      <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 space-y-4 bebop-shadow-red font-mono text-xs">
        {#if isLoadingEvents}
          <p class="text-white/30 animate-pulse">// BUFFERING LIVE TRANSMISSIONS...</p>
        {:else if events.length === 0}
          <p class="text-white/30">// NO LIVE EVENTS IN BUFFER REGISTERED</p>
        {:else}
          <ul class="space-y-4">
            {#each events as event}
              <li class="border-b border-[#3d3428]/35 pb-2 last:border-b-0 last:pb-0 space-y-1">
                <div class="flex items-center gap-2 text-[#e0a92e]">
                  <GitCommit size={12} />
                  <span class="font-bold text-[10px]">{event.type.replace('Event', '')}</span>
                </div>
                <p class="text-white/70 tracking-wide">{formatBebopEvent(event)}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>

    <!-- Right Area: LinkedIn Dispatch Link (Span 5) -->
    <div class="lg:col-span-5 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
        <h2 class="font-dots text-xl text-[#e0a92e] uppercase tracking-wider">Social Feed</h2>
      </div>

      <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 text-center space-y-4 bebop-shadow">
        <p class="text-[#f3efe0]/60 text-xs font-mono leading-relaxed">
          I post systems R&D updates and GRC compliance analysis directly to my LinkedIn activity feed.
        </p>
        <a 
          href="https://www.linkedin.com/in/muhammad-azeem-474612357/detail/recent-activity/shares/" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn-bebop w-full block text-xs"
        >
          Open LinkedIn Dispatch
          <ExternalLink size={12} class="inline ml-1" />
        </a>
      </div>
    </div>

  </div>
</div>
