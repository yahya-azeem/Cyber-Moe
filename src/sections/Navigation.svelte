<script lang="ts">
  import { Download } from 'lucide-svelte';
  const baseUrl = import.meta.env.BASE_URL || '/';
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-[#0b0c10] border-b-2 border-[#3d3428] py-2">
  <div class="max-w-[1200px] mx-auto px-6 flex justify-between items-center h-14">
    <!-- Logo -->
    <div class="flex items-center gap-3 text-left">
      <img 
        src={`${baseUrl}logo.png`} 
        alt="CyberMoe" 
        class="h-6 lg:h-7 w-auto object-contain brightness-95 filter grayscale"
        onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
      />
      <span class="font-mono text-[10px] text-[#e0a92e] uppercase tracking-[0.25em] hidden md:inline">
        // PORTFOLIO TERMINAL
      </span>
    </div>

    <!-- Resume Download -->
    <a 
      href={`${baseUrl}resume.pdf`}
      download="Muhammad_Yahya_Azeem_Resume.pdf"
      class="flex items-center gap-2 px-4 py-2 border border-[#e0a92e] text-[#e0a92e] hover:bg-[#e0a92e] hover:text-black transition-all duration-200 font-dots text-xs uppercase tracking-wider"
    >
      <Download size={14} />
      <span class="hidden sm:inline">Resume</span>
    </a>
  </div>
</nav>

<!-- Spacer to prevent content from going under the fixed nav -->
<div class="h-16"></div>
