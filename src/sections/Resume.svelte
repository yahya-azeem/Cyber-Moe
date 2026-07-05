<script lang="ts">
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
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

  let resumeData = $state<ResumeData | null>(null);
  let isLoading = $state(true);
  let errorMsg = $state('');
  let activeTab = $state<'skills' | 'projects' | 'experience'>('skills');

  const baseUrl = import.meta.env.BASE_URL || '/';
  const resumeUrl = `${baseUrl}resume.tex`;
  const aboutMeImg = `${baseUrl}about_me.png`;

  onMount(async () => {
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch resume from ${resumeUrl}`);
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
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      }

      // Summary Card and image
      if (summaryCardRef) {
        gsap.fromTo(summaryCardRef,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          }
        );
      }
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
  class="relative bg-black py-16 lg:py-24 border-t-2 border-[#3d3428] overflow-hidden"
  style="z-index: 50;"
>
  <div class="px-6 sm:px-12 lg:px-[8vw] max-w-[1300px] mx-auto relative z-10">
    
    <!-- Section Header -->
    <div bind:this={headerRef} class="mb-12">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-0.5 bg-[#e0a92e]"></div>
        <span class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.4em]">Capabilities Matrix</span>
      </div>
      <h2 class="font-dots text-4xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight">
        Interactive <span class="text-[#e0a92e]">Resume</span>
      </h2>
    </div>

    {#if isLoading}
      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-2 border-[#e0a92e] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span class="font-mono text-xs text-[#e0a92e]/60 uppercase tracking-widest">Parsing resume.tex...</span>
      </div>
    {:else if errorMsg}
      <!-- Error State -->
      <div class="border-2 border-[#a8201a] bg-[#a8201a]/5 p-8 text-center bebop-shadow-red max-w-xl mx-auto">
        <p class="text-[#a8201a] font-mono font-bold mb-2">!! EXCEPTION OCCURRED WHILE RESOLVING RESUME !!</p>
        <p class="text-white/80 text-sm font-mono">{errorMsg}</p>
        <div class="mt-4 pt-4 border-t border-[#a8201a]/20">
          <p class="text-white/50 text-xs font-mono">Verify that public/resume.tex exists at root.</p>
        </div>
      </div>
    {:else if resumeData}
      <!-- Resume Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        <!-- Left Side: Profile Card & Education (Span 5) -->
        <div bind:this={summaryCardRef} class="lg:col-span-5 space-y-8">
          
          <!-- Founder Profile Card -->
          <div class="bg-[#0f1115] border-2 border-[#3d3428] p-8 relative overflow-hidden group bebop-shadow">
            <!-- Glow background overlay -->
            <div class="absolute -right-20 -top-20 w-48 h-48 bg-[#e0a92e]/5 blur-3xl rounded-full"></div>
            
            <div class="flex flex-col sm:flex-row lg:flex-col gap-6 items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center">
              <!-- Avatar -->
              <div class="relative w-36 h-36 border-2 border-[#e0a92e] p-1 bg-black overflow-hidden flex-shrink-0">
                <img 
                  src={aboutMeImg} 
                  alt="Muhammad Yahya Azeem" 
                  class="w-full h-full object-cover scale-100"
                  onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/about_me.png'; }}
                />
              </div>

              <!-- Name & Title -->
              <div>
                <h3 class="font-display font-bold text-2xl lg:text-3xl text-white mb-2 tracking-tight uppercase">
                  {resumeData.contact.name}
                </h3>
                <p class="font-mono text-xs text-[#e0a92e] uppercase tracking-widest mb-4">
                  Security Researcher & Systems Engineer
                </p>
                <div class="flex flex-wrap justify-center sm:justify-start lg:justify-center gap-3 text-white/70 text-xs font-mono">
                  <span class="flex items-center gap-1.5">
                    <MapPin size={12} class="text-[#e0a92e]" />
                    {resumeData.contact.location}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <Mail size={12} class="text-[#e0a92e]" />
                    {resumeData.contact.email}
                  </span>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="w-full h-0.5 bg-[#3d3428] my-6"></div>

            <!-- Summary -->
            <div>
              <span class="font-mono text-[10px] text-[#e0a92e] uppercase tracking-[0.2em] mb-3 block">
                // Research Summary
              </span>
              <p class="text-white/70 text-sm leading-relaxed font-light">
                {resumeData.summary}
              </p>
            </div>
            
            <!-- Links / Social -->
            <div class="mt-6 flex flex-wrap gap-3">
              <a 
                href={resumeData.contact.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-[#0b0c10] border border-[#3d3428] hover:border-[#e0a92e] hover:bg-[#0f1115] text-white/70 hover:text-white px-4 py-2.5 transition-all"
              >
                <svg class="w-3.5 h-3.5 fill-current text-[#e0a92e]" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                github.com/yahya-azeem
              </a>
              <a 
                href={resumeData.contact.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center gap-2 text-xs font-mono bg-[#0b0c10] border border-[#3d3428] hover:border-[#e0a92e] hover:bg-[#0f1115] text-white/70 hover:text-white px-4 py-2.5 transition-all"
              >
                <ExternalLink size={14} class="text-[#e0a92e]" />
                LinkedIn
              </a>
            </div>
          </div>

          <!-- Offensive Security Proof of Work -->
          {#if resumeData.achievements && resumeData.achievements.length > 0}
            <div class="bg-[#0f1115] border-2 border-[#a8201a] p-8 relative overflow-hidden group bebop-shadow-red">
              <div class="absolute top-0 right-0 bg-[#a8201a] text-[#f3efe0] px-3 py-1 text-[9px] font-mono uppercase tracking-widest">
                VERIFIED BYPASS
              </div>

              <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-none bg-[#a8201a]/10 border border-[#a8201a] flex items-center justify-center text-[#a8201a]">
                  <ShieldAlert size={18} />
                </div>
                <span class="font-mono text-xs text-[#a8201a] uppercase tracking-widest font-bold">
                  Offensive Achievements
                </span>
              </div>

              {#each resumeData.achievements as ach}
                <div class="space-y-4 font-mono">
                  <div class="flex justify-between items-baseline gap-4">
                    <h4 class="text-base font-bold text-white group-hover:text-[#a8201a] transition-colors uppercase">
                      {ach.title}
                    </h4>
                    <span class="text-[#a8201a] text-[10px] whitespace-nowrap">
                      {ach.date}
                    </span>
                  </div>
                  <ul class="space-y-3 font-sans text-white/70 text-sm font-light leading-relaxed">
                    {#each ach.bullets as bullet}
                      <li class="flex items-start gap-3">
                        <span class="text-[#a8201a] mt-1.5 font-bold text-xs">•</span>
                        <span>{bullet}</span>
                      </li>
                    {/each}
                  </ul>
                  <a 
                    href={resumeData.contact.htbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-xs font-mono text-[#a8201a] hover:underline pt-2"
                  >
                    HTB Verification Profile <ExternalLink size={12} />
                  </a>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Education Card -->
          <div class="bg-[#0f1115] border-2 border-[#3d3428] p-8 relative overflow-hidden bebop-shadow-blue">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-8 h-8 bg-[#1b4965]/10 border border-[#1b4965] flex items-center justify-center text-white">
                <BookOpen size={18} class="text-[#e0a92e]" />
              </div>
              <span class="font-mono text-xs text-white/50 uppercase tracking-[0.2em] mb-0 block">
                Education
              </span>
            </div>
            
            <div class="space-y-2 font-mono">
              <div class="flex justify-between items-start">
                <h4 class="font-bold text-base text-white uppercase">
                  {resumeData.education.school}
                </h4>
                <span class="text-[#e0a92e] text-xs whitespace-nowrap ml-2">
                  {resumeData.education.date}
                </span>
              </div>
              <p class="text-white/60 text-sm font-light">
                {resumeData.education.degree}
              </p>
              <div class="flex items-center gap-1.5 text-white/30 text-xs pt-1">
                <MapPin size={10} />
                {resumeData.education.location}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Interactive Panel (Span 7) -->
        <div class="lg:col-span-7 space-y-8">
          
          <!-- Terminal Tabs Navigation -->
          <div class="flex border-2 border-[#3d3428] bg-black p-1">
            <button 
              onclick={() => activeTab = 'skills'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'skills' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Cpu size={14} />
              Skills Matrix
            </button>
            <button 
              onclick={() => activeTab = 'projects'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'projects' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
                  : "text-white/40 hover:text-white/80"
              )}
            >
              <Code size={14} />
              Projects
            </button>
            <button 
              onclick={() => activeTab = 'experience'}
              class={cn(
                "flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                activeTab === 'experience' 
                  ? "bg-[#e0a92e] text-[#0b0c10] font-bold" 
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
                <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Terminal size={14} />
                      Languages
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.languages as lang}
                      <span class="px-3 py-1.5 bg-[#0b0c10] border border-[#3d3428] rounded text-sm text-white/80 transition-colors font-mono">
                        {lang}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Systems & Architecture -->
                <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cpu size={14} />
                      Systems & Architecture
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.systems as sys}
                      <span class="px-3 py-1.5 bg-[#0b0c10] border border-[#3d3428] rounded text-sm text-white/80 transition-colors font-mono">
                        {sys}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Deep Learning & Optimization -->
                <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Code size={14} />
                      Deep Learning & Optimization
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.deepLearning as dl}
                      <span class="px-3 py-1.5 bg-[#0b0c10] border border-[#3d3428] rounded text-sm text-white/80 transition-colors font-mono">
                        {dl}
                      </span>
                    {/each}
                  </div>
                </div>

                <!-- Offensive Security -->
                <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-mono text-xs text-[#e0a92e] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Award size={14} />
                      Offensive Security
                    </h4>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    {#each resumeData.skills.offensiveSecurity as os}
                      <span class="px-3 py-1.5 bg-[#0b0c10] border border-[#3d3428] rounded text-sm text-white/80 transition-colors font-mono">
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
                  <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-[#e0a92e]/20 group-hover:bg-[#e0a92e] transition-colors"></div>
                    
                    <div class="flex justify-between items-start gap-4 mb-3 pl-2">
                      <div>
                        <h4 class="font-display font-bold text-xl text-white group-hover:text-[#e0a92e] transition-colors flex items-center gap-2 uppercase tracking-tight">
                          {project.title}
                        </h4>
                        <span class="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-1 block">
                          Key Tech: {project.tech}
                        </span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-[#e0a92e] text-xs font-mono hidden sm:inline">{project.date}</span>
                        <a 
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="GitHub Repository"
                          class="w-8 h-8 bg-black border border-[#3d3428] hover:border-[#e0a92e] hover:bg-[#0f1115] flex items-center justify-center text-white/50 hover:text-white transition-all"
                        >
                          <svg class="w-3.5 h-3.5 fill-current text-white/50 hover:text-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>

                    <ul class="space-y-3 pl-2 mt-4 text-[#f3efe0]/70 text-sm font-light leading-relaxed">
                      {#each project.bullets as bullet}
                        <li class="flex items-start gap-3">
                          <span class="text-[#e0a92e] mt-2 w-1.5 h-1.5 bg-[#e0a92e] flex-shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}

                <!-- Other Projects (Inline listing) -->
                {#if resumeData.otherProjects && resumeData.otherProjects.length > 0}
                  <div class="bg-[#0f1115]/40 border-2 border-[#3d3428] p-6 tab-item-card transition-all">
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

              </div>
            {/if}

            {#if activeTab === 'experience'}
              <!-- Experience Panel -->
              <div class="space-y-6 tab-content-animate">
                {#each resumeData.experience as exp}
                  <div class="bg-[#0f1115] border-2 border-[#3d3428] p-6 tab-item-card transition-all duration-300 hover:border-[#e0a92e] group relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-[#e0a92e]/20 group-hover:bg-[#e0a92e] transition-colors"></div>
                    
                    <div class="flex justify-between items-start gap-4 mb-4 pl-2">
                      <div>
                        <h4 class="font-display font-bold text-xl text-white group-hover:text-[#e0a92e] transition-colors uppercase tracking-tight">
                          {exp.role}
                        </h4>
                        <div class="flex flex-wrap items-center gap-2 mt-1 text-sm font-mono">
                          <span class="text-[#e0a92e] font-semibold">{exp.company}</span>
                          <span class="text-white/20">•</span>
                          <span class="flex items-center gap-1 text-xs text-white/50">
                            <Calendar size={12} />
                            {exp.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ul class="space-y-3 pl-2 mt-4 text-[#f3efe0]/70 text-sm font-light leading-relaxed">
                      {#each exp.bullets as bullet}
                        <li class="flex items-start gap-3">
                          <span class="text-[#e0a92e] mt-2 w-1.5 h-1.5 bg-[#e0a92e] flex-shrink-0"></span>
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
