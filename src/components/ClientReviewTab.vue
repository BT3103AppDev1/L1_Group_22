<template>
  <h2>Homeowner's experience with the following Contractors</h2>
  <!-- Review summary/averages -->
  <div class="review-summary">
    <div class="score-box">
      <!-- <div class="big-score">{{ contractor.rating }}</div> -->
      <div class="big-score">{{ averageRating }}</div>
      <!-- <div class="stars">★★★★★</div> -->
      <div class="stars">{{ "★".repeat(Math.round(averageRating)) + "☆".repeat(5 - Math.round(averageRating)) }}</div>
      <!-- <div class="muted">{{ contractor.reviewCount }} reviews</div> -->
       <div class="muted">{{ reviewCount }} reviews</div>
    </div>

    <div class="breakdown">
      <div v-for="row in reviewBreakdown" :key="row.stars" class="bar-row">
        <span class="bar-label">{{ row.stars }} ★</span>
        <div class="bar-track">
          <div class="bar-fill" :style="{ width: row.percent + '%' }"></div>
        </div>
        <span class="bar-percent">{{ row.percent }}%</span>
      </div>
    </div>
  </div>

  <div v-if="loading" class="status-text">Loading reviews...</div>
  <div v-else-if="errorMessage" class="status-text error-text">{{ errorMessage }}</div>
  <div v-else-if="reviews.length === 0" class="status-text">No reviews given yet.</div>
  <!-- List of reviews (given to other contractors) -->
  <div v-else class="review-list">
    <ReviewCard
      v-for="review in reviews"
      :key="review.id"
      :review="review"
    />
  </div>      
</template>

<script setup>
  import { ref, computed, onMounted } from "vue"
  import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore"
  import { auth, db } from "@/firebase.js"
  import ReviewCard from "@/components/ReviewCard.vue"

  const props = defineProps({
    homeownerId: {
      type: String,
      required: true,
    },
  })

  const reviews = ref([])
  const loading = ref(true)
  const errorMessage = ref("")
  // Calculate review stats
  const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0
    const total = reviews.value.reduce((sum, r) => sum + (r.rating || 0), 0)
    return (total / reviews.value.length).toFixed(1)
  })

  const reviewCount = computed(() => reviews.value.length)

  const reviewBreakdown = computed(() => {
    const counts = [0, 0, 0, 0, 0]
    reviews.value.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++
    })
    const total = reviews.value.length || 1
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percent: Math.round((counts[stars - 1] / total) * 100),
    }))
  })
  // Get all relevant reviews
  async function loadReviews() {
    try {
      loading.value = true
      errorMessage.value = ""

      const q = query(
        collection(db, "customerReviews"),
        where("reviewerId", "==", props.homeownerId),
        orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q)

      reviews.value = await Promise.all(
        snapshot.docs.map(async (reviewDoc) => {
          const data = reviewDoc.data()

          // Fetch the contractor's name that this review was written about
          let reviewerName = "Unknown Contractor"
          try {
            const targetSnap = await getDoc(doc(db, "users", data.targetId))
            if (targetSnap.exists()) {
              reviewerName = targetSnap.data().fullName || "Unknown Contractor"
            }
          } catch (e) {
            console.error("Failed to fetch contractor name", e)
          }

          return {
            id: reviewDoc.id,
            ...data,
            reviewerName,
          }
        })
      )
    } catch (error) {
      console.error("Error loading reviews:", error)
      errorMessage.value = "Failed to load reviews."
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadReviews()
  })
</script>

<style scoped>
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
  .status-text {
    padding: 18px 0;
    color: #6b7280;
    font-size: 14px;
  }

  .error-text {
    color: #dc2626;
  }
</style>