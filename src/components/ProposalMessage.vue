<template>
  <div class="pm-card" :class="isMine ? 'pm-mine' : 'pm-theirs'">

    <!-- Header -->
    <div class="pm-header">
      <div class="pm-header-left">
        <span class="pm-icon">📋</span>
        <span class="pm-label">Proposal Submitted</span>
      </div>
      <span class="pm-status-chip">Pending</span>
    </div>

    <!-- Contractor name -->
    <div class="pm-contractor">{{ proposal.contractorName || 'Contractor' }}</div>

    <!-- Price + Duration row -->
    <div class="pm-details-row">
      <div class="pm-detail-item">
        <span class="pm-detail-icon">$</span>
        <div>
          <div class="pm-detail-label">Estimated Price</div>
          <div class="pm-detail-value">{{ proposal.priceRange }}</div>
        </div>
      </div>
      <div class="pm-detail-item">
        <span class="pm-detail-icon">🕐</span>
        <div>
          <div class="pm-detail-label">Estimated Duration</div>
          <div class="pm-detail-value">{{ proposal.duration }}</div>
        </div>
      </div>
    </div>

    <!-- Cover letter excerpt -->
    <div v-if="proposal.coverLetter" class="pm-cover">
      <div class="pm-cover-label">Cover Letter</div>
      <p class="pm-cover-text">
        {{ proposal.coverLetter.slice(0, 140) }}{{ proposal.coverLetter.length > 140 ? '…' : '' }}
      </p>
    </div>

    <span class="pm-time">{{ time }}</span>
  </div>
</template>

<script setup>
defineProps({
  proposal: { type: Object, required: true },
  isMine:   { type: Boolean, default: false },
  time:     { type: String, default: '' },
})
</script>

<style scoped>
.pm-card {
  width: 280px;
  border-radius: 16px;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 14px 16px 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}

.pm-mine   { background: #1c48e0; }
.pm-theirs { background: #ffffff; border: 1.5px solid #e5e7eb; }

/* ── Header ── */
.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.pm-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pm-icon { font-size: 14px; }

.pm-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pm-mine .pm-label   { color: rgba(255,255,255,0.75); }
.pm-theirs .pm-label { color: #6b7280; }

.pm-status-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}

.pm-mine .pm-status-chip   { background: rgba(255,255,255,0.18); color: #fff; }
.pm-theirs .pm-status-chip { background: #fef9c3; color: #92400e; }

/* ── Contractor name ── */
.pm-contractor {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}

.pm-mine .pm-contractor   { color: #fff; }
.pm-theirs .pm-contractor { color: #111827; }

/* ── Details row ── */
.pm-details-row {
  display: flex;
  gap: 12px;
  background: rgba(0,0,0,0.08);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.pm-mine .pm-details-row   { background: rgba(255,255,255,0.12); }
.pm-theirs .pm-details-row { background: #f9fafb; border: 1px solid #f3f4f6; }

.pm-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex: 1;
}

.pm-detail-icon {
  font-size: 14px;
  margin-top: 1px;
  flex-shrink: 0;
}

.pm-detail-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 2px;
}

.pm-mine .pm-detail-label   { color: rgba(255,255,255,0.6); }
.pm-theirs .pm-detail-label { color: #9ca3af; }

.pm-detail-value {
  font-size: 13px;
  font-weight: 700;
}

.pm-mine .pm-detail-value   { color: #fff; }
.pm-theirs .pm-detail-value { color: #111827; }

/* ── Cover letter ── */
.pm-cover { margin-bottom: 8px; }

.pm-cover-label {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pm-mine .pm-cover-label   { color: rgba(255,255,255,0.7); }
.pm-theirs .pm-cover-label { color: #374151; }

.pm-cover-text {
  font-size: 12px;
  line-height: 1.55;
  margin: 0;
}

.pm-mine .pm-cover-text   { color: rgba(255,255,255,0.82); }
.pm-theirs .pm-cover-text { color: #4b5563; }

/* ── Timestamp ── */
.pm-time {
  display: block;
  font-size: 11px;
  opacity: 0.55;
  text-align: right;
  margin-top: 4px;
}

.pm-mine .pm-time   { color: #fff; }
.pm-theirs .pm-time { color: #6b7280; }
</style>