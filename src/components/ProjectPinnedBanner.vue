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

    <!-- Right: View + Job action buttons -->
    <div class="ppb-actions">
      <!-- View project -->
      <button class="ppb-btn" @click="$emit('view')">
        View Project <span>→</span>
      </button>

      <!-- ── Job situation action button ── -->

      <!-- HOMEOWNER: none → Offer -->
      <button
        v-if="userType === 'homeowner' && jobSituation === 'none'"
        class="ppb-job-btn ppb-offer"
        @click="$emit('offer')"
      >
        Offer Job
      </button>

      <!-- HOMEOWNER: offered → disabled label -->
      <div v-else-if="userType === 'homeowner' && jobSituation === 'offered'" class="ppb-status-chip ppb-chip-grey">
        Offered ✓
      </div>

      <!-- HOMEOWNER: accepted → disabled label -->
      <div v-else-if="userType === 'homeowner' && jobSituation === 'accepted'" class="ppb-status-chip ppb-chip-grey">
        Accepted ✓
      </div>

      <!-- HOMEOWNER: completed → Confirm Completion -->
      <button
        v-else-if="userType === 'homeowner' && jobSituation === 'completed'"
        class="ppb-job-btn ppb-confirm"
        @click="$emit('confirm'); showReview = true"
      >
        Confirm Completion
      </button>

      <ReviewButton
        v-if="showReview"
        :contractorId="contractorId"
      />

      <!-- HOMEOWNER: reviewed → done label -->
      <div v-else-if="userType === 'homeowner' && jobSituation === 'reviewed'" class="ppb-status-chip ppb-chip-green">
        Review Submitted ✓
      </div>

      <!-- CONTRACTOR: offered → Accept Job -->
      <button
        v-else-if="userType === 'contractor' && jobSituation === 'offered'"
        class="ppb-job-btn ppb-accept"
        @click="$emit('accept')"
      >
        Accept Job
      </button>

      <!-- CONTRACTOR: mark complete -->
      <button
        v-else-if="userType === 'contractor' && jobSituation === 'accepted'"
        class="ppb-job-btn ppb-complete"
        @click="$emit('markComplete')"
      >
        Mark as Completed
      </button>

      <!-- CONTRACTOR: completed → awaiting -->
      <div v-else-if="userType === 'contractor' && jobSituation === 'completed'" class="ppb-status-chip ppb-chip-grey">
        Awaiting Confirmation…
      </div>

      <!-- CONTRACTOR: confirmed or reviewed → done -->
      <div v-else-if="userType === 'contractor' && (jobSituation === 'confirmed' || jobSituation === 'reviewed')" class="ppb-status-chip ppb-chip-green">
        Job Confirmed ✓
      </div>
    </div>
  </div>

  <!-- Review modal (homeowner only, triggered by 'review' emit handled here via internal flag) -->
</template>

<script setup>
import { ref } from 'vue'
import ReviewButton from '@/components/ReviewButton.vue'

const props = defineProps({
  project:      { type: Object,  required: true },
  userType:     { type: String,  required: true },   // 'homeowner' | 'contractor'
  jobSituation: { type: String,  default: 'none' },  // state machine value
  contractorId: { type: String,  default: '' },
  convoId:      { type: String,  default: '' },
})

const emit = defineEmits(['view', 'offer', 'accept', 'markComplete', 'confirm', 'review', 'reviewSubmitted'])

const showReview = ref(false)

// When parent emits 'review' we open the modal internally
function openReview() {
  showReview.value = true
}

// Expose so parent (Chats.vue) can call if needed, but we also handle it via the button directly
defineExpose({ openReview })
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

.ppb-budget { font-weight: 700; color: #ff5a1f; }

.ppb-desc {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Right actions column ── */
.ppb-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 6px;
}

/* View button */
.ppb-btn {
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.ppb-btn:hover { background: #1a42d4; }

/* Job action buttons */
.ppb-job-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s, background 0.15s;
}
.ppb-job-btn:hover { opacity: 0.88; }

.ppb-offer    { background: #2254f5; color: white; }
.ppb-accept   { background: #16a34a; color: white; }
.ppb-complete { background: #2254f5; color: white; }
.ppb-confirm  { background: #ea580c; color: white; }
.ppb-review   { background: #ca8a04; color: white; }

/* Status chips */
.ppb-status-chip {
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.ppb-chip-grey  { background: #f3f4f6; color: #6b7280; }
.ppb-chip-blue  { background: #eff4ff; color: #2254f5; }
.ppb-chip-green { background: #dcfce7; color: #15803d; }
</style>