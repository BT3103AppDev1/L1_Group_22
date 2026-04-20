<template>
  <div class="proposal-card">

    <!-- Top row: contractor info + status + view profile -->
    <div class="pc-top">
      <div class="pc-contractor-info">
        <img :src="proposal.contractorPhoto || defaultAvatar" class="pc-avatar" />
        <div>
          <div class="pc-contractor-name">
            {{ proposal.contractorName }}
            <span class="pc-status-chip">{{ proposal.status || 'Pending' }}</span>
          </div>
          <div class="pc-meta-row">
            <span v-if="proposal.contractorRating">⭐ {{ proposal.contractorRating }}</span>
            <span v-if="proposal.contractorLocation">📍 {{ proposal.contractorLocation }}</span>
            <span v-if="proposal.submittedDate">🗓 Submitted {{ proposal.submittedDate }}</span>
          </div>
        </div>
      </div>
      <button class="pc-profile-btn" @click="$emit('viewProfile')">View Profile</button>
    </div>

    <div class="pc-divider" />

    <!-- Price + Duration -->
    <div class="pc-details-row">
      <div class="pc-detail-item">
        <span class="pc-detail-icon">$</span>
        <div>
          <div class="pc-detail-label">Estimated Price</div>
          <div class="pc-detail-value">{{ proposal.priceRange }}</div>
        </div>
      </div>
      <div class="pc-detail-item">
        <span class="pc-detail-icon">🕐</span>
        <div>
          <div class="pc-detail-label">Estimated Duration</div>
          <div class="pc-detail-value">{{ proposal.duration }}</div>
        </div>
      </div>
    </div>

    <!-- Cover letter -->
    <div class="pc-cover-section">
      <div class="pc-cover-label">Cover Letter</div>
      <p class="pc-cover-text">{{ proposal.coverLetter }}</p>
    </div>

    <!-- Actions -->
    <div v-if="!readonly" class="pc-actions">
        <button class="pc-message-btn" @click="$emit('message')">
             Message Contractor
        </button>
        <button class="pc-decline-btn" @click="$emit('decline')">Decline</button>
    </div>

  </div>
</template>

<script setup>
  import defaultAvatar from '@/assets/default-avatar.png'

  defineProps({
    proposal: { type: Object, required: true },
    readonly: { type: Boolean, default: false }
  })
  defineEmits(['message', 'viewProfile', 'decline'])
</script>

<style scoped>
  .proposal-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 22px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: box-shadow 0.2s;
    margin: 10px
  }

  .proposal-card:hover { 
    box-shadow: 0 6px 20px rgba(0,0,0,0.07); 
  }

  /* Top row  */
  .pc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .pc-contractor-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pc-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .pc-contractor-name {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }

  .pc-status-chip {
    font-size: 12px;
    font-weight: 600;
    background: #fef9c3;
    color: #92400e;
    border-radius: 999px;
    padding: 3px 10px;
  }

  .pc-meta-row {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #6b7280;
    flex-wrap: wrap;
  }

  .pc-profile-btn {
    flex-shrink: 0;
    background: white;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: border-color 0.15s;
    white-space: nowrap;
  }

  .pc-profile-btn:hover { 
    border-color: #2254f5; color: #2254f5; 
  }

  /* Divider */
  .pc-divider {
    height: 1px;
    background: #f3f4f6;
    margin: 0 -22px;
  }

  /* Details row */
  .pc-details-row {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
  }

  .pc-detail-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .pc-detail-icon {
    font-size: 18px;
    color: #2254f5;
    margin-top: 1px;
  }

  .pc-detail-label {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 2px;
  }

  .pc-detail-value {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
  }

  /* Cover letter */
  .pc-cover-label {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
  }

  .pc-cover-text {
    font-size: 14px;
    color: #374151;
    line-height: 1.65;
    margin: 0;
  }

  /* Actions */
  .pc-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .pc-message-btn {
    flex: 3;
    background: #2254f5;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 13px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pc-message-btn:hover { 
    background: #1a42d4; 
  }

  .pc-decline-btn {
    flex: 1;
    background: white;
    border: 1.5px solid #ef4444;
    border-radius: 10px;
    padding: 13px 20px;
    font-size: 14px;
    font-weight: 600;
    color: #ef4444;
    cursor: pointer;
    transition: background 0.15s;
    text-align: center;
  }

  .pc-decline-btn:hover { 
    background: #fef2f2; 
  }
</style>