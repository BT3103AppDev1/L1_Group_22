<template>
  <h2>Reviews from Homeowners</h2>

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

  <div class="review-list">
      <!-- <div class="review-card" v-for="review in reviews" :key="review.id"> -->
    <ReviewCard
      v-for="review in reviews"
      :key="review.id"
      :review="review"
    />
        <!-- <div class="review-card-top">
          <div>
            <h3>{{ review.name }}</h3>
            <p class="subtext">{{ review.project }}</p>
          </div>

          <div class="review-right">
            <div class="review-stars">★★★★★</div>
            <div class="review-date">{{ review.date }}</div>
          </div>
        </div>

        <p class="review-text">{{ review.comment }}</p>
      </div> -->
  </div>      
</template>

<script setup>
import { reactive, ref, onMounted } from "vue"
import ReviewCard from "@/components/ReviewCard.vue"

// const contractor = reactive({
//     initial: "M",
//     fullName: "Samson Lim",
//     company: "Property Lim Brothers Renovation",
//     rating: 4.8,
//     reviewCount: 47,
//     projectsCompleted: 152,
//     email: "michael.tan@premiumreno.com",
//     phone: "+65 8234 5678",
//     location: "Jurong West, Singapore",
//     yearsExperience: 12,
//     skills: [
//       "Kitchen Renovation",
//       "Bathroom Remodeling",
//       "Carpentry",
//       "Flooring",
//       "Painting",
//       "Electrical Work",
//     ],
// })

// const reviewBreakdown = ref([
//     { stars: 5, percent: 75 },
//     { stars: 4, percent: 20 },
//     { stars: 3, percent: 3 },
//     { stars: 2, percent: 1 },
//     { stars: 1, percent: 1 },
// ])

// const reviews = ref([]) //use this once all is well
  
const reviews = ref([ //placeholder that becomes overridden if contractor is logged in. replace with above once everything is sorted
    {
      id: 1,
      reviewerId: "Sarah Placeholder",
      projectTitle: "Kitchen Renovation",
      createdAt: "2/15/2024",
      rating: 4,
      comment:
        "Excellent work! Michael and his team did an amazing job on our kitchen. Very professional and completed on time.",
    },
])

import { computed } from "vue" //from here --->

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0

  const total = reviews.value.reduce((sum, r) => sum + (r.rating || 0), 0)
  return (total / reviews.value.length).toFixed(1)
})

const reviewCount = computed(() => reviews.value.length)

const reviewBreakdown = computed(() => {
  const counts = [0, 0, 0, 0, 0] // index 0 = 1★, index 4 = 5★

  reviews.value.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      counts[r.rating - 1]++
    }
  })

  const total = reviews.value.length || 1

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars - 1]
    return {
      stars,
      percent: Math.round((count / total) * 100),
    }
  })
})                              //<--- to here is reviewbreakdown scoreboard code

import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { auth, db } from "@/firebase.js"

const errorMessage = ref("")

async function loadReviews() {
  try {
    // loading.value = true
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

    // const userData = userSnap.data()

    // if (userData.userType !== "homeowner") {
    //   errorMessage.value = "Only homeowners can add reviews."
    //   return
    // }

    const q = query(
      collection(db, "customerReviews"),
      where("targetId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(q)

    // reviews.value = snapshot.docs.map((reviewDoc) => ({ //this was limited to showing id only
    //   id: reviewDoc.id,
    //   ...reviewDoc.data(),
    // }))
    const reviewsWithNames = await Promise.all(
      snapshot.docs.map(async (reviewDoc) => {
        const reviewData = reviewDoc.data()

        // fetch reviewer info
        const reviewerRef = doc(db, "users", reviewData.reviewerId)
        const reviewerSnap = await getDoc(reviewerRef)

        let reviewerName = "Unknown User"

        if (reviewerSnap.exists()) {
          const reviewerData = reviewerSnap.data()
          reviewerName =
            reviewerData.fullName + " — " +reviewerData.username + ""
            || "User"
        }

        return {
          id: reviewDoc.id,
          ...reviewData,
          reviewerName,
        }
      })
    )

    reviews.value = reviewsWithNames

  } catch (error) {
    console.error("Error submitting review:", error)
    errorMessage.value = "Failed to submit review."
  } finally {
    // loading.value = false
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
  
  
</style>