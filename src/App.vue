<script setup>
import { ref, onMounted } from 'vue'

const pgrData = ref(null)
const loading = ref(true)
const errorMsg = ref(null)

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUid = urlParams.get('uid') || '12584504';

  try {
    const response = await fetch(`/api/pgr?uid=${currentUid}`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    pgrData.value = data
  } catch (error) {
    console.error("Gagal mengambil data", error)
    errorMsg.value = "Data pemain tidak ditemukan atau disetel Private."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-white">
    
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="aurora-shape aurora-1 absolute rounded-full mix-blend-screen bg-[#b91c1c] blur-[100px] opacity-50"></div>
      <div class="aurora-shape aurora-2 absolute rounded-full mix-blend-screen bg-[#e11d48] blur-[100px] opacity-40"></div>
      <div class="aurora-shape aurora-3 absolute rounded-full mix-blend-screen bg-[#7f1d1d] blur-[120px] opacity-30"></div>
      <div class="absolute inset-0 opacity-20 mix-blend-overlay" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg');"></div>
    </div>

    <div v-if="loading" class="text-slate-300 text-lg animate-pulse z-10">Memuat profil dari Huaxu...</div>
    <div v-if="errorMsg" class="text-[#fb7185] z-10">{{ errorMsg }}</div>
    
    <a 
      v-else-if="pgrData" 
      :href="`https://huaxu.app/ap/players/${pgrData.id}/characters`" 
      target="_blank"
      class="pgr-card block relative z-10 w-full max-w-[420px] transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-[20px] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.2)] group cursor-pointer no-underline text-white"
    >
      <svg class="absolute top-5 right-5 w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-[#fb7185] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>

      <div class="flex gap-5 items-center mb-6 relative z-10 mt-2">
        <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <img :src="pgrData.avatarUrl" alt="Avatar" class="absolute w-20 h-20 rounded-full object-cover z-0 transition-transform duration-300 group-hover:scale-105 border border-white/10">
          <img 
            v-if="pgrData.frameUrl" 
            :src="pgrData.frameUrl" 
            alt="Frame" 
            class="absolute w-[100px] h-[100px] max-w-none object-contain z-10 transition-transform duration-300 group-hover:scale-105"
          >
        </div>
        
        <div>
          <h2 class="text-[1.2rem] font-[800] text-white tracking-wide m-0 transition-colors duration-300 group-hover:text-[#fb7185]">{{ pgrData.name }}</h2>
          <p class="text-[0.85rem] font-[600] text-[#fb7185] m-0 mt-1">
            UID: {{ pgrData.id }} <span class="mx-1.5 text-slate-500">|</span> Lvl {{ pgrData.level }}
          </p>
        </div>
      </div>

      <div v-if="pgrData.sign" class="bg-black/20 rounded-xl p-3.5 mb-6 border border-white/5 shadow-inner relative z-10">
        <p class="text-sm italic text-slate-300 font-light text-center m-0">"{{ pgrData.sign }}"</p>
      </div>
      
      <div class="flex justify-between text-[0.85rem] text-slate-400 font-semibold tracking-wide relative z-10 px-1">
        <span>
          {{ pgrData.guild === 'No Guild' ? 'No Guild' : `Guild: ${pgrData.guild}` }}
        </span>
        <span>Started: {{ pgrData.started }}</span>
      </div>
    </a>

    <a 
      href="https://github.com/vermilion10/pgr-widget" 
      target="_blank" 
      class="mt-8 z-10 flex items-center gap-2 text-[0.85rem] text-slate-400 font-medium transition-colors hover:text-[#fb7185] bg-white/[0.02] border border-white/10 px-4 py-2 rounded-full hover:bg-white/[0.05]"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
      </svg>
      vermilion10 / pgr-widget
    </a>

  </div>
</template>

<style scoped>
.pgr-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(225, 29, 72, 0.2);
}

.aurora-1 {
  top: -10%; left: -10%; width: 50vw; height: 50vw;
  animation: aurora-1 15s infinite ease-in-out; 
}
.aurora-2 {
  bottom: -10%; right: -10%; width: 60vw; height: 60vw;
  animation: aurora-2 18s infinite ease-in-out; 
}
.aurora-3 {
  top: 40%; left: 30%; width: 40vw; height: 40vw;
  animation: aurora-3 14s infinite ease-in-out; 
}

@keyframes aurora-1 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(10%, 10%) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes aurora-2 {
  0% { transform: translate(0, 0) scale(1.1); }
  50% { transform: translate(-10%, -10%) scale(1); }
  100% { transform: translate(0, 0) scale(1.1); }
}
@keyframes aurora-3 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-5%, 15%) scale(1.2); }
  100% { transform: translate(0, 0) scale(1); }
}
</style>