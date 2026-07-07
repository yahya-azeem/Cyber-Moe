<script lang="ts">
  import Navigation from './sections/Navigation.svelte';
  import Bio from './sections/Bio.svelte';
</script>

<div class="relative min-h-screen bg-black text-[#f3efe0] overflow-x-hidden selection:bg-[#e0a92e] selection:text-black">
  <!-- Retro scanlines overlay -->
  <div class="scanline-overlay"></div>
  
  <!-- Navigation Header -->
  <Navigation />
  
  <!-- Main Display Screen -->
  <main class="relative z-10 w-full">
    <Bio />
  </main>
</div>
