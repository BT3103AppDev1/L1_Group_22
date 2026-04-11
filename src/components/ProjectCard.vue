<template>
  <article class="project-card">
    <div class="card-header">
      <div class="header-left">
        <div class="title-row">
          <h2>{{ project.title }}</h2>
          <span v-if="project.urgency" class="tag urgency-tag" :class="urgencyClass(project.urgency)">
            {{ project.urgency }}
          </span>
        </div>
        <div class="meta-top">
          <span>👤 {{ project.homeownerName || 'Unknown' }}</span>
          <span v-if="project.homeownerRating">⭐ {{ project.homeownerRating }}</span>
        </div>
      </div>

      <div class="budget-box">
        <div class="budget-symbol">{{ priceTierSymbol }}</div>
        <div class="budget-range">{{ priceTierRange}}</div>
      </div>
    </div>

    <p class="card-description">{{ project.description }}</p>

    <img
      v-if="project.imageUrl"
      :src="project.imageUrl"
      :alt="project.title"
      class="card-image"
    />

    <div class="meta-bottom">
      <span v-if="project.category">🧰 {{ project.category }}</span>
      <span v-if="project.location">📍 {{ project.location }}</span>
      <span v-if="project.dateLabel">📅 {{ project.dateLabel }}</span>
    </div>

    <div class="card-footer">
      <div class="posted-info">
        <span v-if="project.createdAt">Posted {{ formatDate(project.createdAt) }}</span>
        <span v-if="project.category">
          <template v-if="project.createdAt"> • </template>{{ project.category }}
        </span>
      </div>

      <div class="card-actions">
        <button class="proposal-btn" type="button" @click="$emit('propose', project)">
          Send Proposal
        </button>
        <button class="details-btn" type="button" @click="$emit('details', project)">
          View Details
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

defineEmits(['propose', 'details'])

const priceTierSymbol = computed(() => {
  const tier = props.project.priceTier || ''
  if (tier === '$') return '$'
  if (tier === '$$') return '$$'
  if (tier === '$$$') return '$$$'
  if (tier === '$$$$') return '$$$$'
  // fallback: derive from budgetMin if priceTier not set
  const val = props.project.budgetMin || 0
  if (val < 2000) return '$'
  if (val < 5000) return '$$'
  if (val < 15000) return '$$$'
  return '$$$$'
})

const priceTierRange = computed(() => {
  const tier = props.project.priceTier || ''
  if (tier === '$')    return 'S$0 – S$500'
  if (tier === '$$')   return 'S$500 – S$2,000'
  if (tier === '$$$')  return 'S$2,000 – S$10,000'
  if (tier === '$$$$') return 'S$10,000+'
  return '—'
})

function urgencyClass(urgency) {
  if (urgency === 'Urgent') return 'urgent'
  if (urgency === 'Medium') return 'medium'
  if (urgency === 'Flexible') return 'flexible'
  return ''
}

function formatDate(value) {
  if (!value) return ''
  const date = value.toDate ? value.toDate() : new Date(value)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.project-card {
  background: white;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.header-left {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.title-row h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.tag {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.urgency-tag.urgent   { background: #ffe2e2; color: #cc3d3d; }
.urgency-tag.medium   { background: #fff0bf; color: #9b7900; }
.urgency-tag.flexible { background: #ebf6e9; color: #408c48; }

.meta-top {
  margin-top: 10px;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #4b5563;
  flex-wrap: wrap;
}

.budget-box {
  text-align: right;
  min-width: 90px;
}

.budget-symbol {
  font-size: 32px;
  font-weight: 800;
  color: #ff5a1f;
  line-height: 1;
  margin-bottom: 10px;
}

.budget-range {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

.card-description {
  margin: 16px 0 14px;
  font-size: 15px;
  line-height: 1.5;
  color: #4b5563;
}

.card-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 14px;
  display: block;
}

.meta-bottom {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 14px;
  font-size: 14px;
  color: #4b5563;
}

.card-footer {
  margin-top: 14px;
}

.posted-info {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.proposal-btn {
  flex: 1;
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  width: 50%;
}

.proposal-btn:hover { background: #1a42d4; }

.details-btn {
  background: white;
  color: #2254f5;
  border: 1.5px solid #2254f5;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  width: 50%;
}

.details-btn:hover { background: #f0f4ff; }

@media (max-width: 700px) {
  .card-header { flex-direction: column; }
  .budget-box  { text-align: left; }
  .card-actions { flex-direction: column; }
  .proposal-btn, .details-btn { width: 100%; }
}
</style>