<template>
    <div class="section-header">
        <h2>My Portfolio</h2>
        <button class="primary-btn">+ Add Project</button>
    </div>
  
    <div class="portfolio-grid">
        <div class="project-card" v-for="project in portfolio" :key="project.id">
            <img :src="project.image" :alt="project.title" class="project-image" />
  
            <div class="project-body">
                <div class="project-title-row">
                    <h3>{{ project.title }}</h3>
                    <span class="price-mark">{{ project.priceRange }}</span>
                </div>
  
                <p class="project-desc">{{ project.description }}</p>
  
                <div class="project-tags">
                    <span class="small-tag">{{ project.category }}</span>
                    <span class="small-tag">{{ project.location }}</span>
                    <span class="small-tag">{{ project.date }}</span>
                </div>
  
                <button class="full-outline-btn">Edit Project</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"

const portfolio = ref([
    {
      id: 1,
      title: "Modern Kitchen Renovation",
      description:
        "Complete kitchen transformation with custom cabinets, quartz countertops, and modern appliances.",
      category: "Kitchen Renovation",
      location: "Bishan",
      date: "Jan 2024",
      priceRange: "$$$",
      image:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      title: "Master Bathroom Remodel",
      description:
        "Luxury bathroom renovation featuring walk-in shower, double vanity, and heated floors.",
      category: "Bathroom",
      location: "Tampines",
      date: "Dec 2023",
      priceRange: "$$$$",
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      title: "Living Room Makeover",
      description:
        "Updated the living space with new flooring, repainting, lighting, and built-in storage.",
      category: "General Renovation",
      location: "Orchard",
      date: "Nov 2023",
      priceRange: "$$$",
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    },
  ])
</script>

<style scoped>
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
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

  .project-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    overflow: hidden;
    background: white;
  }
  
  .project-image {
    width: 100%;
    height: 210px;
    object-fit: cover;
    display: block;
  }
  
  .project-body {
    padding: 16px;
 }
  
  .project-title-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: start;
  }
  
  .project-title-row h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .price-mark {
    color: #ff5b1f;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }
  
  .project-desc {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
    margin: 10px 0 12px;
  }
  
  .project-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }


</style>