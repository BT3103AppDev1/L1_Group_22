<template>
  <ToolBarHomeowner/>
    <div class="page-content">
      <section class="profile-card">
        <template v-if="!editing">
          <div class="profile-top">
            <div class="avatar">{{ homeowner.initial }}</div>

            <div class="profile-main">
              <div class="name-row">
                <h1>{{ homeowner.fullName }}</h1>
                <span class="verified">✓</span>
              </div>

              <p class="company">{{ homeowner.company }}</p>

              <!-- <div class="rating-row">
                <span class="star">★</span>
                <span>{{ homeowner.rating }}</span>
                <span class="muted">({{ homeowner.reviewCount }} reviews)</span>
                <span class="dot">•</span>
                <span class="muted">{{ homeowner.projectsCompleted }} projects completed</span>
              </div> -->

              <div class="info-grid">
                <div class="info-item">✉ {{ homeowner.email }}</div>
                <div class="info-item">📞 {{ homeowner.phone }}</div>
                <div class="info-item">📍 {{ homeowner.location }}</div>
                <div class="info-item">👤 Member since {{ homeowner.memberSince}}</div>
              </div>

              <!-- <div class="skills-section">
                <div class="skills-title">Skills & Specializations</div>
                <div class="skill-list">
                  <span v-for="skill in homeowner.skills" :key="skill" class="skill-pill">
                    {{ skill }}
                  </span>
                </div>
              </div> -->

              <!-- <br><hr> -->
            </div>

            <div class="edit-wrap" v-if="isOwner">
              <button class="outline-btn" @click="editing = true">Edit Profile</button>
            </div>
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

        <template v-else>
          <div class="edit-layout">
            <div class="avatar">{{ editForm.initial }}</div>

            <div class="edit-main">
              <div class="form-grid">
                <div class="field">
                  <label>Full Name</label>
                  <input v-model="editForm.fullName" type="text" />
                </div>

                <!-- <div class="field">
                  <label>Company Name</label>
                  <input v-model="editForm.company" type="text" />
                </div> -->

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

                <!-- <div class="field">
                  <label>Years on the app</label>
                  <input v-model="editForm.yearsExperience" type="number" />
                </div> -->
              </div>

              <!-- <div class="skill-editor">
                <label>Skills & Specializations</label>
                <div class="add-skill-row">
                  <input
                    v-model="newSkill"
                    type="text"
                    placeholder="Add new skill"
                    @keyup.enter="addSkill"
                  />
                  <button class="square-btn" @click="addSkill">+</button>
                </div>

                <div class="skill-list editable-skills">
                  <span
                    v-for="(skill, index) in editForm.skills"
                    :key="skill + index"
                    class="skill-pill"
                  >
                    {{ skill }}
                    <button class="remove-skill" @click="removeSkill(index)">×</button>
                  </span>
                </div>
              </div> -->

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
            <ProjectsTab :homeownerId="profileUid"/>            
          </div>

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

  import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
  
  import ProjectsTab from "../components/ProjectsTab.vue"
  import SavedContractorsTab from "@/components/SavedContractorsTab.vue"
  // import ReviewsTab from "@/components/ReviewsTab.vue"
  import ClientReviewTab from "@/components/ClientReviewTab.vue"

  const route = useRoute()
  
  // If a homeownerId param is in the URL, a homeowner is viewing someone else's profile.
  // If no param, the contractor is viewing their own profile.
  const profileUid = computed(() =>
  route.params.homeownerId || auth.currentUser?.uid
)

const isOwner = computed(() =>
  !route.params.homeownerId || route.params.homeownerId === auth.currentUser?.uid
)
  
  const activeTab = ref("portfolio")
  const editing = ref(false)
  const newSkill = ref("")
  
  const homeowner = reactive({
    initial: "D",
    fullName: "Dom Nick",
    memberSince: "-",
    company: "Address here",
    rating: 4.8,
    reviewCount: 47,
    projectsCompleted: 152,
    email: "changgus@laif.com",
    phone: "+65 8234 5678",
    location: "Jurong West, Singapore",
    yearsExperience: 12,
    skills: [
      "Kitchen Renovation",
      "Bathroom Remodeling",
      "Carpentry",
      "Flooring",
      "Painting",
      "Electrical Work",
    ],
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
    // initial: homeowner.initial,
    // fullName: homeowner.fullName,
    // company: homeowner.company,
    // email: homeowner.email,
    // phone: homeowner.phone,
    // location: homeowner.location,
    // yearsExperience: homeowner.yearsExperience,
    // skills: [...homeowner.skills],
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

async function loadHomeownerProfile() {
  try {
    const user = auth.currentUser
    if (!user) return

    // const userRef = doc(db, "users", user.uid)
    const userRef = doc(db, "users", profileUid.value)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const data = userSnap.data()

    // if (data.userType !== "homeowner") return

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

    syncEditForm()
  } catch (error) {
    console.error("Error loading homeowner profile:", error)
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
    // const userSnap = await getDoc(userRef)

    // if (!userSnap.exists()) return

    // const data = userSnap.data()
    // if (data.userType !== "homeowner") return

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
  
  function cancelEdit() {
    syncEditForm()
    // editForm.initial = homeowner.initial
    // editForm.fullName = homeowner.fullName
    // editForm.company = homeowner.company
    // editForm.email = homeowner.email
    // editForm.phone = homeowner.phone
    // editForm.location = homeowner.location
    // editForm.yearsExperience = homeowner.yearsExperience
    // editForm.skills = [...homeowner.skills]
    newSkill.value = ""
    editing.value = false
  }

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
  onMounted(() => {
    loadHomeownerProfile()
    loadProjectStats()
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
  
  /* .profile-page { //dont know what this was used for -b-19/3
    min-height: 100vh;
    background: #f4f6f9;
    font-family: Arial, sans-serif;
    color: #1f2937;
  } */
  
  .top-bar {
    background: linear-gradient(90deg, #1d5cff, #214bdf);
    color: white;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .brand-logo {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }
  
  .brand-name {
    font-size: 18px;
    font-weight: 700;
  }
  
  .top-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .notif-btn {
    background: transparent;
    border: none;
    color: white;
    font-size: 18px;
    position: relative;
    cursor: pointer;
  }
  
  .notif-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: #ff7a00;
    color: white;
    border-radius: 999px;
    font-size: 10px;
    padding: 2px 5px;
  }
  
  .top-btn {
    border: none;
    background: white;
    color: #2754e6;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
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
  
  /* .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 22px;
  }
  
  .section-header h2, */
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
  
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
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
  
  .subtext {
    color: #6b7280;
    margin-top: 0;
  }
  
  
  
  
  
  .review-summary {
    background: #f8fafc;
    border-radius: 18px;
    padding: 22px;
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 24px;
    margin-top: 14px;
    margin-bottom: 22px;
  }
  
  .score-box {
    text-align: center;
  }
  
  .big-score {
    font-size: 56px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;
  }
  
  .stars {
    color: #f6c400;
    font-size: 24px;
    letter-spacing: 3px;
    margin-bottom: 10px;
  }
  
  .breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }
  
  .bar-row {
    display: grid;
    grid-template-columns: 40px 1fr 44px;
    gap: 12px;
    align-items: center;
  }
  
  .bar-label,
  .bar-percent {
    color: #4b5563;
    font-size: 14px;
  }
  
  .bar-track {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    background: #f6c400;
    border-radius: 999px;
  }
  
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .review-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
  }
  
  .review-card-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .review-card-top h3 {
    margin: 0;
  }
  
  .review-right {
    text-align: right;
  }
  
  .review-stars {
    color: #f6c400;
    margin-bottom: 4px;
  }
  
  .review-date {
    color: #6b7280;
    font-size: 14px;
  }
  
  .review-text {
    color: #374151;
    line-height: 1.6;
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
    justify-content: space-around;   /* evenly spread across full width */
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
  .stat-active    { color: #16a34a; }
  .stat-progress  { color: #ea580c; }
  .stat-completed { color: #111827; }

  </style>