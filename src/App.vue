<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const pgrData = ref(null)
const loading = ref(true)
const errorMsg = ref(null)
const isEmbed = ref(false)
const inputUid = ref(''); 
const inputServer = ref('ap');
const currentServer = ref('ap');
const servers = ['ap', 'eu', 'na', 'kr', 'jp', 'tw', 'cn'];
const copiedType = ref(null)

const goToUid = () => {
  if (inputUid.value.trim()) {
    window.location.href = `/?server=${inputServer.value}&uid=${inputUid.value.trim()}`;
  }
}

// SVG embed code generation
const baseUrl = computed(() => {
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://pgr-widget.pages.dev'
})

const svgUrl = computed(() => {
  if (!pgrData.value) return ''
  return `${baseUrl.value}/api/pgr-svg?uid=${pgrData.value.id}&server=${currentServer.value}`
})

const imgCode = computed(() => {
  if (!svgUrl.value) return ''
  return `<img src="${svgUrl.value}" alt="PGR Profile" width="420" />`
})

const markdownCode = computed(() => {
  if (!svgUrl.value) return ''
  return `[![PGR Profile](${svgUrl.value})](https://huaxu.app/${currentServer.value}/players/${pgrData.value.id}/characters)`
})

async function copyToClipboard(text, type) {
  try {
    await navigator.clipboard.writeText(text)
    copiedType.value = type
    setTimeout(() => { copiedType.value = null }, 2000)
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copiedType.value = type
    setTimeout(() => { copiedType.value = null }, 2000)
  }
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUid = urlParams.get('uid') || '12584504';
  currentServer.value = urlParams.get('server') || 'ap';
  inputServer.value = currentServer.value;
  
  isEmbed.value = urlParams.get('embed') === 'true';

  if (isEmbed.value) {
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.touchAction = 'pan-y';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'pan-y';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    const appDiv = document.getElementById('app');
    if (appDiv) {
      appDiv.style.width = '100%';
      appDiv.style.height = '100%';
    }

    const resizeWidget = () => {
      const wrapper = document.getElementById('widget-wrapper');
      if (wrapper) {
        const scale = Math.min(1, window.innerWidth / 450);
        wrapper.style.transform = `scale(${scale})`;
      }
    };
    
    window.addEventListener('resize', resizeWidget);
    nextTick(() => resizeWidget());
  }

  try {
    const response = await fetch(`/api/pgr?server=${currentServer.value}&uid=${currentUid}`)
    const data = await response.json()
    
    if (data.error) throw new Error(data.error)
    pgrData.value = data
    
    if (isEmbed.value) {
      nextTick(() => {
        const wrapper = document.getElementById('widget-wrapper');
        if (wrapper) {
           const scale = Math.min(1, window.innerWidth / 450);
           wrapper.style.transform = `scale(${scale})`;
        }
      });
    }

  } catch (error) {
    console.error("Gagal mengambil data", error)
    errorMsg.value = "Data pemain tidak ditemukan."
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="isEmbed" class="bg-transparent m-0 p-0 overflow-hidden text-white font-sans w-full h-full block relative">
    <div class="scale-wrapper" id="widget-wrapper">
      
      <a v-if="pgrData" :href="`https://huaxu.app/${currentServer}/players/${pgrData.id}/characters`" target="_blank"
        class="pgr-card block relative z-10 w-[420px] h-[280px] box-border transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-[20px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)] group cursor-pointer no-underline text-white flex flex-col justify-center"
      >
        <svg class="absolute top-5 right-5 w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-[#fb7185] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
        </svg>

        <div class="flex gap-4 items-center mb-4 relative z-10 mt-1">
          <div class="relative w-[84px] h-[84px] flex-shrink-0 flex items-center justify-center">
            <img :src="pgrData.avatarUrl" alt="Avatar" class="absolute w-[68px] h-[68px] rounded-full object-cover z-0 transition-transform duration-300 group-hover:scale-105 border border-white/10">
            <img v-if="pgrData.frameUrl" :src="pgrData.frameUrl" alt="Frame" class="absolute w-[88px] h-[88px] max-w-none object-contain z-10 transition-transform duration-300 group-hover:scale-105">
          </div>
          <div>
            <h2 class="text-[1.2rem] font-[800] text-white tracking-wide m-0 transition-colors duration-300 group-hover:text-[#fb7185] leading-tight">{{ pgrData.name }}</h2>
            <p class="text-[0.8rem] font-[600] text-[#fb7185] m-0 mt-1">
              UID: {{ pgrData.id }} <span class="mx-1 text-slate-500">|</span> Lvl {{ pgrData.level }}
            </p>
          </div>
        </div>

        <div v-if="pgrData.sign" class="bg-black/20 rounded-xl p-3 mb-4 border border-white/5 shadow-inner relative z-10 w-full">
          <p class="text-[13px] italic text-slate-300 font-light text-center m-0 truncate">"{{ pgrData.sign }}"</p>
        </div>
        
        <div class="flex justify-between text-[0.8rem] text-slate-400 font-semibold tracking-wide relative z-10 px-1 mt-auto">
          <span>{{ pgrData.guild === 'No Guild' ? 'No Guild' : `Guild: ${pgrData.guild}` }}</span>
          <span>Started: {{ pgrData.started }}</span>
        </div>
      </a>

      <div v-else-if="loading" class="text-slate-300 text-sm animate-pulse z-10">Memuat profil dari Huaxu...</div>
      <div v-else-if="errorMsg" class="text-[#fb7185] text-sm z-10">{{ errorMsg }}</div>
    </div>
  </div>

  <div v-else class="bg-[#020617] min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden text-white">
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
      :href="`https://huaxu.app/${currentServer}/players/${pgrData.id}/characters`" 
      target="_blank"
      class="pgr-card block relative z-10 w-full max-w-[420px] transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-[20px] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.2)] group cursor-pointer no-underline text-white"
    >
      <svg class="absolute top-5 right-5 w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-[#fb7185] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </svg>

      <div class="flex gap-5 items-center mb-6 relative z-10 mt-2">
        <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <img :src="pgrData.avatarUrl" alt="Avatar" class="absolute w-20 h-20 rounded-full object-cover z-0 transition-transform duration-300 group-hover:scale-105 border border-white/10">
          <img v-if="pgrData.frameUrl" :src="pgrData.frameUrl" alt="Frame" class="absolute w-[100px] h-[100px] max-w-none object-contain z-10 transition-transform duration-300 group-hover:scale-105">
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
        <span>{{ pgrData.guild === 'No Guild' ? 'No Guild' : `Guild: ${pgrData.guild}` }}</span>
        <span>Started: {{ pgrData.started }}</span>
      </div>
    </a>

    <div class="mt-8 z-10 flex flex-col items-center gap-4">
      <p class="text-[0.85rem] text-slate-400 font-medium">Create that with your own UID:</p>
      
      <div class="flex bg-white/[0.03] border border-white/10 rounded-full p-1 backdrop-blur-md">
        <button 
          v-for="srv in servers" 
          :key="srv"
          @click="inputServer = srv"
          type="button"
          :class="['px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 uppercase cursor-pointer', inputServer === srv ? 'bg-[#fb7185] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5']"
        >
          {{ srv }}
        </button>
      </div>

      <form @submit.prevent="goToUid" class="flex gap-2">
        <input v-model="inputUid" type="text" placeholder="Input UID..." class="bg-white/[0.02] border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#fb7185]/50 transition-colors backdrop-blur-md placeholder:text-slate-600 w-40 text-center">
        <button type="submit" class="bg-[#fb7185]/10 text-[#fb7185] border border-[#fb7185]/20 hover:bg-[#fb7185]/20 px-5 py-2 rounded-full text-sm font-semibold transition-all backdrop-blur-md cursor-pointer">
          Search
        </button>
      </form>
    </div>

    <!-- SVG Embed Section -->
    <div v-if="pgrData" class="mt-10 z-10 w-full max-w-[500px] flex flex-col items-center gap-5">
      <div class="w-full border-t border-white/10 pt-6">
        <h3 class="text-center text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Embed as SVG Image</h3>
        
        <!-- SVG Preview -->
        <div class="flex justify-center mb-5 bg-white/[0.02] border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <img :src="svgUrl" alt="PGR SVG Widget Preview" class="max-w-full h-auto rounded-lg" />
        </div>

        <!-- Code snippets -->
        <div class="flex flex-col gap-3">
          <!-- HTML img tag -->
          <div class="bg-white/[0.02] border border-white/10 rounded-xl p-3 backdrop-blur-md">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">HTML</span>
              <button 
                @click="copyToClipboard(imgCode, 'img')"
                class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full transition-all cursor-pointer"
                :class="copiedType === 'img' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-[#fb7185] hover:border-[#fb7185]/30'"
              >
                {{ copiedType === 'img' ? '✓ Copied!' : 'Copy' }}
              </button>
            </div>
            <code class="text-[11px] text-slate-400 font-mono break-all leading-relaxed block">{{ imgCode }}</code>
          </div>

          <!-- Markdown -->
          <div class="bg-white/[0.02] border border-white/10 rounded-xl p-3 backdrop-blur-md">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Markdown</span>
              <button 
                @click="copyToClipboard(markdownCode, 'md')"
                class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full transition-all cursor-pointer"
                :class="copiedType === 'md' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-[#fb7185] hover:border-[#fb7185]/30'"
              >
                {{ copiedType === 'md' ? '✓ Copied!' : 'Copy' }}
              </button>
            </div>
            <code class="text-[11px] text-slate-400 font-mono break-all leading-relaxed block">{{ markdownCode }}</code>
          </div>

          <!-- Direct URL -->
          <div class="bg-white/[0.02] border border-white/10 rounded-xl p-3 backdrop-blur-md">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Direct SVG URL</span>
              <button 
                @click="copyToClipboard(svgUrl, 'url')"
                class="text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full transition-all cursor-pointer"
                :class="copiedType === 'url' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-[#fb7185] hover:border-[#fb7185]/30'"
              >
                {{ copiedType === 'url' ? '✓ Copied!' : 'Copy' }}
              </button>
            </div>
            <code class="text-[11px] text-slate-400 font-mono break-all leading-relaxed block">{{ svgUrl }}</code>
          </div>
        </div>
      </div>
    </div>

    <a href="https://github.com/vermilion10/pgr-widget" target="_blank" class="mt-6 z-10 flex items-center gap-2 text-[0.85rem] text-slate-400 font-medium transition-colors hover:text-[#fb7185] bg-white/[0.02] border border-white/10 px-4 py-2 rounded-full hover:bg-white/[0.05]">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path></svg>
      vermilion10 / pgr-widget
    </a>
  </div>
</template>

<style scoped>
.scale-wrapper {
  position: absolute;
  top: 0; left: 0;
  width: 450px; height: 350px;
  transform-origin: 0 0;
  display: flex; align-items: center; justify-content: center;
}

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