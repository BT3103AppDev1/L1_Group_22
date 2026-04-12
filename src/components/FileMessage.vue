<template>
  <div class="fm-wrap" :class="isMine ? 'fm-mine' : 'fm-theirs'">

    <!-- ── Image ── -->
    <div v-if="isImage" class="fm-image-bubble">
      <img
        :src="msg.fileUrl"
        :alt="msg.fileName"
        class="fm-image"
        @click="openLightbox"
      />
      <span class="fm-time">{{ time }}</span>
    </div>

    <!-- ── PDF / Doc / Other ── -->
    <div v-else class="fm-file-bubble">
      <div class="fm-file-icon">{{ fileIcon }}</div>
      <div class="fm-file-info">
        <div class="fm-file-name">{{ msg.fileName }}</div>
        <div class="fm-file-size">{{ formattedSize }}</div>
      </div>
      <a
        :href="msg.fileUrl"
        target="_blank"
        rel="noopener"
        class="fm-download-btn"
        :download="msg.fileName"
      >↓</a>
    </div>

    <!-- Lightbox overlay -->
    <div v-if="lightboxOpen" class="fm-lightbox" @click="lightboxOpen = false">
      <img :src="msg.fileUrl" :alt="msg.fileName" class="fm-lightbox-img" />
      <button class="fm-lightbox-close" @click="lightboxOpen = false">✕</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  msg:    { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  time:   { type: String, default: "" },
})

const lightboxOpen = ref(false)

const isImage = computed(() =>
  props.msg.fileType?.startsWith("image/")
)

const fileIcon = computed(() => {
  const t = props.msg.fileType || ""
  if (t === "application/pdf") return "📄"
  if (t.includes("word"))      return "📝"
  if (t.includes("sheet") || t.includes("excel")) return "📊"
  if (t.includes("zip") || t.includes("rar"))     return "🗜️"
  return "📎"
})

const formattedSize = computed(() => {
  const bytes = props.msg.fileSize || 0
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

function openLightbox() {
  lightboxOpen.value = true
}
</script>

<style scoped>
.fm-wrap {
  display: flex;
  flex-direction: column;
  max-width: 65%;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.fm-mine  { align-items: flex-end; }
.fm-theirs { align-items: flex-start; }

/* ── Image bubble ── */
.fm-image-bubble {
  display: flex;
  flex-direction: column;
}

.fm-image {
  max-width: 240px;
  max-height: 280px;
  width: 100%;
  object-fit: cover;
  border-radius: 14px;
  cursor: zoom-in;
  display: block;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
}

/* ── File card bubble ── */
.fm-file-bubble {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  min-width: 200px;
}

.fm-mine .fm-file-bubble {
  background: #2254f5;
}

.fm-theirs .fm-file-bubble {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.fm-file-icon {
  font-size: 26px;
  flex-shrink: 0;
}

.fm-file-info {
  flex: 1;
  min-width: 0;
}

.fm-file-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fm-mine .fm-file-name   { color: #fff; }
.fm-theirs .fm-file-name { color: #111827; }

.fm-file-size {
  font-size: 11px;
  margin-top: 2px;
}

.fm-mine .fm-file-size   { color: rgba(255,255,255,0.65); }
.fm-theirs .fm-file-size { color: #9ca3af; }

.fm-download-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s;
}

.fm-mine .fm-download-btn {
  background: rgba(255,255,255,0.18);
  color: #fff;
}
.fm-mine .fm-download-btn:hover { background: rgba(255,255,255,0.3); }

.fm-theirs .fm-download-btn {
  background: #e5e7eb;
  color: #374151;
}
.fm-theirs .fm-download-btn:hover { background: #d1d5db; }

/* ── Timestamp ── */
.fm-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.6;
}

.fm-mine .fm-time  { color: #374151; text-align: right; }
.fm-theirs .fm-time { color: #6b7280; }

/* ── Lightbox ── */
.fm-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.fm-lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.5);
}

.fm-lightbox-close {
  position: absolute;
  top: 20px;
  right: 24px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  font-size: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.fm-lightbox-close:hover { background: rgba(255,255,255,0.28); }
</style>