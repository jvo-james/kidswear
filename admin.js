import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCY6ueoS5QRikxMd46OYJDrKcLpxg0UMmE",
    authDomain: "april-blossoms.firebaseapp.com",
    projectId: "april-blossoms",
    storageBucket: "april-blossoms.firebasestorage.app",
    messagingSenderId: "514363089189",
    appId: "1:514363089189:web:8abdc1c01ececd99653acc",
    measurementId: "G-7MLXN5D5ZW"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminStatus = document.getElementById("adminStatus");

adminLoginBtn.addEventListener("click", async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value.trim();

  if (!email || !password) {
    adminStatus.textContent = "Enter email and password";
    return;
  }

  adminStatus.textContent = "Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    adminStatus.textContent = "Login successful";
  } catch (error) {
    console.error("Admin login failed:", error);
    adminStatus.textContent = "Login failed";
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    adminStatus.textContent = `Logged in as ${user.email}`;
  } else {
    adminStatus.textContent = "Not logged in";
  }
});

window.adminSignOut = async function () {
  await signOut(auth);
};
