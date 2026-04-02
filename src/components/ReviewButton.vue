<template>
    <div class="opportunity-actions">
        <button class="primary-btn small-btn" @click="showReviewForm = true">Review</button>
    </div>
    
    <div v-if="showReviewForm" class="modal-backdrop">
        <div class="modal-card">
            <div class="modal-header">
                <h3>Review</h3>
                <button class="close-btn" @click="closeForm">×</button>
            </div>
        
            <div class="form-grid">
                <div class="field"> <!-- Rating -->
                    <label>Rating</label>
                    <div class="star-row">
                        <select v-model="review.rating">
                            <option :value="null">Select</option>
                            <option :value="1">★</option>
                            <option :value="2">★★</option>
                            <option :value="3">★★★</option>
                            <option :value="4">★★★★</option>
                            <option :value="5">★★★★★</option>
                        </select>
                    </div>
                </div>

                <div class="field">
                    <label>Review</label> <!-- Comment field -->
                    <textarea
                    v-model="review.comment"
                    rows="4"
                    placeholder="Share your experience..."
                    ></textarea>
                </div>

      
                <div class="field">  <!-- Optional for now, should be req since not review is not specific to each project but rather the contractor -->
                    <label>Project (optional)</label>
                    <input v-model="review.projectTitle" type="text" />
                </div>

            </div>

            <div class="form-actions">
                <button class="full-outline-btn" @click="closeForm">Discard</button>
                <button class="primary-btn" @click="submitReview">Submit</button>
            </div>
        </div>   
    </div>
</template>

<script setup>
import { ref, reactive,  } from "vue"

const props = defineProps({
  contractorId: {
    type: String,
    required: true
  }
})

const errorMessage = ref("")

const showReviewForm = ref(false)

const review = reactive({
    rating: 0,
    comment: "",
    projectTitle: ""
})

function resetForm() {
    review.rating = 0
    review.comment = ""
    review.projectTitle = ""
}

function closeForm() {
    resetForm()
    showReviewForm.value = false
}

import { addDoc, collection, serverTimestamp , doc , getDoc } from "firebase/firestore"
import { auth, db } from "@/firebase.js"

async function submitReview() { 
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
      errorMessage.value = "Only homeowners can add reviews."
      return
    }

    if (!review.rating || !review.comment.trim()) {
      errorMessage.value = "Please fill in all required fields."
      return
    }

    await addDoc(collection(db, "customerReviews"), {
      
      reviewerId: user.uid,   // homeowner
      targetId: props.contractorId, // need to figure this out eventually
      rating: review.rating,
      comment: review.comment,
      projectTitle: review.projectTitle || null,
      createdAt: serverTimestamp()

    })

    closeForm()

    alert("Review Submitted!")

    // await loadReviews()
  } catch (error) {
    console.error("Error submitting review:", error)
    errorMessage.value = "Failed to submit review."
  }
}


</script>

<style>

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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
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

</style>
