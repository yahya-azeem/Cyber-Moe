<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { 
    Terminal, 
    Cpu, 
    ShieldAlert, 
    Code, 
    ExternalLink, 
    Award, 
    BookOpen, 
    Briefcase,
    Calendar,
    MapPin,
    Mail,
    Phone
  } from 'lucide-svelte';
  import { parseResume, type ResumeData } from '../lib/resumeParser';
  import { cn } from '$lib/utils';

  let sectionRef = $state<HTMLElement>();
  let headerRef = $state<HTMLDivElement>();
  let summaryCardRef = $state<HTMLDivElement>();
  let skillsRef = $state<HTMLDivElement>();
  let projectsRef = $state<HTMLDivElement>();
  let experienceRef = $state<HTMLDivElement>();

  let resumeData = $state<ResumeData | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state('');
  let activeTab = $state<'skills' | 'projects' | 'experience'>('skills');

  onMount(async () => {
    try {
      const response = await fetch('/resume.tex');
      if (!response.ok) {
        throw new Error('Failed to fetch resume source file');
      }
      const texText = await response.text();
      resumeData = parseResume(texText);
      isLoading = false;

      // Initialize animations after DOM updates
      setTimeout(setupAnimations, 100);
    } catch (err: any) {
      console.error(err);
      errorMsg = err.message || 'Error loading resume';
      isLoading = false;
    }
  });

  function setupAnimations() {
    if (!sectionRef) return;
    
    const ctx = gsap.context(() => {
      // Fade in the header
      if (headerRef) {
        gsap.fromTo(headerRef,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: headerRef,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Summary Card and image
      if (summaryCardRef) {
        gsap.fromTo(summaryCardRef,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: summaryCardRef,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Tab content fade-in
      gsap.fromTo('.tab-content-animate',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.tab-content-animate',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }

  // Trigger animations again when tab changes
  $effect(() => {
    if (activeTab && !isLoading) {
      gsap.fromTo('.tab-item-card',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  });
</script>

<section 
  bind:this={sectionRef}
  id="capabilities"
  class="relative bg-black py-24 lg:py-36 border-t border-white/5 overflow-hidden"
  style="z-index: 50;"
>
  <!-- Cyberpunk background grids -->
  <div class="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
  <div class="absolute -top-40 -left-40 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
  <div class="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

  <div class="px-6 sm:px-12 lg:px-[8vw] max-w-[1400px] mx-auto relative z-10">
    
    <!-- Section Header -->
    <div bind:this={headerRef} class="mb-16">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-8 h-px bg-accent"></div>
        <span class="font-mono text-xs text-accent uppercase tracking-[0.4em]">Capabilities Engine</span>
      </div>
      <h2 class="font-display font-bold text-4xl sm:text-5xl lg:text-7xl text-white max-w-3xl leading-tight">
        Core expertise & <br/><span class="text-accent underline decoration-accent/20">technical projects</span>
      </h2>
    </div>

    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <span class="font-mono text-sm text-white/40 uppercase tracking-widest">Parsing resume.tex...</span>
      </div>
    {:else if errorMsg}
      <!-- Error State -->
      <div class="border border-red-500/20 bg-red-500/5 p-8 rounded-lg text-center">
        <p class="text-red-400 font-mono mb-2">Error parsing resume data</p>
        <p class="text-white/60 text-sm">{errorMsg}</p>
      </div>
    {:else if resumeData}
      <!-- Resume Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <!-- Left Side: Profile Card & Education (Span 4) -->
        <div bind:this={summaryCardRef} class="lg:col-span-5 space-y-8">
          
          <!-- Founder Profile Card -->
          <div class="bg-[#050505] border border-white/5 p-8 rounded-xl relative overflow-hidden group shadow-2xl">
            <!-- Glow background overlay -->
            <div class="absolute -right-20 -top-20 w-48 h-48 bg-accent/5 blur-3xl rounded-full transition-opacity duration-500 group-hover:bg-accent/10"></div>
            
            <div class="flex flex-col sm:flex-row lg:flex-col gap-6 items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center">
              <!-- Avatar -->
              <div class="relative w-36 h-36 rounded-xl border border-accent/30 p-1 bg-black overflow-hidden flex-shrink-0 group-hover:border-accent transition-colors duration-500">
                <img 
                  src="/about_me.png" 
                  alt="Muhammad Yahya Azeem" 
                  class="w-full h-full object-cover rounded-lg filter grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                />
              </div>

              <!-- Name & Title -->
              <div>
                <h3 class="font-display font-bold text-2xl lg:text-3xl text-white mb-2 tracking-tight">
                  {resumeData.contact.name}
                </h3>
                <p class="font-mono text-xs text-accent uppercase tracking-widest mb-4">
                  Security Researcher & Systems Engineer
                </p>
                <div class="flex flex-wrap justify-center sm:justify-start lg:justify-center gap-3 text-white/50 text-xs font-light">
                  <span class="flex items-center gap-1">
                    <MapPin size={12} class="text-accent" />
                    {resumeData.contact.location}
                  </span>
                  <span class="flex items-center gap-1">
                    <Mail size={12} />
                    {resumeData.contact.email}
                  </span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

            <!-- Summary -->
            <div>
              <span class="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3 block">
                Research Summary
              </span>
              <p class="text-white/70 text-sm lg:text-base leading-relaxed font-light">
                {resumeData.summary}
              </p>
            </div>
            
            <!-- Links / Social -->
            <div class="mt-6 flex flex-wrap gap-3">
              <a 
                href={resumeData.contact.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-white/70 hover:text-white px-4 py-2.5 rounded transition-all"
              >
                <svg class="w-3.5 h-3.5 fill-current text-accent" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                github.com/yahya-azeem
              </a>
              <a 
                href={resumeData.contact.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] text-white/70 hover:text-white px-4 py-2.5 rounded transition-all"
              >
                <ExternalLink size={14} class="text-accent" />
                LinkedIn Profile
              </a>
            </div>
          </div>

          <!-- Offensive Security Proof of Work -->
          {#if resumeData.achievements && resumeData.achievements.length > 0}
            <div class="bg-gradient-to-br from-red-500/[0.02] via-[#050505] to-[#050505] border border-red-500/10 p-8 rounded-xl shadow-2xl relative overflow-hidden group">
              <!-- Corner red accent line -->
              <div class="absolute top-0 right-0 w-24 h-px bg-gradient-to-l from-red-500/40 to-transparent"></div>
              <div class="absolute top-0 right-0 w-px h-24 bg-gradient-to-b from-red-500/40 to-transparent"></div>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                  <ShieldAlert size={18} />
                </div>
                <span class="font-mono text-xs text-red-400 uppercase tracking-widest font-semibold">
                  Offensive Proof of Work
                </span>
              </div>

              {#each resumeData.achievements as ach}
                <div class="space-y-4">
                  <div class="flex justify-between items-baseline gap-4">
                    <h4 class="text-lg font-display font-bold text-white group-hover:text-red-400 transition-colors">
                      {ach.title}
                    </h4>
                    <span class="text-red-400/60 font-mono text-[10px] uppercase whitespace-nowrap">
                      {ach.date}
                    </span>
                  </div>
                  <ul class="space-y-3">
                    {#each ach.bullets as bullet}
                      <li class="text-white/60 text-sm font-light leading-relaxed flex items-start gap-3">
                        <span class="text-red-500 mt-1.5 font-bold text-xs">•</span>
                        <span>{bullet}</span>
                      </li>
                    {/each}
                  </ul>
                  <a 
                    href={resumeData.contact.htbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-xs font-mono text-red-400/80 hover:text-red-400 transition-all pt-2"
                  >
                    View Verified HTB Profile <ExternalLink size={12} />
                  </a>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Education Card -->
          <div class="bg-[#050505] border border-white/5 p-8 rounded-xl relative overflow-hidden shadow-2xl">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <BookOpen size={18} />
              </div>
              <span class="font-mono text-xs text-white/40 uppercase tracking-[0.2em] mb-0 block">
                Education
              </span>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <h4 class="font-display font-bold text-lg text-white">
                  {resumeData.education.school}
                </h4>
                <span class="text-accent/60 font-mono text-xs whitespace-nowrap ml-2">
                  {resumeData.education.date}
                </span>
              </div>
              <p class="text-white/60 text-sm font-light leading-normal">
                {resumeData.education.degree}
              </p>
              <div class="flex items-center gap-1.5 text-white/30 text-xs font-mono pt-1">
                <MapPin size={10} />
                {resumeData.education.location}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Interactive Panel (Span 7) -->
        <div class="lg:col-span-7 space-y-8">
          
          <!-- Terminal Tabs Navigation -->
          <div class="flex border-b border-white/5 bg-[#030303] p-1.5 rounded-lg">
            <button 
              onclick={() => activeTab = 'skills'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'skills' 
                  ? "bg-accent text-white shadow-glow" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Cpu size={14} />
              Skills Matrix
            </button>
            <button 
              onclick={() => activeTab = 'projects'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'projects' 
                  ? "bg-accent text-white shadow-glow" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Code size={14} />
              Projects
            </button>
            <button 
              onclick={() => activeTab = 'experience'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                activeTab === 'experience' 
                  ? "bg-accent text-white shadow-glow" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Briefcase size={14} />
              Experience
            </button>
          </div>

          <!-- Tab Content Area -->
          <div class="min-h-[500px]">
            
            {#if activeTab === 'skills'}
              <!-- Skills Panel -->
              <div class="space-y-6 tab-content-animate">
                
                <!-- Programming Languages -->
                <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Terminal size={14} class="text-accent" />
                      Languages
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.languages as lang}
                      <span class="px-3 py-1.5 bg-black border border-white/5 hover:border-accent/40 rounded text-sm text-white/80 transition-colors font-mono">
                        {lang}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Systems & Architecture -->
                <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cpu size={14} class="text-accent" />
                      Systems & Architecture
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.systems as sys}
                      <span class="px-3 py-1.5 bg-black border border-white/5 hover:border-accent/40 rounded text-sm text-white/80 transition-colors font-mono">
                        {sys}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Deep Learning & Optimization -->
                <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Code size={14} class="text-accent" />
                      Deep Learning & Optimization
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.deepLearning as dl}
                      <span class="px-3 py-1.5 bg-black border border-white/5 hover:border-accent/40 rounded text-sm text-white/80 transition-colors font-mono">
                        {dl}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Offensive Security -->
                <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Award size={14} class="text-accent" />
                      Offensive Security
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.offensiveSecurity as os}
                      <span class="px-3 py-1.5 bg-black border border-white/5 hover:border-accent/40 rounded text-sm text-white/80 transition-colors font-mono">
                        {os}
                      </span>
                    {/each}
                  </div>
                </div>

              </div>
            {/if}

            {#if activeTab === 'projects'}
              <!-- Projects Panel -->
              <div class="space-y-6 tab-content-animate">
                {#each resumeData.projects as project}
                  <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-accent/20 group-hover:bg-accent transition-colors"></div>
                    
                    <div class="flex justify-between items-start gap-4 mb-3 pl-2">
                      <div>
                        <h4 class="font-display font-bold text-xl text-white group-hover:text-accent transition-colors flex items-center gap-2">
                          {project.title}
                        </h4>
                        <span class="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">
                          Key Tech: {project.tech}
                        </span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-white/30 text-xs font-mono font-light hidden sm:inline">{project.date}</span>
                        <a 
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub Repository"
                          class="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 hover:border-accent/30 hover:bg-accent/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                        >
                          <svg class="w-3.5 h-3.5 fill-current text-white/50 hover:text-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>

                    <ul class="space-y-3 pl-2 mt-4">
                      {#each project.bullets as bullet}
                        <li class="text-white/60 text-sm font-light leading-relaxed flex items-start gap-3">
                          <span class="text-accent mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}

                <!-- Other Projects (Inline listing) -->
                {#if resumeData.otherProjects && resumeData.otherProjects.length > 0}
                  <div class="bg-[#050505]/40 border border-white/5 p-6 rounded-xl tab-item-card transition-all">
                    <h4 class="font-mono text-xs text-white/40 uppercase tracking-[0.2em] mb-4">
                      Additional Repository Artifacts
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {#each resumeData.otherProjects as other}
                        <a 
                          href={other.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="flex items-center justify-between p-4 bg-black border border-white/5 hover:border-accent/40 rounded-lg group transition-all"
                        >
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                              <Code size={14} class="text-accent" />
                            </div>
                            <span class="text-white/70 group-hover:text-white font-mono text-sm transition-colors">{other.title}</span>
                          </div>
                          <ExternalLink size={14} class="text-white/30 group-hover:text-white transition-colors" />
                        </a>
                      {/each}
                    </div>
                  </div>
                {/if}

              </div>
            {/if}

            {#if activeTab === 'experience'}
              <!-- Experience Panel -->
              <div class="space-y-6 tab-content-animate">
                {#each resumeData.experience as exp}
                  <div class="bg-[#050505] border border-white/5 p-6 rounded-xl tab-item-card transition-all duration-300 hover:border-white/10 group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-accent/20 group-hover:bg-accent transition-colors"></div>
                    
                    <div class="flex justify-between items-start gap-4 mb-4 pl-2">
                      <div>
                        <h4 class="font-display font-bold text-xl text-white group-hover:text-accent transition-colors">
                          {exp.role}
                        </h4>
                        <div class="flex flex-wrap items-center gap-2 mt-1 text-sm text-white/50 font-light">
                          <span class="font-mono text-accent font-semibold">{exp.company}</span>
                          <span class="text-white/20">•</span>
                          <span class="flex items-center gap-1 text-xs">
                            <Calendar size={12} />
                            {exp.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul class="space-y-3 pl-2 mt-4">
                      {#each exp.bullets as bullet}
                        <li class="text-white/60 text-sm font-light leading-relaxed flex items-start gap-3">
                          <span class="text-accent mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </div>
            {/if}

          </div>
        </div>

      </div>
    {/if}
  </div>
</section>
