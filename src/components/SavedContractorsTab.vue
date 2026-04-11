<template>
  <h2>Saved Contractors</h2>
  <p class="subtext">Contractors you liked will appear here.</p>

  <div v-if="loading" class="subtext">Loading...</div>

  <div v-else-if="savedContractors.length === 0" class="subtext">
    No saved contractors yet. Heart a contractor on the home page!
  </div>

  <div v-else class="saved-contractor-list">
    <div
      class="saved-contractor-card"
      v-for="c in savedContractors"
      :key="c.id"
    >
      <div class="saved-contractor-top">
        <div>
          <h3>{{ c.fullName }}</h3>
          <p class="subtext">{{ c.skills?.[0] || 'General Contractor' }}</p>
          <div class="saved-contractor-meta">
            <span>📍 {{ c.location || '—' }}</span>
            <span>⭐ {{ c.rating || 'No rating' }}</span>
            <span>🛠️{{ c.yearsExperience ? c.yearsExperience + ' yrs exp' : '' }}</span>
          </div>
        </div>
        <span v-if="c.verified" class="status-badge">Verified</span>
      </div>

      <div class="saved-contractor-actions">
        <button class="primary-btn small-btn" @click="router.push(`/contractor/${c.id}`)">
          View Profile
        </button>
        <button class="secondary-btn small-btn" @click="unsave(c.id)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase.js'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'

const router = useRouter()
const savedContractors = ref([])
const loading = ref(true)

onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  const userSnap = await getDoc(doc(db, 'users', user.uid))
  if (!userSnap.exists()) { loading.value = false; return }

  const ids = userSnap.data().savedContractors || []

  // Fetch each contractor's document in parallel
  const fetches = ids.map(id => getDoc(doc(db, 'users', id)))
  const snaps = await Promise.all(fetches)

  savedContractors.value = snaps
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }))

  loading.value = false
})

async function unsave(contractorId) {
  const user = auth.currentUser
  if (!user) return
  await updateDoc(doc(db, 'users', user.uid), {
    savedContractors: arrayRemove(contractorId)
  })
  savedContractors.value = savedContractors.value.filter(c => c.id !== contractorId)
}
</script>

<style scoped>
.subtext {
  color: #6b7280;
  margin-top: 0;
}

.saved-contractor-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 18px;
}

.saved-contractor-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 22px;
}

.saved-contractor-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.saved-contractor-top h3 {
  margin: 0 0 8px;
}

.saved-contractor-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #4b5563;
  margin-top: 10px;
}

.status-badge {
  background: #dcfce7;
  color: #15803d;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
}

.saved-contractor-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.primary-btn {
  border: none;
  background: #2958ec;
  color: white;
  border-radius: 10px;
  padding: 11px 16px;
  font-weight: 600;
  cursor: pointer;
}

.secondary-btn {
    background: white;
    color: #2958ec;
    border: 1px solid #2958ec;
    border-radius: 10px;
    padding: 10px 16px;
    font-weight: 600;
    cursor: pointer;
  }
</style>