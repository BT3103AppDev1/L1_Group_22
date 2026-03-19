<template>
    <h2>Client Reviews</h2>
  
    <div class="review-summary">
        <div class="score-box">
            <div class="big-score">{{ contractor.rating }}</div>
                <div class="stars">★★★★★</div>
                <div class="muted">{{ contractor.reviewCount }} reviews</div>
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
                <div class="review-card" v-for="review in reviews" :key="review.id">
                <div class="review-card-top">
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
        </div>
    </div>
            
</template>

<script setup>
import { reactive, ref } from "vue"

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

const reviewBreakdown = ref([
    { stars: 5, percent: 75 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 1 },
])
  
const reviews = ref([
    {
      id: 1,
      name: "Sarah Johnson",
      project: "Kitchen Renovation",
      date: "2/15/2024",
      comment:
        "Excellent work! Michael and his team did an amazing job on our kitchen. Very professional and completed on time.",
    },
])


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
  
  .review-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
  }
  
  .review-card-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .review-card-top h3 {
    margin: 0;
  }
  
  .review-right {
    text-align: right;
  }
  
  .review-stars {
    color: #f6c400;
    margin-bottom: 4px;
  }
  
  .review-date {
    color: #6b7280;
    font-size: 14px;
  }
  
  .review-text {
    color: #374151;
    line-height: 1.6;
    margin: 0;
  }

  .subtext {
    color: #6b7280;
    margin-top: 0;
  }
</style>