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
  <div class="min-h-screen bg-gradient-to-br from-neutral-900 via-stone-900 to-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
    
    <div class="absolute w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
    <div class="absolute w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-3xl bottom-0 right-10 pointer-events-none"></div>

    <div v-if="loading" class="text-white text-xl animate-pulse z-10">Menghubungkan ke Huaxu...</div>
    
    <a 
      v-else-if="pgrData" 
      :href="`https://huaxu.app/ap/players/${pgrData.id}/characters`" 
      target="_blank"
      class="block relative z-10 w-[420px] transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(220,38,38,0.25)] rounded-2xl cursor-pointer"
    >
      <div class="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-7 relative overflow-hidden">
        
        <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        <div class="flex gap-5 items-center mb-6 relative z-10">
          
          <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <img :src="pgrData.avatarUrl" alt="Avatar" class="absolute w-20 h-20 rounded-full object-cover z-0 -mt-1 ">
            
            <img 
              v-if="pgrData.frameUrl" 
              :src="pgrData.frameUrl" 
              alt="Frame" 
              class="absolute w-[100px] h-[100px] max-w-none object-contain z-10"
            >
          </div>
          
          <div>
            <h2 class="text-2xl font-bold text-gray-50 drop-shadow-md tracking-wide">{{ pgrData.name }}</h2>
            <p class="text-sm text-gray-400 font-medium mt-1">
              UID: {{ pgrData.id }} <span class="mx-1.5 text-gray-600">|</span> Lvl <span class="text-red-400">{{ pgrData.level }}</span>
            </p>
          </div>
        </div>

        <div v-if="pgrData.sign" class="bg-black/40 rounded-xl p-3.5 mb-6 border border-white/5 shadow-inner relative z-10">
          <p class="text-sm italic text-gray-300 font-light text-center">"{{ pgrData.sign }}"</p>
        </div>
        
        <div class="flex justify-between text-sm font-semibold tracking-wide relative z-10 px-2">
          <span class="text-rose-300 py-2 drop-shadow-sm">
            {{ pgrData.guild === 'No Guild' ? 'No Guild' : `Guild: ${pgrData.guild}` }}
          </span>
          <span class="text-orange-300 py-2 drop-shadow-sm">
            Started: {{ pgrData.started }}
          </span>
        </div>
      </div>
    </a>
  </div>
</template>