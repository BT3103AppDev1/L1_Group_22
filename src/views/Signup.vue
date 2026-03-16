<template>
  <div class="container">
    <div class="login-header">
      <div class="header">
        <img id="logo" src="../assets/reliabuild_logo2.png" alt="Reliabuild Logo" />
        <h1 id="heading">Reliabuild</h1>
      </div>
      <p id="subtitle">Connect with trusted contractors</p>
    </div>

    <div class="login-form">
      <h2 id="title">Sign Up</h2>

      <label id="user-type-label">I am a</label>
      <div class="toggle-container">
        <button
          type="button"
          @click="chooseHomeowner"
          :class="{ active: userType === 'homeowner' }"
          class="toggle-btn"
        >
          Homeowner
        </button>
        <button
          type="button"
          @click="chooseContractor"
          :class="{ active: userType === 'contractor' }"
          class="toggle-btn"
        >
          Contractor
        </button>
      </div>

      <form @submit.prevent="handleSignup" class="form">
        <div class="form-group">
          <label for="fullName" class="form-label">Full Name</label>
          <input
            id="fullName"
            type="text"
            v-model="fullName"
            placeholder="E.g. John Doe"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            placeholder="E.g. johndoe"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            v-model="email"
            placeholder="you@example.com"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Create a password"
              required
              class="form-input password-input"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="password-toggle"
            >
              <EyeOff v-if="showPassword" class="icon" />
              <Eye v-else class="icon" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <div class="password-wrapper">
            <input
              id="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
              class="form-input password-input"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="password-toggle"
            >
              <EyeOff v-if="showConfirmPassword" class="icon" />
              <Eye v-else class="icon" />
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="submit-btn"
        >
          {{ isLoading ? "Creating account..." : "Sign Up" }}
        </button>
      </form>

      <div class="signup-section">
        Already have an account?
        <button @click="navigate('/')" class="signup-link">
          Log in
        </button>
      </div>
    </div>

    <div class="footer">
      By signing up, you agree to our
      <button class="policy-link">Terms of Service</button> and
      <button class="policy-link">Privacy Policy</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'  // adjust path if needed
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const router = useRouter()
const db = getFirestore()

const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const userType = ref('homeowner')

function chooseHomeowner() {
  userType.value = 'homeowner'
}

function chooseContractor() {
  userType.value = 'contractor'
}

const handleSignup = async () => {
  errorMessage.value = ''

  // Basic client-side validation
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    )

    const user = userCredential.user
    console.log('User created:', user.uid)

    // → Here you would normally:
    // 1. Save additional data to Firestore (fullName, username, userType)
    // 2. Set custom claims (if using role enforcement)
    // For now we just redirect

    // inside try block, after createUserWithEmailAndPassword
    await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName.value.trim(),
        username: username.value.trim(),
        userType: userType.value,
        email: email.value.trim(),
        createdAt: new Date()
    })

    router.push('/')

  } catch (error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage.value = 'This email is already registered'
        break
      case 'auth/invalid-email':
        errorMessage.value = 'Invalid email format'
        break
      case 'auth/weak-password':
        errorMessage.value = 'Password is too weak (min 6 characters)'
        break
      default:
        errorMessage.value = 'Sign up failed. Please try again.'
        console.error(error)
    }
  } finally {
    isLoading.value = false
  }
}

const navigate = (path) => {
  router.push(path)
}
</script>

<style scoped>

.container {
        background: #eff6ff;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
    }

    .login-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    #logo {
        width: 3.5rem;
        height: 3.5rem;
    }

    #heading {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    #subtitle {
        margin-top: 0.75rem;
        color: #4b5563;
    }

    .login-form {
        background: white;
        width: 100%;
        max-width: 420px;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        border: 1px solid #f3f4f6;
    }

    #title {
        text-align: center;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
    }

    #user-type-label {
        display: block;
        margin-bottom: 0.75rem;
        font-weight: 500;
        color: #374151;
    }

    .toggle-container {
        background: #f3f4f6;
        border-radius: 0.5rem;
        padding: 0.25rem;
        display: flex;
        margin-bottom: 1.5rem;
    }

    .toggle-btn {
        flex: 1;
        padding: 0.625rem;
        font-size: 0.875rem;
        font-weight: 600;
        border: none;
        background: none;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .toggle-btn.active {
        background: white;
        color: #1d4ed8;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .toggle-btn:hover {
        color: #111827; 
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-label {
        font-weight: 500;
        color: #374151;
    }

    .form-input,
    .password-input {
        height: 3rem;
        padding: 0 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 1rem;
        outline: none;
    }

    .form-input:focus,
    .password-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px #3b82f640;
    }

    .password-wrapper {
        position: relative;
    }

    #password {
        width: 100%;
        box-sizing: border-box;      
        padding: 0.75rem 1rem;        
        min-width: 0;                 
    }

    .password-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
    }

    .options-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        color: #4b5563;
    }

    .remember-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }

    .checkbox {
        width: 1rem;
        height: 1rem;
        border-radius: 0.25rem;
        accent-color: #2563eb;
    }

    .submit-btn {
        width: 100%;
        height: 3rem;
        background: linear-gradient(to right, #2563eb, #1d4ed8);
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .submit-btn:hover:not(:disabled) {
        background: linear-gradient(to right, #1d4ed8, #1e40af);
    }

    .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .signup-section,
    .footer {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.875rem;
        color: #4b5563;
    }

    .signup-link,
    .forgot-link,
    .policy-link {
        color: #2563eb;
        font-weight: 500;
        background: none;
        border: none;
        cursor: pointer;
    }

    .signup-link:hover,
    .forgot-link:hover,
    .policy-link:hover {
        color: #1d4ed8;
    }

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin: 0.5rem 0;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 0.25rem;
}


</style>