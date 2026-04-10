<template>
    <div class="section-header">
        <h2>My Projects</h2>
        <!-- <button class="primary-btn">+ Add Project</button> -->
        <button class="primary-btn" @click="showAddForm = true" v-if="isOwner()">+ Add Project</button>
    </div>

      <!-- Add Project Form, displayed on click, copied from portfolioTab -->
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
              <option value="$">$ (S$0  -  500)</option>
              <option value="$$">$$ (S$500  -  2 000)</option>
              <option value="$$$">$$$ (S$2 000  -  10 000)</option>
              <option value="$$$$">$$$$ (>S$10 000)</option>
            </select>
          </div>

          <!-- Image Upload Slots -->
          <div class="field">
            <label>Project Images</label>
            <div class="image-upload-grid">
              <div
                v-for="index in 4"
                :key="index"
                class="upload-slot"
                :class="{ 'has-image': uploadedImages[index - 1] }"
                @click="triggerFileInput(index - 1)"
              >
                <!-- Preview -->
                <template v-if="uploadedImages[index - 1]">
                  <img
                    :src="uploadedImages[index - 1].preview"
                    class="slot-preview"
                    :alt="`Project image ${index}`"
                  />
                  <button
                    class="remove-btn"
                    type="button"
                    @click.stop="removeImage(index - 1)"
                  >×</button>
                </template>

                <!-- Empty slot -->
                <template v-else>
                  <div class="upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="#9ca3af" stroke-width="1.5" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Upload</span>
                  </div>
                </template>

                <!-- Hidden file input per slot -->
                <input
                  :ref="el => fileInputs[index - 1] = el"
                  type="file"
                  accept="image/*"
                  class="hidden-input"
                  @change="onFileSelected($event, index - 1)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="full-outline-btn" @click="closeForm" :disabled="uploading">Cancel</button>
          <button class="primary-btn" @click="saveNewProject" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Save Project' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="status-text">Loading projects...</div>
    <div v-else-if="errorMessage" class="status-text error-text">{{ errorMessage }}</div>
    <div v-else-if="portfolioProjects.length === 0" class="status-text">
      No personal projects yet.
    </div>

    <div v-else class="portfolio-grid">
        <div class="project-card" v-for="project in portfolioProjects" :key="project.id">
            <img :src="project.imageUrl || fallbackImage"
              :alt="project.title" class="project-image" />

            <div class="project-body">
                <div class="project-title-row">
                    <h3>{{ project.title }}</h3>
                    <span class="price-mark">{{ project.priceRange }}</span>
                </div>

                <p class="project-desc">{{ project.description }}</p>

                <div class="project-tags">
                    <span class="small-tag">{{ project.category }}</span>
                    <span class="small-tag">{{ project.location }}</span>
                    <span class="small-tag">{{ project.date }}</span>
                </div>

                <button class="full-outline-btn" v-if="isOwner()">Edit Project</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue"
import { auth, db, storage } from "@/firebase.js"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
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


const { homeownerId } = defineProps({
  homeownerId: {
    type: String,
    required: true
  }
})

const isOwner = () => {
  return !homeownerId  || homeownerId  === auth.currentUser?.uid
}
// i realised we could have just used usrID instead of making a new homeowner ID oops...   

const portfolioProjects = ref([])
const loading = ref(true)
const uploading = ref(false)
const errorMessage = ref("")
const showAddForm = ref(false)

const fallbackImage =
  "https://joshgrilli.wordpress.com/wp-content/uploads/2010/11/800px-100_2250.jpg?w=600"


const newProject = reactive({
  title: "",
  description: "",
  category: "",
  location: "",
  dateLabel: "",
  priceTier: "",
})

// Image upload state — 4 slots
const uploadedImages = ref([null, null, null, null])
const fileInputs = ref([])

function triggerFileInput(index) {
  fileInputs.value[index]?.click()
}

function onFileSelected(event, index) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImages.value[index] = {
      file,
      preview: e.target.result,
    }
  }
  reader.readAsDataURL(file)

  // Reset input so the same file can be re-selected if removed
  event.target.value = ""
}

function removeImage(index) {
  uploadedImages.value[index] = null
}

function resetForm() {
  newProject.title = ""
  newProject.description = ""
  newProject.category = ""
  newProject.location = ""
  newProject.dateLabel = ""
  newProject.priceTier = ""
  uploadedImages.value = [null, null, null, null]
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

    // if (userData.userType !== "homeowner") {
    //   errorMessage.value = "Only homeowner accounts can view portfolio projects."
    //   return
    // }

    const q = query(
      collection(db, "portfolioProjects"),
      where("homeownerId", "==", homeownerId ),
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

    if (userData.userType !== "homeowner") {
      errorMessage.value = "Only homeowners can add portfolio projects."
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
      // errorMessage.value = "Please fill in all required fields."
      alert("Please fill in all required fields.")
      return
    }

    // Upload all selected images to Firebase Storage and collect their download URLs
    const filesToUpload = uploadedImages.value.filter((img) => img !== null)
    let imageUrls = []

    if (filesToUpload.length > 0) {
      uploading.value = true
      const uploadPromises = filesToUpload.map((img) => {
        const filename = `${Date.now()}_${img.file.name}`
        const fileRef = storageRef(storage, `portfolioImages/${user.uid}/${filename}`)
        return uploadBytes(fileRef, img.file).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        )
      })
      imageUrls = await Promise.all(uploadPromises)
      uploading.value = false
    }

    // Use the first image as the primary imageUrl, store all in an array
    const imageUrl = imageUrls[0] || fallbackImage

    await addDoc(collection(db, "portfolioProjects"), {
      homeownerId : user.uid,
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      category: newProject.category.trim(),
      location: newProject.location.trim(),
      dateLabel: newProject.dateLabel.trim(),
      priceTier: newProject.priceTier.trim(),
      imageUrl,
      imageUrls,
      createdAt: serverTimestamp(),
    })

    closeForm()
    await loadPortfolioProjects()
  } catch (error) {
    uploading.value = false
    console.error("Error saving new project:", error)
    errorMessage.value = "Failed to save project."
  }
}

onMounted(() => {
  loadPortfolioProjects()
})

  // const portfolio = ref([
//     {
//       id: 1,
//       title: "Modern Kitchen Renovation",
//       description:
//         "Complete kitchen transformation with custom cabinets, quartz countertops, and modern appliances.",
//       category: "Kitchen Renovation",
//       location: "Bishan",
//       date: "Jan 2024",
//       priceRange: "$$$",
//       image:
//         "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
//     },
//     {
//       id: 2,
//       title: "Master Bathroom Remodel",
//       description:
//         "Luxury bathroom renovation featuring walk-in shower, double vanity, and heated floors.",
//       category: "Bathroom",
//       location: "Tampines",
//       date: "Dec 2023",
//       priceRange: "$$$$",
//       image:
//         "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
//     },
//     {
//       id: 3,
//       title: "Living Room Makeover",
//       description:
//         "Updated the living space with new flooring, repainting, lighting, and built-in storage.",
//       category: "General Renovation",
//       location: "Orchard",
//       date: "Nov 2023",
//       priceRange: "$$$",
//       image:
//         "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
//     },
//   ])
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
  max-height: 90vh;
  overflow-y: auto;
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

.field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
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

/* ── Image upload grid ── */
.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.upload-slot {
  position: relative;
  aspect-ratio: 1 / 1;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  background: #f9fafb;
  transition: border-color 0.15s, background 0.15s;
}

.upload-slot:hover {
  border-color: #2958ec;
  background: #eff4ff;
}

.upload-slot.has-image {
  border-style: solid;
  border-color: #e5e7eb;
}

.slot-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: white;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}

.hidden-input {
  display: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
</style>