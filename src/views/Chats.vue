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
              <!-- <p class="convo-preview">{{ convo.lastMessage || 'No messages yet' }}</p> -->
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
                <div class="bubble">
                  <p>{{ msg.text }}</p>
                  <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                </div>
              </div>
            </div>
 
            <!-- Input -->
            <div class="message-input-row">
              <input
                v-model="newMessage"
                placeholder="Type a message..."
                @keydown.enter="sendMessage"
              />
              <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
                Send
              </button>
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
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
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
import ToolBarHomeowner from "@/components/ToolBarHomeowner.vue"
import ToolBarContractor from "@/components/ToolBarContractor.vue"
import defaultAvatar from "@/assets/default-avatar.png"
 
const router = useRouter()
const auth = getAuth()
const currentUid = auth.currentUser?.uid
 
// ── User type (fetched from Firestore) ──
const userType = ref(null) // "homeowner" | "contractor"
 
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
    userType.value = snap.data().userType // "homeowner" or "contractor"
  }
}
 
// ─────────────────────────────────────────
// Firestore — conversations
// ─────────────────────────────────────────
 
function listenToConvos() {
  if (!currentUid || !userType.value) return
 
  // Query by whichever field matches this user's role
  const field = userType.value === "homeowner" ? "homeownerId" : "contractorId"
  const otherField = userType.value === "homeowner" ? "contractorId" : "homeownerId"
 
  const q = query(
    collection(db, "conversations"),
    where(field, "==", currentUid)
  )
 
  unsubConvos = onSnapshot(q, async (snap) => {
    const enriched = await Promise.all(
      snap.docs.map(async (d) => {
        const data = { id: d.id, ...d.data() }
        const otherUid = data[otherField]
 
        // Fetch the other person's profile to display in the sidebar
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
}
 
async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text || !selectedConvo.value) return
  newMessage.value = ""
 
  const msgRef = collection(db, "conversations", selectedConvo.value.id, "messages")
 
  await addDoc(msgRef, {
    text,
    senderId: currentUid,
    senderRole: userType.value,
    sentAt: serverTimestamp(),
  })
}
 
function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}
 
watch(messages, () => scrollToBottom())
 
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
})
 
onUnmounted(() => {
  unsubConvos?.()
  unsubMessages?.()
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
 
.convo-item:hover {
  background: #f9fafb;
}
 
.convo-item.selected {
  background: #eff4ff;
}
 
.convo-avatar img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.convo-info {
  flex: 1;
  min-width: 0;
}
 
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
 
.convo-time {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}
 
.convo-preview {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
 
/* Right message pane */
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
 
.no-convo-icon {
  font-size: 48px;
}
 
.no-convo p {
  font-size: 15px;
}
 
.message-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}
 
.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
 
.header-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
 
.header-sub {
  font-size: 13px;
  color: #6b7280;
}
 
.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
 
.msg-row {
  display: flex;
}
 
.msg-mine {
  justify-content: flex-end;
}
 
.msg-theirs {
  justify-content: flex-start;
}
 
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
 
.bubble p {
  margin: 0;
}
 
.msg-time {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.65;
  text-align: right;
}
 
.message-input-row {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #f3f4f6;
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
 
.message-input-row input:focus {
  border-color: #2254f5;
}
 
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
 
.send-btn:hover {
  background: #1a42d4;
}
 
.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
 
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
 
.ad-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
 
.ad-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}
 
.ad-body {
  padding: 16px;
}
 
.ad-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
 
.ad-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
}
 
.ad-badge {
  background: #fff3e0;
  color: #ff5a1f;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
 
.ad-desc {
  margin: 0 0 14px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}
 
.ad-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
 
.ad-from {
  font-size: 13px;
  color: #9ca3af;
}
 
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
 
.ad-cta:hover {
  background: #1a42d4;
}
 
/* ── Shared ── */
.empty-hint {
  font-size: 14px;
  color: #9ca3af;
  padding: 20px 16px;
  text-align: center;
}
 
.empty-hint.centered {
  padding: 60px;
}
 
@media (max-width: 900px) {
  .pane-layout {
    grid-template-columns: 1fr;
  }
 
  .convo-list {
    max-height: 280px;
  }
}
 
@media (max-width: 600px) {
  .tab-content {
    padding: 16px;
  }
 
  .tab-bar {
    padding: 0 16px;
  }
}
</style>