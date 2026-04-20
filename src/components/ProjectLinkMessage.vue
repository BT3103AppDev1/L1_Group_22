<template>
  <div class="plm-card" :class="isMine ? 'plm-mine' : 'plm-theirs'">
    <!-- Image -->
    <div v-if="snapshot.imageUrl" class="plm-image-wrap">
      <img :src="snapshot.imageUrl" :alt="snapshot.title" class="plm-image" />
      <div class="plm-image-overlay">
        <span class="plm-tag">🏠 Project</span>
      </div>
    </div>

    <!-- No image fallback header -->
    <div v-else class="plm-no-image-header">
      <span class="plm-tag-plain">🏠 Project Shared</span>
    </div>

    <!-- Body -->
    <div class="plm-body">
      <div class="plm-title">{{ snapshot.title }}</div>

      <div class="plm-meta">
        <span v-if="snapshot.category" class="plm-meta-item">
          <span class="plm-meta-icon">🧰</span>{{ snapshot.category }}
        </span>
        <span v-if="snapshot.location" class="plm-meta-item">
          <span class="plm-meta-icon">📍</span>{{ snapshot.location }}
        </span>
        <span v-if="snapshot.priceTier" class="plm-budget">{{ snapshot.priceTier }}</span>
      </div>

      <p v-if="snapshot.description" class="plm-desc">
        {{ snapshot.description.slice(0, 110) }}{{ snapshot.description.length > 110 ? '…' : '' }}
      </p>

      <button class="plm-cta" @click="$emit('view')">
        View Full Project <span class="plm-arrow">→</span>
      </button>
    </div>

    <span class="plm-time">{{ time }}</span>
  </div>
</template>

<script setup>
  defineProps({
    snapshot: { type: Object, required: true },
    isMine:   { type: Boolean, default: false },
    time:     { type: String, default: '' },
  })
  defineEmits(['view'])
</script>

<style scoped>
  .plm-card {
    width: 260px;
    border-radius: 16px;
    overflow: hidden;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  }

  /* ── Sender variants ── */
  .plm-mine  { 
    background: #1c48e0; 
  }
  .plm-theirs { 
    background: #ffffff; border: 1.5px solid #e5e7eb; 
  }

  /* ── Image strip ── */
  .plm-image-wrap {
    position: relative;
    height: 130px;
    overflow: hidden;
  }

  .plm-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .plm-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 55%);
    padding: 10px 12px;
  }

  .plm-tag {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(4px);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 3px 9px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.3);
  }

  /* No-image fallback header */
  .plm-no-image-header {
    padding: 12px 14px 0;
  }

  .plm-tag-plain {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    opacity: 0.65;
  }

  .plm-mine  .plm-tag-plain { 
    color: rgba(255,255,255,0.9); 
  }
  .plm-theirs .plm-tag-plain { 
    color: #6b7280; 
  }

  /* ── Body ── */
  .plm-body {
    padding: 12px 14px 10px;
  }

  .plm-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 6px;
    line-height: 1.3;
  }

  .plm-mine  .plm-title { 
    color: #fff; 
  }
  .plm-theirs .plm-title { 
    color: #111827; 
  }

  .plm-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 8px;
    align-items: center;
  }

  .plm-mine  .plm-meta { 
    color: rgba(255,255,255,0.75); 
  }
  .plm-theirs .plm-meta { 
    color: #6b7280; 
  }

  .plm-meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .plm-meta-icon { 
    font-size: 12px; 
  }

  .plm-budget {
    font-weight: 800;
    font-size: 13px;
    background: rgba(255,255,255,0.15);
    border-radius: 6px;
    padding: 1px 7px;
  }

  .plm-mine  .plm-budget { 
    color: #ffd59e; background: rgba(255,255,255,0.12); 
  }
  .plm-theirs .plm-budget {
    color: #ff5a1f; background: #fff3ee; 
  }

  .plm-desc {
    font-size: 12px;
    line-height: 1.55;
    margin: 0 0 10px;
  }

  .plm-mine  .plm-desc { 
    color: rgba(255,255,255,0.8); 
  }
  .plm-theirs .plm-desc { 
    color: #4b5563; 
  }

  .plm-cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 9px 0;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
  }

  .plm-mine .plm-cta {
    background: rgba(255,255,255,0.18);
    color: #fff;
  }
  .plm-mine .plm-cta:hover { 
    background: rgba(255,255,255,0.28); 
  }

  .plm-theirs .plm-cta {
    background: #2254f5;
    color: #fff;
  }
  .plm-theirs .plm-cta:hover { 
    background: #1a42d4; 
  }

  .plm-arrow { 
    font-size: 14px; 
  }

  /* ── Timestamp ── */
  .plm-time {
    display: block;
    font-size: 11px;
    padding: 0 14px 10px;
    text-align: right;
    opacity: 0.55;
  }

  .plm-mine  .plm-time { 
    color: #fff; 
  }
  .plm-theirs .plm-time { 
    color: #6b7280; 
  }
</style>