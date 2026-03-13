import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCY6ueoS5QRikxMd46OYJDrKcLpxg0UMmE",
  authDomain: "april-blossoms.firebaseapp.com",
  projectId: "april-blossoms",
  storageBucket: "april-blossoms.firebasestorage.app",
  messagingSenderId: "514363089189",
  appId: "1:514363089189:web:8abdc1c01ececd99653acc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminStatus = document.getElementById("adminStatus");

const productId = document.getElementById("productId");
const productTitle = document.getElementById("productTitle");
const productPrice = document.getElementById("productPrice");
const productAge = document.getElementById("productAge");
const productDescription = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");
const addProductBtn = document.getElementById("addProductBtn");

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

addProductBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    adminStatus.textContent = "You must log in first";
    return;
  }

  const id = productId.value.trim();
  const title = productTitle.value.trim();
  const price = Number(productPrice.value);
  const ageCategory = productAge.value.trim();
  const description = productDescription.value.trim();
  const imageName = productImage.value.trim();

  if (!id || !title || !price || !ageCategory || !description || !imageName) {
    adminStatus.textContent = "Fill in all product fields";
    return;
  }

  adminStatus.textContent = "Adding product...";

  try {
    await addDoc(collection(db, "products"), {
      id,
      title,
      price,
      description,
      ageCategory,
      available: true,
      images: [imageName],
      createdAt: new Date().toISOString()
    });

    adminStatus.textContent = "Product added successfully";

    productId.value = "";
    productTitle.value = "";
    productPrice.value = "";
    productAge.value = "";
    productDescription.value = "";
    productImage.value = "";
  } catch (error) {
    console.error("Failed to add product:", error);
    adminStatus.textContent = "Failed to add product";
  }
});
