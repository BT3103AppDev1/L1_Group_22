// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDudCQ0MEkFkuPfZtrpVzWg6NH2MxJXzx4",
  authDomain: "bt3103-grp22.firebaseapp.com",
  projectId: "bt3103-grp22",
  storageBucket: "bt3103-grp22.firebasestorage.app",
  messagingSenderId: "337742249373",
  appId: "1:337742249373:web:a552fb5245315017efc374",
  measurementId: "G-WDPL1MXB7V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const googleProvider = new GoogleAuthProvider()

export { db, auth, storage, app, googleProvider}
