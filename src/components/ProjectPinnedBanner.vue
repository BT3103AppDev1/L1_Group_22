<template>
  <div class="ppb-banner">
    <!-- Left: image thumbnail -->
    <div v-if="project.imageUrl" class="ppb-thumb-wrap">
      <img :src="project.imageUrl" :alt="project.title" class="ppb-thumb" />
    </div>
    <div v-else class="ppb-thumb-placeholder">🏠</div>

    <!-- Middle: info -->
    <div class="ppb-info">
      <div class="ppb-label">
        <span class="ppb-pin">📌</span>
        <span class="ppb-label-text">Shared Project</span>
      </div>
      <div class="ppb-title">{{ project.title }}</div>
      <div class="ppb-meta">
        <span v-if="project.category">🧰 {{ project.category }}</span>
        <span v-if="project.location">📍 {{ project.location }}</span>
        <span v-if="project.priceTier" class="ppb-budget">{{ project.priceTier }}</span>
      </div>
      <p v-if="project.description" class="ppb-desc">
        {{ project.description.slice(0, 90) }}{{ project.description.length > 90 ? '…' : '' }}
      </p>
    </div>

    <!-- Right: CTA -->
    <button class="ppb-btn" @click="$emit('view')">
      View Project →
      
    </button>
  </div>
</template>

<script setup>
defineProps({
  project: { type: Object, required: true },
})
defineEmits(['view'])

</script>

<style scoped>
.ppb-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f5f7ff;
  border-bottom: 1px solid #e0e7ff;
  border-left: 4px solid #2254f5;
  flex-shrink: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ── Thumbnail ── */
.ppb-thumb-wrap {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.ppb-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ppb-thumb-placeholder {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 10px;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

/* ── Info ── */
.ppb-info {
  flex: 1;
  min-width: 0;
}

.ppb-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.ppb-pin { font-size: 11px; }

.ppb-label-text {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #2254f5;
}

.ppb-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.ppb-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #6b7280;
  flex-wrap: wrap;
  margin-bottom: 3px;
}

.ppb-budget {
  font-weight: 700;
  color: #ff5a1f;
}

.ppb-desc {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── CTA button ── */
.ppb-btn {
  flex-shrink: 0;
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  line-height: 1.4;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ppb-btn:hover { background: #1a42d4; }

.ppb-btn-arrow {
  font-size: 14px;
  line-height: 1;
}
</style>