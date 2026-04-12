<template>
  <div class="opportunity-card">

    <!-- Image strip -->
    <div v-if="job.imageUrl" class="card-image-wrap">
      <img :src="job.imageUrl" :alt="job.title" class="card-image" />
      <span class="status-badge">{{ job.status }}</span>
    </div>

    <!-- No-image fallback -->
    <div v-else class="card-no-image-header">
      <div class="card-no-image-placeholder">🏠</div>
      <span class="status-badge">{{ job.status }}</span>
    </div>

    <!-- Body -->
    <div class="card-body">
      <h3 class="card-title">{{ job.title }}</h3>
      <p class="card-posted-by">Posted by {{ job.homeowner }}</p>

      <div class="opportunity-meta">
        <span v-if="job.location">📍 {{ job.location }}</span>
        <span v-if="job.budget" class="budget-chip">{{ job.budget }}</span>
        <span v-if="job.date">🗓 {{ job.date }}</span>
      </div>

      <p v-if="job.description" class="card-desc">
        {{ job.description.slice(0, 120) }}{{ job.description.length > 120 ? '…' : '' }}
      </p>

      <div class="opportunity-actions">
        <button class="primary-btn" @click="$emit('proposal', job)">Send Proposal</button>
        <button class="secondary-btn" @click="$emit('details', job)">View Details</button>
        <button class="contact-btn" @click="$emit('contact', job)">💬 Contact</button>
      </div>
    </div>

  </div>
</template>

<script setup>
defineProps({
  job: { type: Object, required: true },
})
defineEmits(['proposal', 'details', 'contact'])

</script>

<style scoped>
.opportunity-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  transition: box-shadow 0.2s;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.opportunity-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* ── Image strip ── */
.card-image-wrap {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-image-wrap .status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* ── No-image fallback ── */
.card-no-image-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.card-no-image-placeholder {
  font-size: 28px;
}

/* ── Body ── */
.card-body {
  padding: 18px 20px;
}

.card-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.card-posted-by {
  margin: 0 0 10px;
  font-size: 13px;
  color: #6b7280;
}

/* ── Status badge ── */
.status-badge {
  background: #dcfce7;
  color: #15803d;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Meta row ── */
.opportunity-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 10px;
  align-items: center;
}

.budget-chip {
  font-weight: 700;
  color: #ff5a1f;
  background: #fff3ee;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 13px;
}

/* ── Description ── */
.card-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
  margin: 0 0 16px;
}

/* ── Actions ── */
.opportunity-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn {
  border: none;
  background: #2254f5;
  color: white;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.primary-btn:hover { background: #1a42d4; }

.secondary-btn {
  border: 1px solid #d1d5db;
  background: white;
  color: #111827;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.secondary-btn:hover { border-color: #2254f5; color: #2254f5; }

.contact-btn {
  border: 1px solid #e0e7ff;
  background: #eff4ff;
  color: #2254f5;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.contact-btn:hover { background: #dbeafe; border-color: #2254f5; }
</style>