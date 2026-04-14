<template>
  <ToolBarContractor />

  <div class="proposal-page">
    <!-- Back nav -->
    <div class="back-bar">
      <button class="back-btn" @click="router.back()">
        <span>←</span> Back
      </button>
    </div>

    <div class="proposal-body">
      <div class="page-heading">
        <h1>Create Proposal</h1>
        <p class="page-sub">Submit your proposal for this project</p>
      </div>

      <!-- ── Project Details Card ── -->
      <section class="card" v-if="project">
        <h2 class="card-title">Project Details</h2>
        <div class="project-summary">
          <div class="project-summary-left">
            <div class="project-name">{{ project.title }}</div>
            <div class="project-category">{{ project.category }}</div>
            <div class="project-meta-row">
              <span v-if="project.priceTier"><strong>Budget:</strong> {{ project.priceTier }}</span>
              <span v-if="project.location"><strong>Location:</strong> {{ project.location }}</span>
            </div>
            <div class="project-meta-row" v-if="project.homeownerName">
              <span><strong>Homeowner:</strong> {{ project.homeownerName }}</span>
            </div>
            <p class="project-desc" v-if="project.description">{{ project.description }}</p>
          </div>
          <img
            v-if="project.imageUrl"
            :src="project.imageUrl"
            :alt="project.title"
            class="project-thumb"
          />
        </div>
      </section>

      <div v-else-if="loadingProject" class="card loading-card">
        Loading project details…
      </div>

      <!-- ── Proposal Form Card ── -->
      <section class="card">
        <h2 class="card-title">Your Proposal</h2>

        <!-- Price Range -->
        <div class="field">
          <label class="field-label">
            <span class="field-icon">$</span> Estimated Price Range
            <span class="required">*</span>
          </label>
          <select v-model="form.priceRange" class="field-input" :class="{ error: errors.priceRange }">
            <option value="">Select price range</option>
            <option value="S$0 – S$500">S$0 – S$500</option>
            <option value="S$500 – S$2,000">S$500 – S$2,000</option>
            <option value="S$2,000 – S$10,000">S$2,000 – S$10,000</option>
            <option value="S$10,000+">S$10,000+</option>
          </select>
          <span class="field-hint">Select the price range that best matches your estimated cost for this project</span>
          <span v-if="errors.priceRange" class="field-error">{{ errors.priceRange }}</span>
        </div>

        <!-- Duration -->
        <div class="field">
          <label class="field-label">
            <span class="field-icon">🕐</span> Estimated Duration
            <span class="required">*</span>
          </label>
          <input
            v-model="form.duration"
            type="text"
            class="field-input"
            :class="{ error: errors.duration }"
            placeholder="e.g., 6 weeks, 2-3 months"
          />
          <span class="field-hint">Provide a realistic timeline for completing this project</span>
          <span v-if="errors.duration" class="field-error">{{ errors.duration }}</span>
        </div>

        <!-- Cover Letter -->
        <div class="field">
          <label class="field-label">
            <span class="field-icon">📋</span> Cover Letter
            <span class="required">*</span>
          </label>
          <textarea
            v-model="form.coverLetter"
            class="field-input cover-letter"
            :class="{ error: errors.coverLetter }"
            :placeholder="coverLetterPlaceholder"
            rows="8"
          ></textarea>
          <span class="field-hint">Write a compelling message that highlights your qualifications and interest in the project</span>
          <span v-if="errors.coverLetter" class="field-error">{{ errors.coverLetter }}</span>
        </div>

        <!-- Tips box -->
        <div class="tips-box">
          <div class="tips-title">💡 Tips for a Great Proposal</div>
          <ul class="tips-list">
            <li>Be specific about your experience with similar projects</li>
            <li>Explain your process and timeline clearly</li>
            <li>Mention any warranties or guarantees you provide</li>
            <li>Be professional and enthusiastic</li>
            <li>Proofread your proposal before submitting</li>
          </ul>
        </div>
      </section>

      <!-- ── Submit / Cancel ── -->
      <div class="form-actions">
        <button
          class="submit-btn"
          @click="submitProposal"
          :disabled="submitting"
        >
          <span v-if="submitting">Submitting…</span>
          <span v-else>Submit Proposal</span>
        </button>
        <button class="cancel-btn" @click="router.back()">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import ToolBarContractor from '@/components/ToolBarContractor.vue'

const route  = useRoute()
const router = useRouter()
const auth   = getAuth()
const currentUid = auth.currentUser?.uid

const projectId = route.params.id

// ── Project data ──
const project = ref(null)
const loadingProject = ref(true)

// ── Form ──
const form = reactive({
  priceRange:  '',
  duration:    '',
  coverLetter: '',
})

const errors = reactive({
  priceRange:  '',
  duration:    '',
  coverLetter: '',
})

const submitting = ref(false)

const coverLetterPlaceholder = `Introduce yourself and explain why you're the right contractor for this project. Include:
• Your relevant experience
• What makes your approach unique
• Any questions or clarifications needed
• References or past work examples`

// ── Load project ──
onMounted(async () => {
  if (!projectId) return
  try {
    const snap = await getDoc(doc(db, 'portfolioProjects', projectId))
    if (snap.exists()) {
      project.value = { id: snap.id, ...snap.data() }
    }
  } catch (e) {
    console.error('Failed to load project', e)
  } finally {
    loadingProject.value = false
  }
})

// ── Validation ──
function validate() {
  let valid = true
  errors.priceRange  = ''
  errors.duration    = ''
  errors.coverLetter = ''

  if (!form.priceRange) {
    errors.priceRange = 'Please select a price range.'
    valid = false
  }
  if (!form.duration.trim()) {
    errors.duration = 'Please provide an estimated duration.'
    valid = false
  }
  if (!form.coverLetter.trim()) {
    errors.coverLetter = 'Please write a cover letter.'
    valid = false
  }
  return valid
}

// ── Submit ──
async function submitProposal() {
  if (!validate()) return
  submitting.value = true
  try {
    await addDoc(collection(db, 'proposals'), {
      projectId,
      contractorId:  currentUid,
      homeownerId:   project.value?.homeownerId || null,
      projectTitle:  project.value?.title || '',
      priceRange:    form.priceRange,
      duration:      form.duration,
      coverLetter:   form.coverLetter,
      status:        'pending',
      createdAt:     serverTimestamp(),
    })
    alert('Proposal submitted successfully! Please wait for the Homeowner to contact you via the chat.')
    router.back()
  } catch (e) {
    console.error('Failed to submit proposal', e)
    alert('Failed to submit proposal. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
* { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-sizing: border-box; }

.proposal-page {
  min-height: 100vh;
  background: #eef2fb;
  padding-bottom: 60px;
}

/* ── Back bar ── */
.back-bar {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 18px 0;
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

/* ── Body ── */
.proposal-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-heading { margin-bottom: 4px; }

.page-heading h1 {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

/* ── Cards ── */
.card {
  background: white;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
}

.loading-card {
  color: #9ca3af;
  font-size: 14px;
}

/* ── Project summary ── */
.project-summary {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.project-summary-left { flex: 1; }

.project-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 3px;
}

.project-category {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}

.project-meta-row {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.project-meta-row strong { color: #111827; }

.project-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin: 12px 0 0;
}

.project-thumb {
  width: 110px;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

/* ── Form fields ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 22px;
}

.field:last-of-type { margin-bottom: 0; }

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-icon { font-size: 15px; }

.required {
  color: #ef4444;
  margin-left: 2px;
}

.field-input {
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  background: white;
}

.field-input:focus {
  border-color: #2254f5;
  box-shadow: 0 0 0 3px rgba(34,84,245,0.08);
}

.field-input.error { border-color: #ef4444; }

.cover-letter {
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

.field-hint {
  font-size: 12px;
  color: #9ca3af;
}

.field-error {
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
}

/* ── Tips box ── */
.tips-box {
  background: #eff4ff;
  border: 1px solid #c7d7fd;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 24px;
}

.tips-title {
  font-size: 14px;
  font-weight: 700;
  color: #2254f5;
  margin-bottom: 10px;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tips-list li {
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  gap: 12px;
}

.submit-btn {
  flex: 1;
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) { background: #1a42d4; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.cancel-btn {
  background: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  padding: 15px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s;
}

.cancel-btn:hover { border-color: #9ca3af; }

@media (max-width: 600px) {
  .project-summary { flex-direction: column-reverse; }
  .project-thumb { width: 100%; height: 160px; }
  .form-actions { flex-direction: column; }
}
</style>