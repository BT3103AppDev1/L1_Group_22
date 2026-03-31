<template>
  <ToolBarHomeowner/>
  <div class="search-bar-wrapper">
    <div class="search-bar">
      <span class="search-icon">🔎</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search contractors by name, specialty, or location..."
      />
    </div>
  </div>

  <main class="main-content">
    <aside class="filters-panel">
      <div class="filters-header">
        <h2>Filters</h2>
        <button class="reset-btn" type="button" @click="resetFilters">Reset</button>
      </div>

      <section class="filter-group">
        <h3>Specialty</h3>
        <label v-for="category in categoryOptions" :key="category" class="checkbox-item">
          <input v-model="selectedCategories" type="checkbox" :value="category" />
          <span>{{ category }}</span>
        </label>
      </section>

      <section class="filter-group">
        <h3>Min. Rating</h3>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          v-model.number="minRating"
          class="rating-slider"
        />
        <div class="slider-labels">
          <span>Any</span>
          <span>{{ minRating > 0 ? minRating + '+ stars' : '0+ stars' }}</span>
        </div>
      </section>

      <section class="filter-group">
        <h3>Price Estimate</h3>
        <label v-for="budget in budgetOptions" :key="budget.label" class="checkbox-item">
          <input v-model="selectedBudgets" type="checkbox" :value="budget.label" />
          <span>{{ budget.label }}</span>
        </label>
      </section>

      <section class="filter-group">
        <label class="checkbox-item">
          <input v-model="verifiedOnly" type="checkbox" />
          <span>Verified Contractors Only</span>
        </label>
      </section>
    </aside>

    <section class="contractors-section">
      <div class="section-header-row">
        <div>
          <h1 class="section-title">{{ filteredContractors.length }} Contractors Found</h1>
          <p class="section-subtitle">Find the perfect contractor for your home project</p>
        </div>
      </div>

      <div v-if="loadingContractors" class="empty-state">
        Loading contractors...
      </div>

      <div v-else-if="contractorError" class="empty-state error-state">
        {{ contractorError }}
      </div>

      <div v-else-if="filteredContractors.length > 0" class="contractor-list">
        <ContractorCard
          v-for="contractor in filteredContractors"
          :key="contractor.id"
          :contractor="contractor"
          @contact="handleContact"
          @view-profile="handleViewProfile"
        />
      </div>

      <div v-else class="empty-state">
        No contractors found matching your filters.
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { getAuth } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
import ContractorCard from "@/components/ContractorCard.vue"

const router = useRouter()
const auth = getAuth()

const searchQuery = ref("")
const selectedCategories = ref([])
const selectedBudgets = ref([])
const minRating = ref(0)
const verifiedOnly = ref(false)

// Contractors state
const loadingContractors = ref(true)
const contractorError = ref("")
const contractors = ref([])

const categoryOptions = [
  "General Contractor",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Roofer",
  "HVAC Technician",
  "Mason",
]

const budgetOptions = [
  { label: "$ (Under $2,000)", min: 0, max: 2000 },
  { label: "$$ ($2,000 - $5,000)", min: 2000, max: 5000 },
  { label: "$$$ ($5,000 - $15,000)", min: 5000, max: 15000 },
  { label: "$$$$ ($15,000+)", min: 15000, max: Infinity },
]

onMounted(() => {
  getContractors()
})

async function getContractors() {
  loadingContractors.value = true
  contractorError.value = ""

  try {
    const q = query(
      collection(db, "users"),
      where("userType", "==", "contractor")
    )
    const snapshot = await getDocs(q)

    contractors.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (err) {
    console.error(err)
    contractorError.value = "Could not load contractors"
  }

  loadingContractors.value = false
}

const filteredContractors = computed(() => {
  return contractors.value.filter((c) => {
    const search = searchQuery.value.toLowerCase().trim()

    const matchSearch =
      search === "" ||
      (c.fullName && c.fullName.toLowerCase().includes(search)) ||
      (c.location && c.location.toLowerCase().includes(search)) ||
      (c.skills && c.skills.some((s) => s.toLowerCase().includes(search)))

    const matchCategory =
      selectedCategories.value.length === 0 ||
      (c.skills && c.skills.some((s) => selectedCategories.value.includes(s)))

    const matchRating =
      minRating.value === 0 || (c.rating && c.rating >= minRating.value)

    const matchBudget =
      selectedBudgets.value.length === 0 ||
      selectedBudgets.value.some((selected) => {
        const range = budgetOptions.find((b) => b.label === selected)
        const value = c.budgetMin || c.budget || c.hourlyRate || 0
        if (!range) return false
        return value >= range.min && value < range.max
      })

    const matchVerified = !verifiedOnly.value || c.verified === true

    return matchSearch && matchCategory && matchRating && matchBudget && matchVerified
  })
})

function resetFilters() {
  searchQuery.value = ""
  selectedCategories.value = []
  selectedBudgets.value = []
  minRating.value = 0
  verifiedOnly.value = false
}

function handleContact(contractor) {
  router.push({ name: "ContractorContact", params: { id: contractor.id } })
}

function handleViewProfile(contractor) {
  router.push({ name: "ContractorProfile", params: { id: contractor.id } })
}
</script>

<style scoped>
.search-bar-wrapper {
  padding: 18px 28px 0;
  background: #f3f4f6;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.search-bar {
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 42px;
}

.search-icon {
  margin-right: 8px;
  opacity: 0.6;
}

.search-bar input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  background: transparent;
}

.main-content {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 24px;
  padding: 20px 28px 40px;
  align-items: start;
  background: #f3f4f6;
  min-height: 100vh;
}

.filters-panel {
  background: #fff;
  border-radius: 18px;
  padding: 24px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 20px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filters-header h2 {
  margin: 0;
  font-size: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.reset-btn {
  background: none;
  border: none;
  color: #2d5bff;
  cursor: pointer;
  font-weight: 600;
}

.filter-group {
  margin-bottom: 28px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.filter-group h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 15px;
  cursor: pointer;
}

.checkbox-item input {
  width: 16px;
  height: 16px;
}

.rating-slider {
  width: 100%;
  accent-color: #2254f5;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
}

/* Contractors section */
.contractors-section {
  min-width: 0;
}

.section-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.section-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7280;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.contractor-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.error-state {
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    position: static;
  }
}

@media (max-width: 700px) {
  .search-bar-wrapper,
  .main-content {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>