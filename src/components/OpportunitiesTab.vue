<template>
    <h2>Project Opportunities</h2>
    <p class="subtext">Projects posted by homeowners looking for contractors</p>
  
    <div class="opportunity-list">
        <div class="opportunity-card" v-for="job in opportunities" :key="job.id">
            <div class="opportunity-top">
                <div>
                    <h3>{{ job.title }}</h3>
                    <p class="subtext">Posted by {{ job.homeowner }}</p>
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
import { reactive, ref } from "vue"

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
  .primary-btn {
    border: none;
    background: #2958ec;
    color: white;
    border-radius: 10px;
    padding: 11px 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .secondary-btn {
    border: 1px solid #d1d5db;
    background: white;
    color: #111827;
    border-radius: 10px;
    padding: 11px 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .small-tag {
    background: #f3f4f6;
    color: #4b5563;
    padding: 5px 8px;
    border-radius: 8px;
    font-size: 12px;
  }

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