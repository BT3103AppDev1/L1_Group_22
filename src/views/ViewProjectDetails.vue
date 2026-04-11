<template>
  <div class="detail-page">
    <ToolBarContractor v-if="isContractor" />
    <ToolBarHomeowner v-else />
    <!-- Back nav -->
    <div class="back-bar">
      <button class="back-btn" @click="router.back()">
        <span class="back-arrow">←</span> Back
      </button>
    </div>

    <div v-if="loading" class="detail-body">
      <div class="card">Loading project...</div>
    </div>

    <div class="detail-body" v-else-if="project">

      <!-- ── Header Card ── -->
      <section class="card header-card">
        <div class="header-top">
          <div class="header-left">
            <div class="title-row">
              <h1>{{ project.title }}</h1>
              <span v-if="project.status === 'active'" class="badge badge-invited">Open</span>
              <span v-if="project.urgency" class="badge" :class="urgencyClass(project.urgency)">
                {{ project.urgency }}
              </span>
            </div>

            <div class="homeowner-row">
              <span class="owner-icon">👤</span>
              <span class="owner-name">{{ project.homeownerName || 'Unknown' }}</span>
              <span v-if="project.homeownerRating" class="rating">
                ⭐ {{ project.homeownerRating }}
              </span>
              <span v-if="project.homeownerJobsPosted" class="jobs-posted">
                · {{ project.homeownerJobsPosted }} jobs posted
              </span>
            </div>
          </div>

          <div class="budget-box">
            <div class="budget-symbol">{{ priceTierSymbol }}</div>
            <div class="budget-range">{{ priceTierRange }}</div>
          </div>
        </div>

        <div class="meta-row">
          <span v-if="project.category">🧰 {{ project.category }}</span>
          <span v-if="project.location">📍 {{ project.location }}</span>
          <span v-if="project.dateLabel">📅 Start: {{ project.dateLabel }}</span>
          <span v-if="project.timeline">🕐 Timeline: {{ project.timeline }}</span>
        </div>

        <div class="posted-row">
          <span v-if="project.createdAt">Posted {{ formatDate(project.createdAt) }}</span>
          <span v-if="project.category">
            <template v-if="project.createdAt"> · </template>{{ project.workType || 'Custom Work' }}
          </span>
        </div>

        <div class="header-actions">
          <button class="proposal-btn" v-if="isContractor" @click="router.push(`/contractor/send-proposal/${project.id}`)">
            Send Proposal
          </button>
          <button class="icon-btn" v-if="isContractor" title="Save">♡</button>
        </div>
      </section>

      <!-- ── Inspiration Photos ── -->
      <section class="card" v-if="allImages.length">
        <h2 class="section-title">Inspiration Photos</h2>
        <div class="photo-grid" :class="`photos-${Math.min(allImages.length, 3)}`">
          <img
            v-for="(url, i) in allImages.slice(0, 3)"
            :key="i"
            :src="url"
            :alt="`Inspiration ${i + 1}`"
            class="inspiration-photo"
          />
        </div>
      </section>

      <!-- ── Project Description ── -->
      <section class="card" v-if="project.description">
        <h2 class="section-title">Project Description</h2>
        <p class="description-text">{{ project.description }}</p>
      </section>

      <!-- ── Scope of Work ── -->
      <section class="card" v-if="project.scopeOfWork && project.scopeOfWork.length">
        <h2 class="section-title">Scope of Work</h2>
        <ul class="checklist">
          <li v-for="(item, i) in project.scopeOfWork" :key="i">
            <span class="check-icon">✅</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- ── Requirements ── -->
      <section class="card" v-if="project.requirements && project.requirements.length">
        <h2 class="section-title">Requirements</h2>
        <ul class="checklist">
          <li v-for="(item, i) in project.requirements" :key="i">
            <span class="check-icon check-blue">☑</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import ToolBarContractor from '@/components/ToolBarContractor.vue'
import ToolBarHomeowner from '@/components/ToolBarHomeowner.vue'

const route = useRoute()
const router = useRouter()

const project = ref(null)
const loading = ref(true)
const isContractor = ref(false)

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'portfolioProjects', route.params.id))
    if (snap.exists()) {
      project.value = { id: snap.id, ...snap.data() }
    }
    const userSnap = await getDoc(doc(db, 'users', auth.currentUser?.uid))
    if (userSnap.exists()) {
      isContractor.value = userSnap.data().userType === 'contractor'
    }
  } catch (e) {
    console.error('Failed to load project', e)
  } finally {
    loading.value = false
  }
})

const allImages = computed(() => {
  if (!project.value) return []
  const urls = []
  if (project.value.imageUrl) urls.push(project.value.imageUrl)
  if (Array.isArray(project.value.imageUrls)) {
    project.value.imageUrls.forEach(u => {
      if (u && !urls.includes(u)) urls.push(u)
    })
  }
  return urls
})

const priceTierSymbol = computed(() => {
  if (!project.value) return ''
  const tier = project.value.priceTier || ''
  if (tier === '$')    return '$'
  if (tier === '$$')   return '$$'
  if (tier === '$$$')  return '$$$'
  if (tier === '$$$$') return '$$$$'
  const val = project.value.budgetMin || 0
  if (val < 500)   return '$'
  if (val < 2000)  return '$$'
  if (val < 10000) return '$$$'
  return '$$$$'
})

const priceTierRange = computed(() => {
  if (!project.value) return ''
  const tier = project.value.priceTier || ''
  if (tier === '$')    return 'S$0 – S$500'
  if (tier === '$$')   return 'S$500 – S$2,000'
  if (tier === '$$$')  return 'S$2,000 – S$10,000'
  if (tier === '$$$$') return 'S$10,000+'
  return '—'
})

function urgencyClass(urgency) {
  if (urgency === 'Urgent')   return 'badge-urgent'
  if (urgency === 'Medium')   return 'badge-medium'
  if (urgency === 'Flexible') return 'badge-flexible'
  return ''
}

function formatDate(value) {
  if (!value) return ''
  const date = value.toDate ? value.toDate() : new Date(value)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
* {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.detail-page {
  min-height: 100vh;
  background: #eef2fb;
  padding-bottom: 60px;
}

.back-bar {
  padding: 18px 0 4px 0;
  max-width: 780px;
  margin: 10px auto;
  padding-left: 18px;
}

.back-btn {
  background: none;
  border: none;
  color: #2254f5;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}

.back-btn:hover { text-decoration: underline; }

.detail-body {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.header-top {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.header-left { flex: 1; }

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.title-row h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-invited  { background: #dbeafe; color: #1d4ed8; }
.badge-urgent   { background: #ffe2e2; color: #cc3d3d; }
.badge-medium   { background: #fff0bf; color: #9b7900; }
.badge-flexible { background: #ebf6e9; color: #408c48; }

.homeowner-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  flex-wrap: wrap;
}

.owner-name  { font-weight: 600; color: #1f2937; }
.rating      { color: #f59e0b; font-weight: 600; }
.jobs-posted { color: #6b7280; }

.budget-box {
  text-align: right;
  min-width: 90px;
  flex-shrink: 0;
}

.budget-symbol {
  font-size: 30px;
  font-weight: 800;
  color: #ff5a1f;
  line-height: 1;
}

.budget-range {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.meta-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #4b5563;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
}

.posted-row {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
}

.proposal-btn {
  flex: 1;
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 13px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.proposal-btn:hover { background: #1a42d4; }

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: border-color 0.15s;
  flex-shrink: 0;
}

.icon-btn:hover { border-color: #2254f5; color: #2254f5; }

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
}

.photo-grid {
  display: grid;
  gap: 10px;
  border-radius: 12px;
  overflow: hidden;
}

.photos-1 { grid-template-columns: 1fr; }
.photos-2 { grid-template-columns: 1fr 1fr; }
.photos-3 { grid-template-columns: repeat(3, 1fr); }

.inspiration-photo {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.description-text {
  font-size: 15px;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

.checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.check-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.check-blue { filter: hue-rotate(200deg); }

.bottom-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 18px;
  padding: 18px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.proposal-btn-lg {
  font-size: 15px;
  padding: 14px 20px;
}

@media (max-width: 600px) {
  .header-top { flex-direction: column; }
  .budget-box { text-align: left; }
  .photo-grid { grid-template-columns: 1fr !important; }
  .inspiration-photo { height: 180px; }
}
</style>