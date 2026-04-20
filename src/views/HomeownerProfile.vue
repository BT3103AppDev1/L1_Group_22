<template>
  <ToolBarHomeowner/>
    <div class="page-content">
      <section class="profile-card">
        <template v-if="!editing">
          <!-- Personal Information -->
          <div class="profile-top">
            <!-- Profile Photo -->
            <div class="avatar-wrap">
              <img v-if="photoURL" :src="photoURL" class="avatar-photo" />
              <div v-else class="avatar">{{ homeowner.initial }}</div>
            </div>
            <!-- Name -->
            <div class="profile-main">
              <div class="name-row">
                <h1>{{ homeowner.fullName }}</h1>
                <span class="verified">✓</span>
              </div>
              <!-- More personal details -->
              <div class="info-grid">
                <div class="info-item">✉ {{ homeowner.email }}</div>
                <div class="info-item">📞 {{ homeowner.phone }}</div>
                <div class="info-item">📍 {{ homeowner.location }}</div>
                <div class="info-item">👤 Member since {{ homeowner.memberSince}}</div>
              </div>
            </div>
            <!-- Edit Profile Button -->
            <div class="edit-wrap" v-if="isOwner">
              <button class="outline-btn" @click="editing = true">Edit Profile</button>
            </div>
            <!-- Project Tracker Dashboard - only visible by owner of profile page -->
            <div class="dashboard-numbers" v-if="isOwner">
              <div class="dashboard-stat">
                <h1 class="stat-total">{{ projectStats.total }}</h1>
                <div class="stat-label">Total Projects</div>
              </div>
              <div class="dashboard-stat">
                <h1 class="stat-active">{{ projectStats.active }}</h1>
                <div class="stat-label">Active</div>
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
        <!-- Editting mode -->
        <template v-else>
          <div class="edit-layout">
            <!-- Profile Photo -->
            <div class="avatar-wrap">
              <img v-if="photoURL" :src="photoURL" class="avatar-photo" />
              <div v-else class="avatar">{{ editForm.initial }}</div>
              <button class="photo-upload-btn" @click="photoInput.click()" :disabled="photoUploading">
                {{ photoUploading ? '…' : '📷' }}
              </button>
              <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
            </div>
            <!-- Name -->
            <div class="edit-main">
              <div class="form-grid">
                <div class="field">
                  <label>Full Name</label>
                  <input v-model="editForm.fullName" type="text" />
                </div>
                <!-- Other Personal Details -->
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
              </div>
              <!-- Save/Cancel changes button -->
              <div class="edit-actions">
                <button class="save-btn" @click="saveProfile">Save Changes</button>
                <button class="cancel-btn" @click="cancelEdit">Cancel</button>
              </div>
            </div>
          </div>
        </template>
      </section>
      <!-- Tabs - Projects, Saved Contractor, Reviews -->
      <section class="content-card">
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'portfolio' }"
            @click="activeTab = 'portfolio'"
          >
            My Projects
          </button>
          <button
            v-if="isOwner"
            class="tab-btn"
            :class="{ active: activeTab === 'opportunities' }"
            @click="activeTab = 'opportunities'"
          >
            Saved Contractors
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
            <ProjectsTab v-if="profileUid" :homeownerId="profileUid" @project-added="loadProjectStats"/>            
          </div>
          <!-- Saved Contractors Tab - only visible to owner -->
          <div v-if="activeTab === 'opportunities' && isOwner">
            <SavedContractorsTab/>            
          </div>

          <div v-if="activeTab === 'reviews'">
            <ClientReviewTab :homeownerId="profileUid" /> 
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
  import { onAuthStateChanged } from 'firebase/auth'

  import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
  
  import ProjectsTab from "../components/ProjectsTab.vue"
  import SavedContractorsTab from "@/components/SavedContractorsTab.vue"
  import ClientReviewTab from "@/components/ClientReviewTab.vue"

  const route = useRoute()
  // Check if viewer is the profile page owner or another user
  const profileUid = ref(route.params.homeownerId || "")

  const isOwner = computed(() =>
    !route.params.homeownerId || route.params.homeownerId === auth.currentUser?.uid
  )
  
  const activeTab = ref("portfolio")
  const editing = ref(false)
  const newSkill = ref("")
  const photoURL = ref("")
  const photoUploading = ref(false)
  const photoInput = ref(null)
  
  const homeowner = reactive({
    initial: "",
    fullName: "",
    memberSince: "",
    company: "",
    rating: 0,
    reviewCount: 0,
    projectsCompleted: 0,
    email: "",
    phone: "",
    location: "",
    yearsExperience: 0,
    skills: [],
  })
  // Allow editing personal information
  const editForm = reactive({
    initial: "",
    fullName: "",
    company: "",
    email: "",
    phone: "",
    location: "",
    yearsExperience: 0,
    skills: [],
  })
  
  function syncEditForm() {
    editForm.initial = homeowner.initial
    editForm.fullName = homeowner.fullName
    editForm.company = homeowner.company
    editForm.email = homeowner.email
    editForm.phone = homeowner.phone
    editForm.location = homeowner.location
    editForm.yearsExperience = homeowner.yearsExperience
    editForm.skills = [...homeowner.skills]
  }

  const projectStats = reactive({
    total: 0,
    active: 0,
    inProgress: 0,
    completed: 0,
  })
  // Load personal information
  async function loadHomeownerProfile() {
    try {
      const user = auth.currentUser
      if (!user) return

      // const userRef = doc(db, "users", user.uid)
      const userRef = doc(db, "users", profileUid.value)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) return

      const data = userSnap.data()

      homeowner.fullName = data.fullName || ""
      homeowner.company = data.company || ""
      homeowner.email = data.email || user.email || ""
      homeowner.phone = data.phone || ""
      homeowner.location = data.location || ""
      //homeowner.yearsExperience = data.yearsExperience || 0
      homeowner.memberSince = data.createdAt
        ? data.createdAt.toDate().toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })
        : '—'
      homeowner.skills = data.skills || []
      homeowner.initial = homeowner.fullName
        ? homeowner.fullName.charAt(0).toUpperCase()
        : "X"
      photoURL.value = data.photoURL || ""

      syncEditForm()
    } catch (error) {
      console.error("Error loading homeowner profile:", error)
    }
  }
  // Save changes to editing personal info
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
        },
        { merge: true }
      )

      homeowner.fullName = editForm.fullName
      homeowner.company = editForm.company
      homeowner.email = editForm.email
      homeowner.phone = editForm.phone
      homeowner.location = editForm.location
      homeowner.yearsExperience = Number(editForm.yearsExperience)
      homeowner.skills = [...editForm.skills]
      homeowner.initial = homeowner.fullName
        ? homeowner.fullName.charAt(0).toUpperCase()
        : "M"

      editing.value = false
    } catch (error) {
      console.error("Error saving homeowner profile:", error)
    }
  }
  // Cancel Changes
  function cancelEdit() {
    syncEditForm()
    newSkill.value = ""
    editing.value = false
  }
  // Load project tracker dashboard numbers 
  async function loadProjectStats() {
    try {
      const snap = await getDocs(
        query(
          collection(db, 'portfolioProjects'),
          where('homeownerId', '==', profileUid.value)
        )
      )

      projectStats.total = snap.size
      projectStats.active = 0
      projectStats.inProgress = 0
      projectStats.completed = 0

      snap.docs.forEach((d) => {
        const status = d.data().status
        if (status === 'active') projectStats.active++
        else if (status === 'inProgress') projectStats.inProgress++
        else if (status === 'completed') projectStats.completed++
      })
    } catch (e) {
      console.error('Failed to load project stats', e)
    }
  }

  // Upload Profile Photo
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
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set profileUid if not already set from route params
        if (!profileUid.value) {
          profileUid.value = user.uid
        }
        loadHomeownerProfile()
        loadProjectStats()
      }
    })
  })

</script>
  
<style scoped>
  * {
    box-sizing: border-box;
  }

  .dashboard-numbers {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    text-align: center;
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
    grid-template-columns: 110px 1fr auto;
    grid-template-rows: auto auto;
    gap: 0 24px;
    align-items: start;
  }
  
  .avatar {
    grid-column: 1;
    grid-row: 1;
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

  .profile-main {
    grid-column: 2;
    grid-row: 1;
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
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 28px;
    margin-bottom: 18px;
  }
  
  .info-item {
    color: #4b5563;
  }
  
  .edit-wrap {
    grid-column: 3;
    grid-row: 1;
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
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid #e5e7eb;
  }
  
  .tab-btn {
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
    border: 1px solid #d1d5db;
    background: white;
    color: #111827;
    border-radius: 10px;
    padding: 11px 16px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .small-btn {
    padding: 10px 14px;
  }
  
  .project-title-row h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .review-card-top h3 {
    margin: 0;
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
    .form-grid,
    .portfolio-grid,
    .review-summary {
      grid-template-columns: 1fr;
    }
  
    .edit-wrap {
      justify-content: flex-start;
    }
  }

  .dashboard-numbers {
    grid-column: 1 / -1;
    grid-row: 2;
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

  .stat-total { 
    color: #2254f5; 
  }
  .stat-active { 
    color: #16a34a; 
  }
  .stat-progress { 
    color: #ea580c; 
  }
  .stat-completed { 
    color: #111827; 
  }

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

</style>