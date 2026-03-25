<template>
    <ToolBarContractor/>
      <div class="page-content">
        <section class="profile-card">
          <template v-if="!editing">
            <div class="profile-top">
              <div class="avatar">{{ contractor.initial }}</div>
  
              <div class="profile-main">
                <div class="name-row">
                  <h1>{{ contractor.fullName }}</h1>
                  <span class="verified">✓</span>
                </div>
  
                <p class="company">{{ contractor.company }}</p>
  
                <div class="rating-row">
                  <span class="star">★</span>
                  <span>{{ contractor.rating }}</span>
                  <span class="muted">({{ contractor.reviewCount }} reviews)</span>
                  <span class="dot">•</span>
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
  
              <div class="edit-wrap">
                <button class="outline-btn" @click="editing = true">Edit Profile</button>
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
  
                <div class="skill-editor">
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
            <button
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
              <PortfolioTab/>
            </div>
  
            <div v-if="activeTab === 'opportunities'">
              <OpportunitiesTab/>
            </div>
  
            <div v-if="activeTab === 'reviews'">
              <ReviewsTab/>
            </div>
          </div>
        </section>
      </div>
  </template>
  
  <script setup>
  import { reactive, ref } from "vue"
  import { useRouter } from "vue-router"
  import ToolBarContractor from "@/components/ToolBarContractor.vue"
  import PortfolioTab from "@/components/PortfolioTab.vue"
  import OpportunitiesTab from "@/components/OpportunitiesTab.vue"
  import ReviewsTab from "@/components/ReviewsTab.vue"
  
  const router = useRouter()
  
  const activeTab = ref("portfolio")
  const editing = ref(false)
  const newSkill = ref("")
  
  const contractor = reactive({
    initial: "M",
    fullName: "Samson Lim",
    company: "Property Lim Brothers Renovation",
    rating: 4.8,
    reviewCount: 47,
    projectsCompleted: 152,
    email: "michael.tan@premiumreno.com",
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
    initial: contractor.initial,
    fullName: contractor.fullName,
    company: contractor.company,
    email: contractor.email,
    phone: contractor.phone,
    location: contractor.location,
    yearsExperience: contractor.yearsExperience,
    skills: [...contractor.skills],
  })
  
  function addSkill() {
    const skill = newSkill.value.trim()
    if (!skill) return
  
    editForm.skills.push(skill)
    newSkill.value = ""
  }
  
  function removeSkill(index) {
    editForm.skills.splice(index, 1)
  }
  
  function saveProfile() {
    contractor.initial = editForm.fullName ? editForm.fullName[0].toUpperCase() : "M"
    contractor.fullName = editForm.fullName
    contractor.company = editForm.company
    contractor.email = editForm.email
    contractor.phone = editForm.phone
    contractor.location = editForm.location
    contractor.yearsExperience = editForm.yearsExperience
    contractor.skills = [...editForm.skills]
    editing.value = false
  }
  
  function cancelEdit() {
    editForm.initial = contractor.initial
    editForm.fullName = contractor.fullName
    editForm.company = contractor.company
    editForm.email = contractor.email
    editForm.phone = contractor.phone
    editForm.location = contractor.location
    editForm.yearsExperience = contractor.yearsExperience
    editForm.skills = [...contractor.skills]
    newSkill.value = ""
    editing.value = false
  }
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
  
  /* .section-header { //see portfolio/projects tab
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
    .form-grid,
    .portfolio-grid,
    .review-summary {
      grid-template-columns: 1fr;
    }
  
    .edit-wrap {
      justify-content: flex-start;
    }
  }
  </style>