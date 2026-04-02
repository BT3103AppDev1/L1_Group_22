<template>
  <article class="contractor-card">
    <div class="card-left">
      <img
        :src="contractor.photoURL || defaultAvatar"
        :alt="contractor.fullName"
        class="contractor-photo"
      />
    </div>

    <div class="card-body">
      <div class="card-top-row">
        <div class="name-row">
          <h2 class="contractor-name">{{ contractor.fullName }}</h2>
          <span v-if="contractor.verified" class="verified-badge">Verified</span>
        </div>
        <div class="card-right">
          <button class="heart-btn" :class="{ favourited: isFavourited }" type="button" @click="toggleFavourite" :aria-label="isFavourited ? 'Remove from favourites' : 'Add to favourites'">
            <img :src="heartOutlineIcon" width="20" height="20" alt="favourite" />
          </button>
          <div class="price-badge" :class="priceTier">
            {{ priceTier }}
          </div>
        </div>
      </div>

      <p class="contractor-specialty">{{ contractor.skills?.[0] || 'General Contractor' }}</p>

      <div class="contractor-meta">
        <span v-if="contractor.rating" class="meta-item">
          <img :src="starIcon" width="14" height="14" alt="rating" class="meta-icon star-icon" />
          {{ contractor.rating }} ({{ contractor.reviewCount || 0 }})
        </span>
        <span v-if="contractor.location" class="meta-item">
          <img :src="locationIcon" width="14" height="14" alt="location" class="meta-icon" />
          {{ contractor.location }}
        </span>
        <span v-if="contractor.yearsExperience" class="meta-item">
          <img :src="bagIcon" width="14" height="14" alt="experience" class="meta-icon" />
          {{ contractor.yearsExperience }} yrs
        </span>
      </div>

      <div v-if="contractor.skills && contractor.skills.length" class="skills-row">
        <span v-for="skill in contractor.skills.slice(0, 3)" :key="skill" class="skill-tag">
          {{ skill }}
        </span>
      </div>

      <div class="card-actions">
        <button class="contact-btn" type="button" @click="$emit('contact', contractor)">
          Contact
        </button>

        <ReviewButton :contractorId="contractor.id"/> <!-- remove and insert into chat function once ready -->

        <button class="profile-btn" type="button" @click="$emit('view-profile', contractor)">
          View Profile
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import defaultAvatar from '@/assets/default-avatar.png'
import starIcon from '@/assets/star-outline.svg'
import locationIcon from '@/assets/location-outline.svg'
import bagIcon from '@/assets/bag-outline.svg'
import heartOutlineIcon from '@/assets/heart-outline.svg'
import ReviewButton from '@/components/ReviewButton.vue' //remove and insert into chat function once ready

const props = defineProps({
  contractor: {
    type: Object,
    required: true,
  },
})

defineEmits(['contact', 'view-profile'])

const isFavourited = ref(false)

function toggleFavourite() {
  isFavourited.value = !isFavourited.value
}

const priceTier = computed(() => {
  const budget = props.contractor.budgetPerHour || props.contractor.hourlyRate || 0
  if (budget < 50) return '$'
  if (budget < 100) return '$$'
  if (budget < 200) return '$$$'
  return '$$$$'
})
</script>

<style scoped>
.contractor-card {
  background: white;
  border-radius: 18px;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.contractor-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.card-left {
  width: 160px;
  min-width: 160px;
  height: 160px;
  flex-shrink: 0;
  align-self: center;
  margin: 16px 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;
}

.contractor-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.card-body {
  flex: 1;
  padding: 18px 20px;
  min-width: 0;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.contractor-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.verified-badge {
  background: #dde6ff;
  color: #2254f5;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.card-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.heart-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 0.4;
  transition: opacity 0.15s;
}

.heart-btn:hover,
.heart-btn.favourited {
  opacity: 1;
}

.heart-btn.favourited img {
  filter: invert(27%) sepia(90%) saturate(600%) hue-rotate(320deg);
}

.price-badge {
  font-size: 16px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 10px;
  background: #fff3e0;
  color: #ff5a1f;
  min-width: 44px;
  text-align: center;
}

.contractor-specialty {
  margin: 6px 0 10px;
  font-size: 15px;
  color: #6b7280;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.contractor-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-icon {
  opacity: 0.6;
  flex-shrink: 0;
}

.star-icon {
  opacity: 1;
  filter: invert(75%) sepia(60%) saturate(500%) hue-rotate(5deg);
}

.skills-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.skill-tag {
  background: #f3f4f6;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 999px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.contact-btn {
  flex: 1;
  background: #2254f5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s;
}

.contact-btn:hover {
  background: #1a42d4;
}

.profile-btn {
  background: white;
  color: #2254f5;
  border: 1.5px solid #2254f5;
  border-radius: 10px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.profile-btn:hover {
  background: #f0f4ff;
}

@media (max-width: 600px) {
  .contractor-card {
    flex-direction: column;
  }

  .card-left {
    width: 100%;
    height: 180px;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>