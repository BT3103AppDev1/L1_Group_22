```vue
<template>
  <div class="section-header">
    <h2>My Portfolio</h2>
    <button class="primary-btn" @click="showAddForm = true">+ Add Project</button>
  </div>

  <div v-if="showAddForm" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Add Project</h3>
        <button class="close-btn" @click="closeForm">×</button>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Project Title</label>
          <input v-model="newProject.title" type="text" />
        </div>

        <div class="field">
          <label>Description</label>
          <textarea v-model="newProject.description" rows="4"></textarea>
        </div>

        <div class="field">
          <label>Category</label>
          <input v-model="newProject.category" type="text" />
        </div>

        <div class="field">
          <label>Location</label>
          <input v-model="newProject.location" type="text" />
        </div>

        <div class="field">
          <label>Date Label</label>
          <input v-model="newProject.dateLabel" type="text" placeholder="e.g. Jan 2024" />
        </div>

        <div class="field">
          <label>Price Tier</label>
          <select v-model="newProject.priceTier">
            <option value="">Select</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>
        </div>

        <div class="field">
          <label>Image URL</label>
          <input v-model="newProject.imageUrl" type="text" placeholder="Paste image URL" />
        </div>
      </div>

      <div class="form-actions">
        <button class="full-outline-btn" @click="closeForm">Cancel</button>
        <button class="primary-btn" @click="saveNewProject">Save Project</button>
      </div>
    </div>
  </div>

  <div v-if="loading" class="status-text">Loading projects...</div>
  <div v-else-if="errorMessage" class="status-text error-text">{{ errorMessage }}</div>
  <div v-else-if="portfolioProjects.length === 0" class="status-text">
    No portfolio projects yet.
  </div>

  <div v-else class="portfolio-grid">
    <div class="project-card" v-for="project in portfolioProjects" :key="project.id">
      <img
        :src="project.imageUrl || fallbackImage"
        :alt="project.title"
        class="project-image"
      />

      <div class="project-body">
        <div class="project-title-row">
          <h3>{{ project.title }}</h3>
          <span class="price-mark">{{ project.priceTier }}</span>
        </div>

        <p class="project-desc">{{ project.description }}</p>

        <div class="project-tags">
          <span class="small-tag">{{ project.category }}</span>
          <span class="small-tag">{{ project.location }}</span>
          <span class="small-tag">{{ project.dateLabel }}</span>
        </div>

        <button class="full-outline-btn">Edit Project</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue"
import { auth, db } from "@/firebase.js"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore"

const portfolioProjects = ref([])
const loading = ref(true)
const errorMessage = ref("")
const showAddForm = ref(false)

const fallbackImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"

const newProject = reactive({
  title: "",
  description: "",
  category: "",
  location: "",
  dateLabel: "",
  priceTier: "",
  imageUrl: "",
})

function resetForm() {
  newProject.title = ""
  newProject.description = ""
  newProject.category = ""
  newProject.location = ""
  newProject.dateLabel = ""
  newProject.priceTier = ""
  newProject.imageUrl = ""
}

function closeForm() {
  resetForm()
  showAddForm.value = false
}

async function loadPortfolioProjects() {
  try {
    loading.value = true
    errorMessage.value = ""

    const user = auth.currentUser
    if (!user) {
      errorMessage.value = "No logged-in user found."
      return
    }

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      errorMessage.value = "User profile not found."
      return
    }

    const userData = userSnap.data()

    if (userData.userType !== "contractor") {
      errorMessage.value = "Only contractor accounts can view portfolio projects."
      return
    }

    const q = query(
      collection(db, "portfolioProjects"),
      where("contractorId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(q)

    portfolioProjects.value = snapshot.docs.map((projectDoc) => ({
      id: projectDoc.id,
      ...projectDoc.data(),
    }))
  } catch (error) {
    console.error("Error loading portfolio projects:", error)
    errorMessage.value = "Failed to load portfolio projects."
  } finally {
    loading.value = false
  }
}

async function saveNewProject() {
  try {
    errorMessage.value = ""

    const user = auth.currentUser
    if (!user) {
      errorMessage.value = "No logged-in user found."
      return
    }

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      errorMessage.value = "User profile not found."
      return
    }

    const userData = userSnap.data()

    if (userData.userType !== "contractor") {
      errorMessage.value = "Only contractors can add portfolio projects."
      return
    }

    if (
      !newProject.title.trim() ||
      !newProject.description.trim() ||
      !newProject.category.trim() ||
      !newProject.location.trim() ||
      !newProject.dateLabel.trim() ||
      !newProject.priceTier.trim()
    ) {
      errorMessage.value = "Please fill in all required fields."
      return
    }

    await addDoc(collection(db, "portfolioProjects"), {
      contractorId: user.uid,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      category: newProject.category.trim(),
      location: newProject.location.trim(),
      dateLabel: newProject.dateLabel.trim(),
      priceTier: newProject.priceTier.trim(),
      imageUrl: newProject.imageUrl.trim() || fallbackImage,
      createdAt: serverTimestamp(),
    })

    closeForm()
    await loadPortfolioProjects()
  } catch (error) {
    console.error("Error saving new project:", error)
    errorMessage.value = "Failed to save project."
  }
}

onMounted(() => {
  loadPortfolioProjects()
})
</script>

<style scoped>
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.section-header h2 {
  margin: 0 0 10px;
  font-size: 20px;
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

.project-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: white;
}

.project-image {
  width: 100%;
  height: 210px;
  object-fit: cover;
  display: block;
}

.project-body {
  padding: 16px;
}

.project-title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.project-title-row h3 {
  margin: 0;
  font-size: 18px;
}

.price-mark {
  color: #ff5b1f;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.project-desc {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0 12px;
}

.project-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.small-tag {
  background: #f3f4f6;
  color: #4b5563;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.full-outline-btn {
  width: 100%;
  border: 1px solid #2958ec;
  color: #2958ec;
  background: white;
  border-radius: 10px;
  padding: 11px 14px;
  font-weight: 600;
  cursor: pointer;
}

.status-text {
  padding: 18px 0;
  color: #6b7280;
  font-size: 14px;
}

.error-text {
  color: #dc2626;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  width: min(680px, 92vw);
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 26px;
  cursor: pointer;
}

.form-grid {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>
```
