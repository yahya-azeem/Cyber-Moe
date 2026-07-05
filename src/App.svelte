<script lang="ts">
  import { onMount } from 'svelte';
  import Navigation from './sections/Navigation.svelte';
  import Bio from './sections/Bio.svelte';
  import Resume from './sections/Resume.svelte';

  let activeTab = $state<'bio' | 'resume'>('bio');

  function handleTabChange(newTab: 'bio' | 'resume') {
    activeTab = newTab;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  onMount(() => {
    // Global listener for tab switching from subcomponents
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      const targetTab = customEvent.detail;
      if (targetTab === 'resume' || targetTab === 'bio') {
        handleTabChange(targetTab);
      }
    };

    window.addEventListener('switchtab', handleSwitchTab);
    return () => {
      window.removeEventListener('switchtab', handleSwitchTab);
    };
  });
</script>

<div class="relative min-h-screen bg-black text-[#f3efe0] overflow-x-hidden selection:bg-[#e0a92e] selection:text-black">
  <!-- Retro scanlines overlay -->
  <div class="scanline-overlay"></div>
  
  <!-- Navigation Header -->
  <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
  
  <!-- Main Display Screen -->
  <main class="relative z-10 w-full">
    {#if activeTab === 'bio'}
      <Bio />
    {:else if activeTab === 'resume'}
      <Resume />
    {/if}
  </main>
</div>
