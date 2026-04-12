<template>
  <h2 class="section-title">Project Opportunities</h2>
  <p class="subtext">Projects shared with you by homeowners</p>

  <div v-if="loading" class="empty-state">Loading opportunities…</div>
  <div v-else-if="opportunities.length === 0" class="empty-state">
    No projects shared with you yet.
  </div>

  <div v-else class="opportunity-list">
    <JobOpportunityCard
      v-for="job in opportunities"
      :key="job.id"
      :job="job"
      @proposal="sendProposal"
      @details="viewDetails"
      @contact="contactHomeowner"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getAuth } from "firebase/auth"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"
import JobOpportunityCard from "@/components/JobOpportunityCard.vue"

const router = useRouter()
const auth = getAuth()
const currentUid = auth.currentUser?.uid

const opportunities = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!currentUid) return
  try {
    const convoSnap = await getDocs(
      query(collection(db, "conversations"), where("contractorId", "==", currentUid))
    )

    const results = []

    for (const convoDoc of convoSnap.docs) {
      const homeownerId = convoDoc.data().homeownerId

      const msgSnap = await getDocs(
        collection(db, "conversations", convoDoc.id, "messages")
      )

      const projectMessages = msgSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.type === "projectLink")

      if (projectMessages.length === 0) continue

      let homeownerName = "Homeowner"
      try {
        const userSnap = await getDoc(doc(db, "users", homeownerId))
        if (userSnap.exists()) {
          const u = userSnap.data()
          homeownerName = u.fullName || u.username || "Homeowner"
        }
      } catch (e) {
        console.error("Failed to fetch homeowner", e)
      }

      const latest = projectMessages[projectMessages.length - 1]
      const snap = latest.projectSnapshot || {}

      let projectData = snap;

      if (snap.projectId) {
        try {
          const projectDoc = await getDoc(doc(db, "portfolioProjects", snap.projectId));
          console.log(snap.projectId)
          if (projectDoc.exists()) {
            projectData = { ...snap, ...projectDoc.data() }; // merge, so snapshot fields take precedence if needed
          }
        } catch (e) {
          console.warn("Could not fetch full project data", e);
        }
      }

      

      results.push({
          id: `${convoDoc.id}_${latest.id}`,
          projectId: snap.projectId,
          convoId: convoDoc.id,
          homeownerId,
          title: snap.title || projectData.title || "Untitled Project",
          homeowner: homeownerName,
          location: snap.location || projectData.location || "",
          budget: snap.priceTier || projectData.priceTier || "",
          description: snap.description || projectData.description || "",
          
          // ── Improved Image Handling ──
          imageUrl: projectData.imageUrl 
                  || projectData.imageUrls?.[0] 
                  || snap.imageUrl 
                  || snap.imageUrls?.[0] 
                  || "",

          date: latest.sentAt?.toDate
            ? latest.sentAt.toDate().toLocaleDateString("en-GB", { 
                day: "2-digit", 
                month: "short", 
                year: "numeric" 
              })
            : "",

          status: snap.urgency || projectData.urgency || "Open",
        })
    }

    opportunities.value = results
  } catch (e) {
    console.error("Failed to load opportunities", e)
  }
  loading.value = false
})

function sendProposal(job) {
  if (job.projectId) router.push(`/contractor/send-proposal/${job.projectId}`)
}

function viewDetails(job) {
  if (job.projectId) router.push(`/job-details/${job.projectId}`)
}

function contactHomeowner(job) {
  if (job.convoId) router.push({ path: "/chats", query: { convoId: job.convoId } })
}
</script>

<style scoped>
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subtext {
  color: #6b7280;
  margin: 0 0 20px;
  font-size: 14px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.empty-state {
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 0;
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.opportunity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>