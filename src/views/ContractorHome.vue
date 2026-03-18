<template>
    <ToolBar/>
      <div class="search-bar-wrapper">
        <div class="search-bar">
          <span class="search-icon">🔎</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search jobs by title, category, or location..."
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
            <h3>Status</h3>
            <label v-for="status in statusOptions" :key="status" class="checkbox-item">
              <input v-model="selectedStatuses" type="checkbox" :value="status" />
              <span>{{ status }}</span>
            </label>
          </section>
  
          <section class="filter-group">
            <h3>Category</h3>
            <label v-for="category in categoryOptions" :key="category" class="checkbox-item">
              <input v-model="selectedCategories" type="checkbox" :value="category" />
              <span>{{ category }}</span>
            </label>
          </section>
  
          <section class="filter-group">
            <h3>Budget</h3>
            <label v-for="budget in budgetOptions" :key="budget.label" class="checkbox-item">
              <input v-model="selectedBudgets" type="checkbox" :value="budget.label" />
              <span>{{ budget.label }}</span>
            </label>
          </section>
  
          <section class="filter-group">
            <h3>Urgency</h3>
            <label v-for="urgency in urgencyOptions" :key="urgency" class="checkbox-item">
              <input v-model="selectedUrgencies" type="checkbox" :value="urgency" />
              <span>{{ urgency }}</span>
            </label>
          </section>
        </aside>
  
        <section class="jobs-section">
          <div class="jobs-header-row">
            <p class="job-count">{{ filteredJobs.length }} jobs available</p>
          </div>
  
          <div v-if="loading" class="empty-state">
            Loading jobs...
          </div>
  
          <div v-else-if="error" class="empty-state error-state">
            {{ error }}
          </div>
  
          <div v-else-if="filteredJobs.length > 0" class="job-list">
            <article v-for="job in filteredJobs" :key="job.id" class="job-card">
              <div class="job-card-header">
                <div class="job-header-left">
                  <div class="title-row">
                    <h2>{{ job.title }}</h2>
  
                    <span
                      v-if="job.status"
                      class="tag status-tag"
                      :class="statusClass(job.status)"
                    >
                      {{ job.status }}
                    </span>
  
                    <span
                      v-if="job.urgency"
                      class="tag urgency-tag"
                      :class="urgencyClass(job.urgency)"
                    >
                      {{ job.urgency }}
                    </span>
                  </div>
  
                  <div class="job-meta-top">
                    <span>👤 {{ job.homeownerName }}</span>
                    <span v-if="job.homeownerRating">⭐ {{ job.homeownerRating }}</span>
                  </div>
                </div>
  
                <div class="job-budget">
                  <div class="budget-symbol">
                    {{ budgetSymbol(job.budgetMin, job.budgetMax) }}
                  </div>
                  <div class="budget-range">
                    {{ showBudget(job.budgetMin, job.budgetMax) }}
                  </div>
                </div>
              </div>
  
              <p class="job-description">
                {{ job.description }}
              </p>
  
              <img
                v-if="job.imageUrl"
                :src="job.imageUrl"
                :alt="job.title"
                class="job-image"
              />
  
              <div class="job-meta-bottom">
                <span v-if="job.category">🧰 {{ job.category }}</span>
                <span v-if="job.location">📍 {{ job.location }}</span>
                <span v-if="job.startDate">📅 Start: {{ showDate(job.startDate) }}</span>
              </div>
  
              <div class="job-footer">
                <div class="job-posted">
                  <span v-if="job.createdAt">Posted {{ showDate(job.createdAt) }}</span>
                  <span v-if="job.projectType">
                    <template v-if="job.createdAt"> • </template>{{ job.projectType }}
                  </span>
                </div>
  
                <div class="job-actions">
                  <button class="proposal-btn" type="button" @click="sendProposal(job)">
                    Send Proposal
                  </button>
                  <button class="details-btn" type="button" @click="viewDetails(job)">
                    View Details
                  </button>
                </div>
              </div>
            </article>
          </div>
  
          <div v-else class="empty-state">
            No jobs available yet.
          </div>
        </section>
      </main>
  </template>
  
  <script setup> 
  import { computed, onMounted, ref } from "vue"
  import { useRouter } from "vue-router"
  import { getAuth, signOut } from "firebase/auth"
  import { collection, getDocs, orderBy, query } from "firebase/firestore"
  import { db } from "@/firebase"
  import reliabuildLogo from "@/assets/reliabuild_logo.jpg"
  import ToolBar from "@/components/ToolBar.vue"
  
  const router = useRouter()
  const auth = getAuth()
  
  const loading = ref(true)
  const error = ref("")
  const jobs = ref([])
  
  const searchQuery = ref("")
  const selectedStatuses = ref([])
  const selectedCategories = ref([])
  const selectedBudgets = ref([])
  const selectedUrgencies = ref([])
  
  const statusOptions = ["New", "Invited", "Proposal Sent"]
  
  const categoryOptions = [
    "Kitchen Renovation",
    "Bathroom",
    "Carpentry",
    "Electrical",
    "Painting",
    "Plumbing",
    "Flooring",
    "General Renovation",
  ]
  
  const budgetOptions = [
    { label: "$ (Under $2,000)", min: 0, max: 2000 },
    { label: "$$ ($2,000 - $5,000)", min: 2000, max: 5000 },
    { label: "$$$ ($5,000 - $15,000)", min: 5000, max: 15000 },
    { label: "$$$$ ($15,000+)", min: 15000, max: Infinity },
  ]
  
  const urgencyOptions = ["Urgent", "Medium", "Flexible"]
  
  onMounted(() => {
    getJobs()
  })
  
  async function getJobs() {
    loading.value = true
    error.value = ""
  
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
  
      jobs.value = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      })
    } catch (err) {
      console.log(err)
      error.value = "Could not load jobs"
    }
  
    loading.value = false
  }
  
  const filteredJobs = computed(() => {
    return jobs.value.filter((job) => {
      const search = searchQuery.value.toLowerCase().trim()
  
      const matchSearch =
        search === "" ||
        (job.title && job.title.toLowerCase().includes(search)) ||
        (job.category && job.category.toLowerCase().includes(search)) ||
        (job.location && job.location.toLowerCase().includes(search)) ||
        (job.description && job.description.toLowerCase().includes(search))
  
      const matchStatus =
        selectedStatuses.value.length === 0 ||
        selectedStatuses.value.includes(job.status)
  
      const matchCategory =
        selectedCategories.value.length === 0 ||
        selectedCategories.value.includes(job.category)
  
      const matchUrgency =
        selectedUrgencies.value.length === 0 ||
        selectedUrgencies.value.includes(job.urgency)
  
      const matchBudget =
        selectedBudgets.value.length === 0 ||
        selectedBudgets.value.some((selected) => {
          const range = budgetOptions.find((b) => b.label === selected)
          const value = job.budgetMin || job.budget || 0
  
          if (!range) return false
          return value >= range.min && value < range.max
        })
  
      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchUrgency &&
        matchBudget
      )
    })
  })
  
  function showBudget(min, max) {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    }
  
    if (min && !max) {
      return `$${min.toLocaleString()}+`
    }
  
    return "Budget not set"
  }
  
  function budgetSymbol(min) {
    const value = min || 0
  
    if (value < 2000) return "$"
    if (value < 5000) return "$$"
    if (value < 15000) return "$$$"
    return "$$$$"
  }
  
  function showDate(value) {
    if (!value) return ""
  
    if (value.toDate) {
      return value.toDate().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }
  
    const date = new Date(value)
    if (!isNaN(date)) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }
  
    return value
  }
  
  function statusClass(status) {
    if (status === "New") return "new"
    if (status === "Invited") return "invited"
    if (status === "Proposal Sent") return "proposal"
    return ""
  }
  
  function urgencyClass(urgency) {
    if (urgency === "Urgent") return "urgent"
    if (urgency === "Medium") return "medium"
    if (urgency === "Flexible") return "flexible"
    return ""
  }
  
  function resetFilters() {
    searchQuery.value = ""
    selectedStatuses.value = []
    selectedCategories.value = []
    selectedBudgets.value = []
    selectedUrgencies.value = []
  }
  
  function sendProposal(job) {
    router.push(`/contractor/send-proposal/${job.id}`)
  }
  
  function viewDetails(job) {
    router.push(`/contractor/job-details/${job.id}`)
  }
  
  function goToProfile() {
    router.push("/contractor/profile")
  }
  
  async function logout() {
    try {
      await signOut(auth)
      router.push("/")
    } catch (err) {
      console.log(err)
    }
  }
  </script>
  
  <style scoped>
  * {
    box-sizing: border-box;
  }

  .search-bar-wrapper {
    background: linear-gradient(90deg, #1f5eff, #1e49db);
    padding: 0 42px 20px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }
  
  .search-bar {
    background: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    height: 42px;
    max-width: 1160px;
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
  
  .jobs-section {
    min-width: 0;
  }
  
  .jobs-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  
  .job-count {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  
  .job-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .job-card {
    background: white;
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }
  
  .job-card-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
  }
  
  .job-header-left {
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
  
  .status-tag.new {
    background: #d9f7df;
    color: #248a3d;
  }
  
  .status-tag.invited {
    background: #dde6ff;
    color: #4767ff;
  }
  
  .status-tag.proposal {
    background: #ececec;
    color: #5d5d5d;
  }
  
  .urgency-tag.urgent {
    background: #ffe2e2;
    color: #cc3d3d;
  }
  
  .urgency-tag.medium {
    background: #fff0bf;
    color: #9b7900;
  }
  
  .urgency-tag.flexible {
    background: #ebf6e9;
    color: #408c48;
  }
  
  .job-meta-top {
    margin-top: 10px;
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #4b5563;
    flex-wrap: wrap;
  }
  
  .job-budget {
    text-align: right;
    min-width: 120px;
  }
  
  .budget-symbol {
    font-size: 32px;
    font-weight: 800;
    color: #ff5a1f;
    line-height: 1;
  }
  
  .budget-range {
    margin-top: 6px;
    font-size: 13px;
    color: #6b7280;
  }
  
  .job-description {
    margin: 16px 0 14px;
    font-size: 15px;
    line-height: 1.5;
    color: #4b5563;
  }
  
  .job-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 14px;
    display: block;
  }
  
  .job-meta-bottom {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 14px;
    font-size: 14px;
    color: #4b5563;
  }
  
  .job-footer {
    margin-top: 14px;
  }
  
  .job-posted {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 12px;
  }
  
  .job-actions {
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
  }
  
  .details-btn {
    background: white;
    color: #2254f5;
    border: 1.5px solid #2254f5;
    border-radius: 10px;
    padding: 12px 18px;
    font-weight: 700;
    cursor: pointer;
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
    .top-header,
    .search-bar-wrapper {
      padding-left: 18px;
      padding-right: 18px;
    }
  
    .top-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  
    .main-content {
      padding: 18px;
    }
  
    .job-card-header {
      flex-direction: column;
    }
  
    .job-budget {
      text-align: left;
    }
  
    .job-actions {
      flex-direction: column;
    }
  
    .details-btn,
    .proposal-btn {
      width: 100%;
    }
  }
  </style>