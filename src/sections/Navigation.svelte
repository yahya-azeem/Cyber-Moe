<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    activeTab: 'bio' | 'resume' | 'services' | 'contact';
    onTabChange: (tab: 'bio' | 'resume' | 'services' | 'contact') => void;
  }

  let { activeTab, onTabChange }: Props = $props();

  const navLinks: { label: string; tab: 'bio' | 'resume' | 'services' | 'contact' }[] = [
    { label: 'Bio', tab: 'bio' },
    { label: 'Capabilities', tab: 'resume' },
    { label: 'Services', tab: 'services' },
    { label: 'Contact', tab: 'contact' },
  ];

  const baseUrl = import.meta.env.BASE_URL || '/';
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-[#0b0c10] border-b-2 border-[#3d3428] py-2">
  <div class="max-w-[1200px] mx-auto px-6 flex justify-between items-center h-14">
    <!-- Logo -->
    <button 
      onclick={() => onTabChange('bio')}
      class="flex items-center gap-3 text-left focus:outline-none"
    >
      <img 
        src={`${baseUrl}logo.png`} 
        alt="CyberMoe" 
        class="h-6 lg:h-7 w-auto object-contain brightness-95 filter grayscale"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
      />
      <span class="font-mono text-[10px] text-[#e0a92e] uppercase tracking-[0.25em] hidden md:inline">
        // PORTFOLIO TERMINAL
      </span>
    </button>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-1 sm:gap-2 font-mono text-xs">
      {#each navLinks as link}
        <button
          onclick={() => onTabChange(link.tab)}
          class={cn(
            "px-2.5 sm:px-4 py-1.5 uppercase tracking-wider transition-all duration-150 border-2 font-semibold",
            activeTab === link.tab
              ? "bg-[#e0a92e] text-[#0b0c10] border-[#e0a92e]"
              : "border-transparent text-white/50 hover:text-white/80"
          )}
        >
          {link.label}
        </button>
      {/each}
    </div>
  </div>
</nav>

<!-- Spacer to prevent content from going under the fixed nav -->
<div class="h-16"></div>
