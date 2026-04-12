<template>
  <ToolBarHomeowner v-if="userType === 'homeowner'" />
  <ToolBarContractor v-else-if="userType === 'contractor'" />
 
  <div class="chats-page">
    <!-- Tab switcher -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'chats' }"
        @click="activeTab = 'chats'"
      >
        Chats
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ads' }"
        @click="activeTab = 'ads'"
      >
        Advertisements
      </button>
    </div>
 
    <!-- ───────────── CHATS TAB ───────────── -->
    <div v-if="activeTab === 'chats'" class="tab-content">
      <div class="pane-layout">
 
        <!-- Left: conversation list -->
        <aside class="convo-list">
          <div v-if="loadingConvos" class="empty-hint">Loading...</div>
          <div v-else-if="convos.length === 0" class="empty-hint">No conversations yet.</div>
 
          <div
            v-for="convo in convos"
            :key="convo.id"
            class="convo-item"
            :class="{ selected: selectedConvo?.id === convo.id }"
            @click="openConvo(convo)"
          >
            <div class="convo-avatar">
              <img :src="convo.otherPhoto || defaultAvatar" :alt="convo.otherName" />
            </div>
            <div class="convo-info">
              <div class="convo-name-row">
                <span class="convo-name">{{ convo.otherName }}</span>
                <span class="convo-time">{{ formatTime(convo.lastMessageAt) }}</span>
              </div>
            </div>
          </div>
        </aside>
 
        <!-- Right: message thread -->
        <section class="message-pane">
          <!-- No conversation selected -->
          <div v-if="!selectedConvo" class="no-convo">
            <div class="no-convo-icon">💬</div>
            <p>Select a conversation to start chatting</p>
          </div>
 
          <template v-else>
            <!-- Header -->
            <div class="message-header">
              <img :src="selectedConvo.otherPhoto || defaultAvatar" class="header-avatar" />
              <div>
                <div class="header-name">{{ selectedConvo.otherName }}</div>
                <div class="header-sub">{{ selectedConvo.otherSub }}</div>
              </div>
            </div>

            <!-- ── Pinned Project Banner ── -->
            <ProjectPinnedBanner
              v-if="pinnedProject"
              :project="pinnedProject"
              @view="goToProject(pinnedProject.projectId)"
            />

            <!-- Messages -->
            <div class="messages-scroll" ref="messagesEl">
              <div v-if="loadingMessages" class="empty-hint">Loading messages...</div>
              <div v-else-if="messages.length === 0" class="empty-hint">
                No messages yet. Say hello! 👋
              </div>
 
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="msg-row"
                :class="msg.senderId === currentUid ? 'msg-mine' : 'msg-theirs'"
              >
                <!-- Regular text message -->
                <div v-if="!msg.type || msg.type === 'text'" class="bubble">
                  <p>{{ msg.text }}</p>
                  <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                </div>

                <!-- Project link message -->
                <ProjectLinkMessage
                  v-else-if="msg.type === 'projectLink'"
                  :snapshot="msg.projectSnapshot"
                  :is-mine="msg.senderId === currentUid"
                  :time="formatTime(msg.sentAt)"
                  @view="goToProject(msg.projectSnapshot?.projectId)"
                />

                <!-- File message -->
                <FileMessage
                  v-else-if="msg.type === 'file'"
                  :msg="msg"
                  :is-mine="msg.senderId === currentUid"
                  :time="formatTime(msg.sentAt)"
                />
              </div>
            </div>
 
            <!-- Input area -->
            <div class="message-input-area">

              <!-- Hidden file input -->
              <input
                ref="fileInputEl"
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                style="display:none"
                @change="onFileChosen"
              />

              <!-- Top toolbar: project (homeowner) + file attach (both) -->
              <div class="input-toolbar">

                <!-- Project selector (homeowner only) -->
                <div v-if="userType === 'homeowner'" class="project-selector-wrapper">
                  <button
                    class="attach-project-btn"
                    :class="{ active: showProjectDropdown }"
                    @click="toggleProjectDropdown"
                    title="Attach a project"
                  >
                    <span class="attach-icon">📎</span>
                    <span>Attach Project</span>
                    <span class="chevron">{{ showProjectDropdown ? '▲' : '▼' }}</span>
                  </button>

                  <!-- Dropdown -->
                  <div v-if="showProjectDropdown" class="project-dropdown">
                    <div v-if="loadingProjects" class="dropdown-hint">Loading projects…</div>
                    <div v-else-if="homeownerProjects.length === 0" class="dropdown-hint">
                      No projects found.
                    </div>
                    <div
                      v-for="proj in homeownerProjects"
                      :key="proj.id"
                      class="dropdown-item"
                      :class="{ 'dropdown-item-selected': selectedProject?.id === proj.id }"
                      @click="selectProject(proj)"
                    >
                      <div class="dropdown-item-title">{{ proj.title }}</div>
                      <div class="dropdown-item-meta">
                        <span v-if="proj.category">{{ proj.category }}</span>
                        <span v-if="proj.priceTier" class="dropdown-budget">{{ proj.priceTier }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- File attach button (both roles) -->
                <button class="attach-file-btn" @click="triggerFilePick" title="Attach file or image">
                  🖼
                </button>

                <!-- Selected project chip -->
                <div v-if="selectedProject" class="selected-project-chip">
                  <span class="chip-icon">🏠</span>
                  <span class="chip-title">{{ selectedProject.title }}</span>
                  <button class="chip-remove" @click="clearSelectedProject">✕</button>
                </div>

                <!-- Pending file chip -->
                <div v-if="pendingFile" class="selected-project-chip file-chip">
                  <span class="chip-icon">{{ pendingFile.type.startsWith('image/') ? '🖼' : '📎' }}</span>
                  <span v-if="pendingFile.previewUrl" class="file-thumb-wrap">
                    <img :src="pendingFile.previewUrl" class="file-thumb" />
                  </span>
                  <span class="chip-title">{{ pendingFile.name }}</span>
                  <button class="chip-remove" @click="clearPendingFile">✕</button>
                </div>
              </div>

              <!-- Text input row -->
              <div class="message-input-row">
                <input
                  v-model="newMessage"
                  :placeholder="pendingFile ? 'Add a caption (optional)…' : selectedProject ? 'Add a message (optional)…' : 'Type a message…'"
                  :disabled="isUploading"
                  @keydown.enter="sendMessage"
                />
                <button
                  class="send-btn"
                  @click="sendMessage"
                  :disabled="!canSend || isUploading"
                >
                  {{ isUploading ? '…' : 'Send' }}
                </button>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>
 
    <!-- ───────────── ADS TAB ───────────── -->
    <div v-if="activeTab === 'ads'" class="tab-content">
      <div v-if="loadingAds" class="empty-hint centered">Loading advertisements...</div>
      <div v-else-if="ads.length === 0" class="empty-hint centered">No advertisements yet.</div>
 
      <div v-else class="ads-grid">
        <div v-for="ad in ads" :key="ad.id" class="ad-card">
          <img
            v-if="ad.imageUrl"
            :src="ad.imageUrl"
            class="ad-image"
            :alt="ad.title"
          />
          <div class="ad-body">
            <div class="ad-top-row">
              <h3 class="ad-title">{{ ad.title }}</h3>
              <span v-if="ad.badge" class="ad-badge">{{ ad.badge }}</span>
            </div>
            <p class="ad-desc">{{ ad.description }}</p>
            <div class="ad-footer">
              <span class="ad-from">{{ ad.contractorName }}</span>
              <button
                v-if="ad.ctaText"
                class="ad-cta"
                @click="handleAdCta(ad)"
              >{{ ad.ctaText }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import { useRouter, useRoute } from "vue-router"
import { getAuth } from "firebase/auth"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore"
import { db } from "@/firebase"
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
import ToolBarContractor from "@/components/ToolBarContractor.vue"
import ProjectLinkMessage from "@/components/ProjectLinkMessage.vue"
import ProjectPinnedBanner from "@/components/ProjectPinnedBanner.vue"
import FileMessage from "@/components/FileMessage.vue"
import defaultAvatar from "@/assets/default-avatar.png"
 
const router = useRouter()
const route = useRoute()
const auth = getAuth()
const currentUid = auth.currentUser?.uid
 
// ── User type ──
const userType = ref(null)
 
// ── Tab state ──
const activeTab = ref("chats")
 
// ── Conversations ──
const convos = ref([])
const loadingConvos = ref(true)
const selectedConvo = ref(null)
 
// ── Messages ──
const messages = ref([])
const loadingMessages = ref(false)
const newMessage = ref("")
const messagesEl = ref(null)
 
// ── Ads ──
const ads = ref([])
const loadingAds = ref(true)

// ── Project sharing (homeowner) ──
const homeownerProjects = ref([])
const loadingProjects = ref(false)
const showProjectDropdown = ref(false)
const selectedProject = ref(null)

// ── Pinned project (derived from messages) ──
const pinnedProject = computed(() => {
  // Find the most recent projectLink message in the conversation
  const projectMessages = messages.value.filter(m => m.type === 'projectLink')
  if (projectMessages.length === 0) return null
  return projectMessages[projectMessages.length - 1].projectSnapshot || null
})

// ── File upload ──
const fileInputEl = ref(null)
const pendingFile = ref(null)      // { file, previewUrl, name, size, type }
const uploadProgress = ref(0)
const isUploading = ref(false)

// Can send if there's text OR a project OR a file selected
const canSend = computed(() => {
  return newMessage.value.trim().length > 0
    || selectedProject.value !== null
    || pendingFile.value !== null
})
 
// ── Unsubscribers ──
let unsubConvos = null
let unsubMessages = null
 
// ─────────────────────────────────────────
// Resolve current user's type
// ─────────────────────────────────────────
async function resolveUserType() {
  if (!currentUid) return
  const snap = await getDoc(doc(db, "users", currentUid))
  if (snap.exists()) {
    userType.value = snap.data().userType
  }
}
 
// ─────────────────────────────────────────
// Firestore — conversations
// ─────────────────────────────────────────
function listenToConvos() {
  if (!currentUid || !userType.value) return
  const field = userType.value === "homeowner" ? "homeownerId" : "contractorId"
  const otherField = userType.value === "homeowner" ? "contractorId" : "homeownerId"
 
  const q = query(collection(db, "conversations"), where(field, "==", currentUid))
 
  unsubConvos = onSnapshot(q, async (snap) => {
    const enriched = await Promise.all(
      snap.docs.map(async (d) => {
        const data = { id: d.id, ...d.data() }
        const otherUid = data[otherField]
        if (otherUid) {
          try {
            const userSnap = await getDoc(doc(db, "users", otherUid))
            if (userSnap.exists()) {
              const u = userSnap.data()
              data.otherName = u.fullName || u.username || "User"
              data.otherPhoto = u.photoURL || null
              data.otherSub = u.skills?.[0] || u.company || ""
            }
          } catch (e) {
            console.error("Failed to fetch other user info", e)
          }
        }
        return data
      })
    )
    convos.value = enriched
    loadingConvos.value = false
  })
}
 
// ─────────────────────────────────────────
// Firestore — messages inside a conversation
// ─────────────────────────────────────────
function openConvo(convo) {
  selectedConvo.value = convo
  selectedProject.value = null
  showProjectDropdown.value = false

  if (unsubMessages) {
    unsubMessages()
    unsubMessages = null
  }
  loadingMessages.value = true
  messages.value = []
 
  const q = query(
    collection(db, "conversations", convo.id, "messages"),
    orderBy("sentAt", "asc")
  )
 
  unsubMessages = onSnapshot(q, (snap) => {
    messages.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loadingMessages.value = false
    scrollToBottom()
  })

  // Load homeowner's projects when opening a convo
  if (userType.value === "homeowner") {
    loadHomeownerProjects()
  }
}
 
async function sendMessage() {
  if (!canSend.value || !selectedConvo.value) return

  const msgRef = collection(db, "conversations", selectedConvo.value.id, "messages")

  // File message — upload first, then send
  if (pendingFile.value) {
    await uploadAndSendFile()
    // also send any accompanying text
    const text = newMessage.value.trim()
    if (text) {
      await addDoc(msgRef, {
        type: "text", text,
        senderId: currentUid, senderRole: userType.value, sentAt: serverTimestamp(),
      })
      newMessage.value = ""
    }
    return
  }

  // If a project is selected, send it as a projectLink message
  if (selectedProject.value) {
    const proj = selectedProject.value
    await addDoc(msgRef, {
      type: "projectLink",
      text: newMessage.value.trim() || `I'd like to share a project with you: ${proj.title}`,
      senderId: currentUid,
      senderRole: userType.value,
      sentAt: serverTimestamp(),
      projectSnapshot: {
        projectId: proj.id,
        title: proj.title || "",
        category: proj.category || "",
        location: proj.location || "",
        priceTier: proj.priceTier || "",
        description: proj.description || "",
        urgency: proj.urgency || "",
        timeline: proj.timeline || "",
        imageUrl: proj.imageUrl || (Array.isArray(proj.imageUrls) ? proj.imageUrls[0] : "") || "",
      },
    })
    selectedProject.value = null
  } else {
    // Regular text message
    const text = newMessage.value.trim()
    if (!text) return
    await addDoc(msgRef, {
      type: "text",
      text,
      senderId: currentUid,
      senderRole: userType.value,
      sentAt: serverTimestamp(),
    })
  }

  newMessage.value = ""
}

// ─────────────────────────────────────────
// Project sharing helpers
// ─────────────────────────────────────────
async function loadHomeownerProjects() {
  if (!currentUid) return
  loadingProjects.value = true
  try {
    const snap = await getDocs(
      query(
        collection(db, "portfolioProjects"),
        where("homeownerId", "==", currentUid)
      )
    )
    homeownerProjects.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error("Failed to load projects", e)
  }
  loadingProjects.value = false
}

function toggleProjectDropdown() {
  showProjectDropdown.value = !showProjectDropdown.value
}

function selectProject(proj) {
  selectedProject.value = proj
  showProjectDropdown.value = false
}

function clearSelectedProject() {
  selectedProject.value = null
}

// ─────────────────────────────────────────
// File attachment helpers
// ─────────────────────────────────────────
function triggerFilePick() {
  fileInputEl.value?.click()
}

function onFileChosen(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null
  pendingFile.value = { file, previewUrl, name: file.name, size: file.size, type: file.type }
  // reset input so same file can be re-selected
  e.target.value = ""
}

function clearPendingFile() {
  if (pendingFile.value?.previewUrl) URL.revokeObjectURL(pendingFile.value.previewUrl)
  pendingFile.value = null
  uploadProgress.value = 0
}

async function uploadAndSendFile() {
  if (!pendingFile.value || !selectedConvo.value) return
  const { file } = pendingFile.value
  const storage = getStorage()
  const path = `chat-files/${selectedConvo.value.id}/${Date.now()}_${file.name}`
  const sRef = storageRef(storage, path)
  const task = uploadBytesResumable(sRef, file)

  isUploading.value = true
  uploadProgress.value = 0

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
      },
      (err) => {
        isUploading.value = false
        console.error("Upload failed", err)
        reject(err)
      },
      async () => {
        const fileUrl = await getDownloadURL(task.snapshot.ref)
        const msgRef = collection(db, "conversations", selectedConvo.value.id, "messages")
        await addDoc(msgRef, {
          type: "file",
          text: "",
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          senderId: currentUid,
          senderRole: userType.value,
          sentAt: serverTimestamp(),
        })
        isUploading.value = false
        clearPendingFile()
        resolve()
      }
    )
  })
}

function goToProject(projectId) {
  if (projectId) {
    router.push(`/job-details/${projectId}`)
  }
}
 
function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}
 
watch(messages, () => scrollToBottom())

// Close dropdown when clicking outside
function handleClickOutside(e) {
  if (!e.target.closest('.project-selector-wrapper')) {
    showProjectDropdown.value = false
  }
}

// ─────────────────────────────────────────
// Firestore — advertisements
// ─────────────────────────────────────────
async function loadAds() {
  loadingAds.value = true
  try {
    const snap = await getDocs(
      query(collection(db, "advertisements"), orderBy("createdAt", "desc"))
    )
    ads.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  }
  loadingAds.value = false
}
 
function handleAdCta(ad) {
  if (ad.contractorId) {
    router.push({ name: "ContractorProfile", params: { id: ad.contractorId } })
  }
}
 
// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function formatTime(ts) {
  if (!ts) return ""
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
  return date.toLocaleDateString([], { day: "2-digit", month: "short" })
}
 
// ─────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────
onMounted(async () => {
  await resolveUserType()
  listenToConvos()
  loadAds()
  document.addEventListener("click", handleClickOutside)

  // Auto-open a conversation if navigated from ContractorCard
  const targetConvoId = route.query.convoId
  if (targetConvoId) {
    const unwatch = watch(convos, (list) => {
      const match = list.find(c => c.id === targetConvoId)
      if (match) {
        openConvo(match)
        unwatch()
      }
    }, { immediate: true })
  }
})
 
onUnmounted(() => {
  unsubConvos?.()
  unsubMessages?.()
  document.removeEventListener("click", handleClickOutside)
})
</script>
 
<style scoped>
.chats-page {
  background: #f3f4f6;
  min-height: calc(100vh - 72px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
 
/* ── Tab bar ── */
.tab-bar {
  display: flex;
  gap: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 32px;
}
 
.tab-btn {
  position: relative;
  background: none;
  border: none;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  gap: 8px;
}
 
.tab-btn.active {
  color: #2254f5;
  border-bottom-color: #2254f5;
}
 
/* ── Tab content wrapper ── */
.tab-content {
  padding: 24px 32px;
}
 
/* ─────────────────────────────────────
   CHATS PANE
───────────────────────────────────── */
.pane-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  height: calc(100vh - 180px);
}
 
/* Left sidebar */
.convo-list {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
 
.convo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
  transition: background 0.12s;
}
 
.convo-item:hover { background: #f9fafb; }
.convo-item.selected { background: #eff4ff; }
 
.convo-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.convo-info { flex: 1; min-width: 0; }
 
.convo-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}
 
.convo-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
.convo-time { font-size: 11px; color: #9ca3af; flex-shrink: 0; }

/* ─────────────────────────────────────
   RIGHT MESSAGE PANE
───────────────────────────────────── */
.message-pane {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
 
.no-convo {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 12px;
}
.no-convo-icon { font-size: 48px; }
.no-convo p { font-size: 15px; }
 
.message-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
 
.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
 
.header-name { font-size: 16px; font-weight: 700; color: #111827; }
.header-sub { font-size: 13px; color: #6b7280; }



/* ─────────────────────────────────────
   MESSAGES
───────────────────────────────────── */
.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
 
.msg-row { display: flex; }
.msg-mine { justify-content: flex-end; }
.msg-theirs { justify-content: flex-start; }
 
.bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}
 
.msg-mine .bubble {
  background: #2254f5;
  color: white;
  border-bottom-right-radius: 4px;
}
 
.msg-theirs .bubble {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}



.bubble p { margin: 0; }

.msg-time {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.65;
  text-align: right;
}

/* ─────────────────────────────────────
   INPUT AREA
───────────────────────────────────── */
.message-input-area {
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

/* ── Input toolbar (project + file attach) ── */
.input-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px 0;
  flex-wrap: wrap;
}

/* File attach button */
.attach-file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.attach-file-btn:hover {
  border-color: #2254f5;
  background: #eff4ff;
}

/* File chip extras */
.file-chip { max-width: 260px; }

.file-thumb-wrap { flex-shrink: 0; }

.file-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.project-selector-wrapper {
  position: relative;
}

.attach-project-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.attach-project-btn:hover,
.attach-project-btn.active {
  border-color: #2254f5;
  background: #eff4ff;
  color: #2254f5;
}

.attach-icon { font-size: 15px; }

.chevron {
  font-size: 10px;
  margin-left: 2px;
  opacity: 0.6;
}

/* Dropdown */
.project-dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  width: 300px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}

.dropdown-hint {
  padding: 16px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
}

.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: #f9fafb; }
.dropdown-item-selected { background: #eff4ff !important; }

.dropdown-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 3px;
}

.dropdown-item-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #6b7280;
}

.dropdown-budget {
  font-weight: 700;
  color: #ff5a1f;
}

/* Selected project chip */
.selected-project-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #eff4ff;
  border: 1.5px solid #c7d7fd;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 13px;
}

.chip-icon { font-size: 14px; }

.chip-title {
  font-weight: 600;
  color: #1e40af;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-remove {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
  margin-left: 2px;
  display: flex;
  align-items: center;
}

.chip-remove:hover { color: #ef4444; }

/* Text input row */
.message-input-row {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
}
 
.message-input-row input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
 
.message-input-row input:focus { border-color: #2254f5; }
 
.send-btn {
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
 
.send-btn:hover { background: #1a42d4; }
.send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
 
/* ─────────────────────────────────────
   ADS TAB
───────────────────────────────────── */
.ads-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
 
.ad-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
 
.ad-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
 
.ad-image { width: 100%; height: 180px; object-fit: cover; display: block; }
 
.ad-body { padding: 16px; }
 
.ad-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
 
.ad-title { margin: 0; font-size: 17px; font-weight: 700; color: #111827; }
 
.ad-badge {
  background: #fff3e0;
  color: #ff5a1f;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
 
.ad-desc { margin: 0 0 14px; font-size: 14px; color: #6b7280; line-height: 1.5; }
 
.ad-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
 
.ad-from { font-size: 13px; color: #9ca3af; }
 
.ad-cta {
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
 
.ad-cta:hover { background: #1a42d4; }
 
/* ── Shared ── */
.empty-hint {
  font-size: 14px;
  color: #9ca3af;
  padding: 20px 16px;
  text-align: center;
}
 
.empty-hint.centered { padding: 60px; }
 
@media (max-width: 900px) {
  .pane-layout { grid-template-columns: 1fr; }
  .convo-list { max-height: 280px; }
}
 
@media (max-width: 600px) {
  .tab-content { padding: 16px; }
  .tab-bar { padding: 0 16px; }
  .project-dropdown { width: 260px; }
}
</style>