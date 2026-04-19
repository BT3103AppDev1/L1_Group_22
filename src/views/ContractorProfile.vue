<template>
  <ToolBarContractor v-if="isOwner" />
  <ToolBarHomeowner v-else />

  <div class="page-content">
    <section class="profile-card">
      <template v-if="!editing">
        <div class="profile-top">
          <div class="avatar-wrap">
            <img v-if="photoURL" :src="photoURL" class="avatar-photo" />
            <div v-else class="avatar">{{ contractor.initial }}</div>
          </div>

          <div class="profile-main">
            <div class="name-row">
              <h1>{{ contractor.fullName }}</h1>
              <span class="verified">✓</span>
            </div>

            <p class="company">{{ contractor.company }}</p>

            <div class="rating-row">
              <template v-if="contractor.reviewCount > 0">
                <span class="star">★</span>
                <span>{{ contractor.rating }}</span>
                <span class="muted">({{ contractor.reviewCount }} reviews)</span>
                <span class="dot">•</span>
              </template>
              <template v-else>
                <span class="muted">No reviews yet</span>
                <span class="dot">•</span>
              </template>
              <span class="muted">{{ contractor.projectsCompleted }} projects completed</span>
            </div>

            <div class="info-grid">
              <div class="info-item">✉ {{ contractor.email }}</div>
              <div class="info-item">📞 {{ contractor.phone }}</div>
              <div class="info-item">📍 {{ contractor.location }}</div>
              <div class="info-item">👤 {{ contractor.yearsExperience }} years experience</div>
            </div>

            <div class="skills-section">
              <div class="skills-title">Skills & Specializations</div>
              <div class="skill-list">
                <span v-for="skill in contractor.skills" :key="skill" class="skill-pill">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>

          <!-- Only show Edit Profile button if this is the contractor viewing their own profile -->
          <div class="edit-wrap" v-if="isOwner">
            <button class="outline-btn" @click="editing = true">Edit Profile</button>
          </div>
          <div class="dashboard-numbers" v-if="isOwner">
          <div class="dashboard-stat">
            <h1 class="stat-total">{{ projectStats.total }}</h1>
            <div class="stat-label">Total Projects</div>
          </div>
          <div class="dashboard-stat">
            <h1 class="stat-portfolio">{{ projectStats.portfolio }}</h1>
            <div class="stat-label">Your Portfolio</div>
          </div>
          <div class="dashboard-stat">
            <h1 class="stat-progress">{{ projectStats.inProgress }}</h1>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="dashboard-stat">
            <h1 class="stat-completed">{{ projectStats.completed }}</h1>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        </div>
      </template>

      <template v-else>
        <div class="edit-layout">
          <div class="avatar-wrap">
            <img v-if="photoURL" :src="photoURL" class="avatar-photo" />
            <div v-else class="avatar">{{ editForm.initial }}</div>
            <button class="photo-upload-btn" @click="photoInput.click()" :disabled="photoUploading">
              {{ photoUploading ? '…' : '📷' }}
            </button>
            <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
          </div>

          <div class="edit-main">
            <div class="form-grid">
              <div class="field">
                <label>Full Name</label>
                <input v-model="editForm.fullName" type="text" />
              </div>

              <div class="field">
                <label>Company Name</label>
                <input v-model="editForm.company" type="text" />
              </div>

              <div class="field">
                <label>Email</label>
                <input v-model="editForm.email" type="text" />
              </div>

              <div class="field">
                <label>Phone</label>
                <input v-model="editForm.phone" type="text" />
              </div>

              <div class="field">
                <label>Location</label>
                <input v-model="editForm.location" type="text" />
              </div>

              <div class="field">
                <label>Years of Experience</label>
                <input v-model="editForm.yearsExperience" type="number" />
              </div>
            </div>
            <div class="field">
              <label>Price Tier</label>
              <select v-model="editForm.priceTier">
                <option value="">Select tier</option>
                <option value="$">$ (Under $2,000)</option>
                <option value="$$">$$ ($2,000 - $5,000)</option>
                <option value="$$$">$$$ ($5,000 - $15,000)</option>
                <option value="$$$$">$$$$ ($15,000+)</option>
              </select>
            </div>

            <div class="skill-editor">
              <label>Skills & Specializations</label>

              <!-- Preset checkboxes -->
              <div class="skill-checkboxes">
                <label
                  v-for="skill in SKILL_OPTIONS"
                  :key="skill"
                  class="skill-checkbox-item"
                  :class="{ selected: editForm.skills.includes(skill) }"
                >
                  <input
                    type="checkbox"
                    :checked="editForm.skills.includes(skill)"
                    @change="togglePresetSkill(skill)"
                  />
                  {{ skill }}
                </label>
              </div>

              <!-- Custom skill input -->
              <div class="custom-skill-label">Other skills not listed above:</div>
              <div class="add-skill-row">
                <input
                  v-model="newSkill"
                  type="text"
                  placeholder="Type a skill and press Enter or +"
                  @keyup.enter="addSkill"
                />
                <button class="square-btn" type="button" @click="addSkill">+</button>
              </div>

              <!-- All selected skills displayed as removable pills -->
              <div class="skill-list editable-skills">
                <span
                  v-for="(skill, index) in editForm.skills"
                  :key="skill + index"
                  class="skill-pill"
                >
                  {{ skill }}
                  <button class="remove-skill" type="button" @click="removeSkill(index)">×</button>
                </span>
              </div>
            </div>

            <div class="edit-actions">
              <button class="save-btn" @click="saveProfile">Save Changes</button>
              <button class="cancel-btn" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>
      </template>
    </section>

    <section class="content-card">
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'portfolio' }"
          @click="activeTab = 'portfolio'"
        >
          Portfolio
        </button>
        <!-- Hide Opportunities tab when a homeowner is viewing -->
        <button
          v-if="isOwner"
          class="tab-btn"
          :class="{ active: activeTab === 'opportunities' }"
          @click="activeTab = 'opportunities'"
        >
          Opportunities
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'reviews' }"
          @click="activeTab = 'reviews'"
        >
          Reviews
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'portfolio'">
          <PortfolioTab :contractorId="profileUid" @project-added="loadProjectStats"/>
        </div>

        <div v-if="activeTab === 'opportunities' && isOwner">
          <OpportunitiesTab />
        </div>

        <div v-if="activeTab === 'reviews'">
          <ReviewsTab :contractorId="profileUid" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue"
import { useRoute } from "vue-router"
import { auth, db } from "@/firebase.js"
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"

import ToolBarContractor from "@/components/ToolBarContractor.vue"
import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
import PortfolioTab from "@/components/PortfolioTab.vue"
import OpportunitiesTab from "@/components/OpportunitiesTab.vue"
import ReviewsTab from "@/components/ReviewsTab.vue"

const SKILL_OPTIONS = [
  "Kitchen Renovation",
  "Bathroom",
  "Carpentry",
  "Electrical",
  "Painting",
  "Plumbing",
  "Flooring",
  "General Renovation",
]


const route = useRoute()

// If a contractorId param is in the URL, a homeowner is viewing someone else's profile.
// If no param, the contractor is viewing their own profile.
const profileUid = computed(() =>
  route.params.contractorId || auth.currentUser?.uid
)

const isOwner = computed(() =>
  !route.params.contractorId || route.params.contractorId === auth.currentUser?.uid
)

const activeTab = ref("portfolio")
const editing = ref(false)
const newSkill = ref("")
const photoURL = ref("")
const photoUploading = ref(false)
const photoInput = ref(null)

const projectStats = reactive({
  total: 0,
  portfolio: 0,
  inProgress: 0,
  completed: 0,
})

const contractor = reactive({
  initial: "",
  fullName: "",
  company: "",
  rating: null,
  reviewCount: 0,
  projectsCompleted: 0,
  email: "",
  phone: "",
  location: "",
  yearsExperience: 0,
  skills: [],
  priceTier: '',
})

const editForm = reactive({
  initial: "",
  fullName: "",
  company: "",
  email: "",
  phone: "",
  location: "",
  yearsExperience: 0,
  skills: [],
  priceTier: '',
})

const customSkills = computed(() =>
  editForm.skills.filter(s => !SKILL_OPTIONS.includes(s))
)

async function loadProjectStats() {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'portfolioProjects'),
        where('contractorId', '==', profileUid.value)
      )
    )

    projectStats.total = snap.size
    projectStats.portfolio = 0
    projectStats.inProgress = 0
    projectStats.completed = 0

    snap.docs.forEach((d) => {
      const status = d.data().status
      if (status === 'portfolio') projectStats.portfolio++
      else if (status === 'inProgress') projectStats.inProgress++
      else if (status === 'completed') projectStats.completed++
    })
  } catch (e) {
    console.error('Failed to load project stats', e)
  }
}

function togglePresetSkill(skill) {
  const idx = editForm.skills.indexOf(skill)
  if (idx === -1) {
    editForm.skills.push(skill)
  } else {
    editForm.skills.splice(idx, 1)
  }
}

function syncEditForm() {
  editForm.initial = contractor.initial
  editForm.fullName = contractor.fullName
  editForm.company = contractor.company
  editForm.email = contractor.email
  editForm.phone = contractor.phone
  editForm.location = contractor.location
  editForm.yearsExperience = contractor.yearsExperience
  editForm.skills = [...contractor.skills]
  editForm.priceTier = contractor.priceTier
}

async function loadContractorProfile() {
  try {
    const userRef = doc(db, "users", profileUid.value)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const data = userSnap.data()

    contractor.fullName = data.fullName || ""
    contractor.company = data.company || ""
    contractor.email = data.email || ""
    contractor.phone = data.phone || ""
    contractor.location = data.location || ""
    contractor.yearsExperience = data.yearsExperience || 0
    contractor.skills = data.skills || []
    contractor.initial = contractor.fullName
      ? contractor.fullName.charAt(0).toUpperCase()
      : "?"
    photoURL.value = data.photoURL || ""
    contractor.priceTier = data.priceTier || ''

    syncEditForm()
  } catch (error) {
    console.error("Error loading contractor profile:", error)
  }
}

async function loadContractorStats() {
  try {
    const [reviewsSnap, projectsSnap] = await Promise.all([
      getDocs(query(
        collection(db, "customerReviews"),
        where("targetId", "==", profileUid.value)
      )),
      getDocs(query(
        collection(db, "portfolioProjects"),
        where("contractorId", "==", profileUid.value),
        where("status", "==", "completed")
      )),
    ])

    contractor.reviewCount = reviewsSnap.size
    contractor.projectsCompleted = projectsSnap.size

    if (reviewsSnap.size > 0) {
      const totalRating = reviewsSnap.docs.reduce((sum, d) => sum + (d.data().rating || 0), 0)
      contractor.rating = Math.round((totalRating / reviewsSnap.size) * 10) / 10
    } else {
      contractor.rating = null
    }
  } catch (error) {
    console.error("Error loading contractor stats:", error)
  }
}

function addSkill() {
  const skill = newSkill.value.trim()
  if (!skill) return
  editForm.skills.push(skill)
  newSkill.value = ""
}

function removeSkill(index) {
  editForm.skills.splice(index, 1)
}

async function saveProfile() {
  try {
    const user = auth.currentUser
    if (!user) return

    const userRef = doc(db, "users", user.uid)

    await setDoc(
      userRef,
      {
        fullName: editForm.fullName,
        company: editForm.company,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.location,
        yearsExperience: Number(editForm.yearsExperience),
        skills: [...editForm.skills],
        priceTier: editForm.priceTier,
      },
      { merge: true }
    )

    contractor.fullName = editForm.fullName
    contractor.company = editForm.company
    contractor.email = editForm.email
    contractor.phone = editForm.phone
    contractor.location = editForm.location
    contractor.yearsExperience = Number(editForm.yearsExperience)
    contractor.skills = [...editForm.skills]
    contractor.initial = contractor.fullName
      ? contractor.fullName.charAt(0).toUpperCase()
      : "?"

    editing.value = false
  } catch (error) {
    console.error("Error saving contractor profile:", error)
  }
}

function cancelEdit() {
  syncEditForm()
  newSkill.value = ""
  editing.value = false
}

async function handlePhotoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  photoUploading.value = true
  const storage = getStorage()
  const sRef = storageRef(storage, `profilePhotos/${auth.currentUser.uid}`)
  const task = uploadBytesResumable(sRef, file)
  task.on("state_changed", null, (err) => {
    console.error(err)
    photoUploading.value = false
  }, async () => {
    const url = await getDownloadURL(task.snapshot.ref)
    photoURL.value = url
    await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url }, { merge: true })
    photoUploading.value = false
  })
}

onMounted(() => {
  loadContractorProfile()
  loadContractorStats()
  loadProjectStats()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.profile-page {
  min-height: 100vh;
  background: #f4f6f9;
  font-family: Arial, sans-serif;
  color: #1f2937;
}

.page-content {
  max-width: 1100px;
  margin: 26px auto;
  padding: 0 18px 40px;
  font-family: Arial, sans-serif;
}

.profile-card,
.content-card {
  background: white;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.profile-card {
  padding: 28px;
  margin-bottom: 22px;
}

.profile-top {
  display: grid;
  grid-template-columns: 110px 1fr 130px;
  gap: 24px;
  align-items: start;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(180deg, #2f7bff, #1e56ea);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-row h1 {
  margin: 0;
  font-size: 24px;
}

.verified {
  color: #2563eb;
  font-weight: 700;
  font-size: 22px;
}

.company {
  margin: 8px 0 10px;
  color: #4b5563;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.star {
  color: #f6c400;
}

.dot {
  color: #6b7280;
}

.muted {
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 28px;
  margin-bottom: 18px;
}

.info-item {
  color: #4b5563;
}

.skills-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-pill {
  background: #e7efff;
  color: #2958ec;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 14px;
}

.edit-wrap {
  display: flex;
  justify-content: flex-end;
}

.outline-btn {
  background: white;
  color: #2958ec;
  border: 1px solid #2958ec;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
}

.content-card {
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  border: none;
  background: white;
  padding: 18px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
}

.tab-btn.active {
  color: #2958ec;
  border-bottom: 3px solid #2958ec;
}

.tab-content {
  padding: 28px;
}

.tab-content h2 {
  margin: 0 0 10px;
  font-size: 20px;
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

.edit-layout {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 24px;
}

.edit-main {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 20px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label,
.skill-editor label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.field input,
.add-skill-row input {
  width: 100%;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
}

.skill-editor {
  margin-top: 18px;
}

.add-skill-row {
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 10px;
  margin-bottom: 12px;
}

.square-btn {
  border: none;
  border-radius: 10px;
  background: #2958ec;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.editable-skills {
  margin-top: 8px;
}

.remove-skill {
  border: none;
  background: transparent;
  color: #2958ec;
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}

.save-btn {
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 11px 16px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 16px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 900px) {
  .profile-top {
    grid-template-columns: 1fr;
  }

  .edit-layout {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .edit-wrap {
    justify-content: flex-start;
  }
}

  .skill-checkboxes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .skill-checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #f9fafb;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    user-select: none;
  }

  .skill-checkbox-item:hover {
    border-color: #2958ec;
    background: #eff4ff;
  }

  .skill-checkbox-item.selected {
    border-color: #2958ec;
    background: #e7efff;
    color: #2958ec;
    font-weight: 600;
  }

  .skill-checkbox-item input[type="checkbox"] {
    accent-color: #2958ec;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .custom-skill-label {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .dashboard-numbers {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-around;
    padding-top: 20px;
    margin-top: 16px;
    border-top: 1px solid #e5e7eb;
  }

  .dashboard-stat {
    text-align: center;
  }

  .dashboard-stat h1 {
    margin: 0 0 4px;
    font-size: 28px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  .stat-total     { color: #2254f5; }
  .stat-portfolio { color: #16a34a; }
  .stat-progress  { color: #ea580c; }
  .stat-completed { color: #111827; }
  .avatar-wrap {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
  }

  .avatar-photo {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);
  }

  .photo-upload-btn {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid white;
    background: #2254f5;
    color: white;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .field select {
    width: 100%;
    border: none;
    background: #f3f4f6;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    outline: none;
    appearance: none;
    cursor: pointer;
  }
</style>