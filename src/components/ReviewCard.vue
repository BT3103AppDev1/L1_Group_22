<template>
    <div class="review-card">
        <div class="review-card-top">
            <div>
                <h3>{{ review.reviewerName }}</h3>
                <p class="subtext">{{ review.projectTitle }}</p>
            </div>

            <div class="review-right">
                <div class="review-stars">{{ "★".repeat(review.rating) + "☆".repeat(5 - review.rating) }}</div>
                <div class="review-date">{{ formattedDate }}</div>
            </div>
        </div>

        <p class="review-text">{{ review.comment }}</p>
    </div>

</template>

<script setup>
  import { computed } from "vue"

  const props = defineProps({
    review: {
      type: Object,
      required: true
    }
  })

  const formattedDate = computed(() => {
    if (!props.review.createdAt) return ""
    
    if (props.review.createdAt.seconds) {
      return new Date(props.review.createdAt.seconds * 1000).toLocaleDateString()
    }
    return new Date(props.review.createdAt).toLocaleDateString() //already a string?
  })
</script>

<style scoped>
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