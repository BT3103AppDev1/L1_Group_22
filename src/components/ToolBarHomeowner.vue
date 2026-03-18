<template>
    <div class="home">
      <header class="top-header">
        <div class="logo-section">
          <img src="@/assets/reliabuild_logo.jpg" alt="Reliabuild Logo" class="logo-image" />
          <div class="logo-text">Reliabuild</div>
        </div>
  
        <div class="top-actions">
          <button class="icon-btn" type="button">🔔</button>
          <button class="home-btn" type=""button @click="goToHome">
            Home
          </button>
          <button class="profile-btn" type="button" @click="goToProfile">
            My Profile
          </button>
          <button class="logout-btn" type="button" @click="logout">
            Log Out
          </button>
        </div>
      </header>
    </div>
</template>

<script setup>
import { signOut } from "firebase/auth"
import { useRouter } from "vue-router"

const router = useRouter()

function goToProfile() { 
  router.push("/homeowner/profile")
}

function goToHome() {
  router.push("/homeowner/home")
}
  
async function logout() {
    try {
      await signOut(auth)
      router.push("/")
    } catch (err) {
      console.log(err)
    }
}
</script>

<style scoped>
.home {
    min-height: 0vh;
    background: #f3f7fb;
    font-family: Arial, sans-serif;
    color: #1f2937;
}

.top-header {
    background: linear-gradient(90deg, #1f5eff, #1e49db);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 42px;
}
  
.logo-section {
    display: flex;
    align-items: center;
    gap: 10px;
}
  
.logo-image {
    width: 36px;
    height: 36px;
    object-fit: contain;
    display: block;
}
  
.logo-text {
    font-size: 20px;
    font-weight: 700;
}
  
.top-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-btn,
.profile-btn,
.home-btn,
.logout-btn {
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 600;
}
  
.icon-btn {
    background: transparent;
    color: white;
    font-size: 16px;
    padding: 8px;
}
  
.profile-btn,
.home-btn,
.logout-btn {
    background: white;
    color: #2754e6;
}
</style>