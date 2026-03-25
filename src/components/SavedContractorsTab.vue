<template>
    <h2>Saved Contractors</h2>
    <p class="subtext">Contractors you liked that may get back to you!</p>

    <div class="opportunity-list">
        <div class="opportunity-card" v-for="job in opportunities" :key="job.id">
        <div class="opportunity-top">
            <div>
            <h3>{{ job.title }}</h3>
            <p class="subtext">Posted by {{ job.contractor }}</p>
            <div class="opportunity-meta">
                <span>📍 {{ job.location }}</span>
                <span>{{ job.budget }}</span>
                <span>Posted {{ job.date }}</span>
            </div>
            </div>

            <span class="status-badge">{{ job.status }}</span>
        </div>

        <div class="opportunity-actions">
            <button class="primary-btn small-btn">Send Proposal</button>
            <button class="secondary-btn small-btn">View Details</button>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"

const opportunities = ref([
    {
      id: 1,
      title: "Kitchen Renovation Needed",
      homeowner: "Sarah Johnson",
      location: "Bishan",
      budget: "$$$",
      date: "2/20/2024",
      status: "New",
    },
  ])
</script>

<style scoped>
  .subtext {
    color: #6b7280;
    margin-top: 0;
  }

  .opportunity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 18px;
  }

  .opportunity-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 22px;
  }
  
  .opportunity-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: start;
  }
  
  .opportunity-top h3 {
    margin: 0 0 8px;
  }
  
  .opportunity-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    color: #4b5563;
    margin-top: 10px;
  }
  
  .status-badge {
    background: #dcfce7;
    color: #15803d;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 600;
  }
  
  .opportunity-actions {
    display: flex;
    gap: 12px;
    margin-top: 18px;
  }

</style>