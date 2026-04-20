<template>
  <!-- Trigger button (hidden when autoOpen is true — parent controls opening) -->
  <div v-if="!autoOpen" class="opportunity-actions">
    <button class="primary-btn small-btn" @click="showReviewForm = true">Review</button>
  </div>

  <div v-if="showReviewForm" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <h3>Leave a Review</h3>
        <button class="close-btn" @click="closeForm">×</button>
      </div>

      <div class="form-grid">
        <!-- Rating -->
        <div class="field">
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

        <!-- Comment -->
        <div class="field">
          <label>Review</label>
          <textarea
            v-model="review.comment"
            rows="4"
            placeholder="Share your experience..."
          ></textarea>
        </div>

        <!-- Project title (pre-filled if passed in) -->
        <div class="field">
          <label>Project</label>
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
  import { ref, reactive, watch } from "vue"
  import { addDoc, updateDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore"
  import { auth, db } from "@/firebase.js"

  const props = defineProps({
    contractorId: { type: String, required: true },
    convoId:      { type: String, default: '' },       // ties review to this job
    projectTitle: { type: String, default: '' },        // pre-filled from project snapshot
    autoOpen:     { type: Boolean, default: false },    // true = parent controls visibility
  })

  const emit = defineEmits(['submitted', 'close'])

  const errorMessage = ref("")
  const showReviewForm = ref(props.autoOpen)

  // Pre-fill project title when prop arrives
  const review = reactive({
    rating: null,
    comment: "",
    projectTitle: props.projectTitle || "",
  })

  // If autoOpen switches to true after mount, open the modal
  watch(() => props.autoOpen, (val) => {
    if (val) showReviewForm.value = true
  })

  function resetForm() {
    review.rating = null
    review.comment = ""
    review.projectTitle = props.projectTitle || ""
  }

  function closeForm() {
    resetForm()
    showReviewForm.value = false
    emit('close')
  }
  // Submit review
  async function submitReview() {
    try {
      errorMessage.value = ""

      const user = auth.currentUser
      if (!user) { alert("No logged-in user found."); return }

      const userSnap = await getDoc(doc(db, "users", user.uid))
      if (!userSnap.exists()) { alert("User profile not found."); return }

      if (userSnap.data().userType !== "homeowner") {
        alert("Only homeowners can add reviews.")
        return
      }

      if (!review.rating || !review.comment.trim()) {
        alert("Please fill in rating and comment.")
        return
      }

      // Write the review to firestore
      await addDoc(collection(db, "customerReviews"), {
        reviewerId:   user.uid,
        targetId:     props.contractorId,
        convoId:      props.convoId || null,
        rating:       review.rating,
        comment:      review.comment,
        projectTitle: review.projectTitle || null,
        createdAt:    serverTimestamp(),
      })

      // Update the conversation's jobSituation to "reviewed"
      if (props.convoId) {
        await updateDoc(doc(db, "conversations", props.convoId), {
          jobSituation: "reviewed",
        })
      }

      closeForm()
      emit('submitted')
      alert("Review submitted!")
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review.")
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

  .modal-header h3 { margin: 0; }

  .close-btn {
    border: none;
    background: transparent;
    font-size: 26px;
    cursor: pointer;
  }

  .form-grid { display: grid; gap: 14px; }

  .field { display: grid; gap: 6px; }

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