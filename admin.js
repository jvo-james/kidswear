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
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app, "gs://april-blossoms-admin-images");

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminStatus = document.getElementById("adminStatus");
const authBadge = document.getElementById("authBadge");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

const productId = document.getElementById("productId");
const productTitle = document.getElementById("productTitle");
const productPrice = document.getElementById("productPrice");
const productAge = document.getElementById("productAge");
const productDescription = document.getElementById("productDescription");
const productImageFile = document.getElementById("productImageFile");
const productImageUrl = document.getElementById("productImageUrl");
const addProductBtn = document.getElementById("addProductBtn");
const clearFormBtn = document.getElementById("clearFormBtn");

const imagePreview = document.getElementById("imagePreview");
const imagePreviewText = document.getElementById("imagePreviewText");

const adminProducts = document.getElementById("adminProducts");
const searchInput = document.getElementById("searchInput");
const filterAvailability = document.getElementById("filterAvailability");
const reloadProductsBtn = document.getElementById("reloadProductsBtn");
const openAddModalBtn = document.getElementById("openAddModalBtn");

const statTotal = document.getElementById("statTotal");
const statAvailable = document.getElementById("statAvailable");
const statSold = document.getElementById("statSold");
const statValue = document.getElementById("statValue");

const editModal = document.getElementById("editModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");
const editStatus = document.getElementById("editStatus");

const editProductId = document.getElementById("editProductId");
const editProductTitle = document.getElementById("editProductTitle");
const editProductPrice = document.getElementById("editProductPrice");
const editProductAge = document.getElementById("editProductAge");
const editProductDescription = document.getElementById("editProductDescription");
const editProductImageFile = document.getElementById("editProductImageFile");
const editProductImageUrl = document.getElementById("editProductImageUrl");
const editImagePreview = document.getElementById("editImagePreview");
const editImagePreviewText = document.getElementById("editImagePreviewText");

let allProducts = [];
let currentEditDocId = null;
let currentEditProduct = null;

function setStatus(message, type = "info", target = adminStatus) {
  target.textContent = message;
  target.className = `status ${type}`;
}

function money(value) {
  return `₵${Number(value || 0).toFixed(2)}`;
}

function setButtonLoading(button, isLoading, loadingText = "Processing...") {
  if (!button) return;
  const label = button.querySelector(".btn-label");
  button.classList.toggle("is-loading", isLoading);
  button.disabled = isLoading;
  if (label) {
    if (!button.dataset.originalLabel) button.dataset.originalLabel = label.textContent;
    label.textContent = isLoading ? loadingText : button.dataset.originalLabel;
  }
}

function withTimeout(promise, ms, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    })
  ]).finally(() => clearTimeout(timer));
}

function previewImageFromUrl(url, imgEl, textEl) {
  if (!url) {
    imgEl.src = "";
    imgEl.classList.add("hidden");
    textEl.textContent = "Choose an image file or paste an image URL.";
    return;
  }

  imgEl.src = url;
  imgEl.classList.remove("hidden");
  textEl.textContent = "Preview ready.";
}

function previewImageFromFile(file, imgEl, textEl) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imgEl.src = reader.result;
    imgEl.classList.remove("hidden");
    textEl.textContent = `Selected file: ${file.name}`;
  };
  reader.readAsDataURL(file);
}

productImageFile.addEventListener("change", () => {
  const file = productImageFile.files[0];
  if (file) {
    previewImageFromFile(file, imagePreview, imagePreviewText);
    productImageUrl.value = "";
  }
});

productImageUrl.addEventListener("input", () => {
  const url = productImageUrl.value.trim();
  if (url) {
    previewImageFromUrl(url, imagePreview, imagePreviewText);
    productImageFile.value = "";
  } else {
    previewImageFromUrl("", imagePreview, imagePreviewText);
  }
});

editProductImageFile.addEventListener("change", () => {
  const file = editProductImageFile.files[0];
  if (file) {
    previewImageFromFile(file, editImagePreview, editImagePreviewText);
    editProductImageUrl.value = "";
  }
});

editProductImageUrl.addEventListener("input", () => {
  const url = editProductImageUrl.value.trim();
  if (url) {
    previewImageFromUrl(url, editImagePreview, editImagePreviewText);
    editProductImageFile.value = "";
  } else {
    previewImageFromUrl("", editImagePreview, editImagePreviewText);
  }
});

function clearAddForm() {
  productId.value = "";
  productTitle.value = "";
  productPrice.value = "";
  productAge.value = "";
  productDescription.value = "";
  productImageFile.value = "";
  productImageUrl.value = "";
  imagePreview.src = "";
  imagePreview.classList.add("hidden");
  imagePreviewText.textContent = "Choose an image file or paste an image URL.";
}

clearFormBtn.addEventListener("click", clearAddForm);

function openEditModal(product) {
  currentEditDocId = product.firestoreDocId;
  currentEditProduct = product;

  editProductId.value = product.id || "";
  editProductTitle.value = product.title || "";
  editProductPrice.value = product.price ?? "";
  editProductAge.value = product.ageCategory || "";
  editProductDescription.value = product.description || "";
  editProductImageFile.value = "";
  editProductImageUrl.value = product.images?.[0] || "";

  if (product.images?.[0]) {
    previewImageFromUrl(product.images[0], editImagePreview, editImagePreviewText);
  } else {
    editImagePreview.src = "";
    editImagePreview.classList.add("hidden");
    editImagePreviewText.textContent = "Choose a replacement image file or URL.";
  }

  setStatus("", "info", editStatus);
  editModal.classList.add("open");
}

function closeEditModal() {
  editModal.classList.remove("open");
  currentEditDocId = null;
  currentEditProduct = null;
}

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

async function uploadImageIfNeeded(file, fallbackUrl = "") {
  if (!file) return fallbackUrl || "";

  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to upload images.");

  const filePath = `products/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, filePath);

  try {
    await withTimeout(
      uploadBytes(storageRef, file),
      15000,
      "Image upload timed out. Storage may not be enabled."
    );

    return await withTimeout(
      getDownloadURL(storageRef),
      10000,
      "Could not get uploaded image URL."
    );
  } catch (error) {
    console.error("Storage upload failed:", error);
    throw error;
  }
}

function normalizeProducts(snapshot) {
  return snapshot.docs.map((docSnap) => ({
    firestoreDocId: docSnap.id,
    ...docSnap.data()
  }));
}

function applyFilters(products) {
  const query = searchInput.value.trim().toLowerCase();
  const availability = filterAvailability.value;

  return products.filter((product) => {
    const matchesQuery =
      !query ||
      String(product.title || "").toLowerCase().includes(query) ||
      String(product.id || "").toLowerCase().includes(query) ||
      String(product.ageCategory || "").toLowerCase().includes(query);

    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && product.available === true) ||
      (availability === "sold" && product.available === false);

    return matchesQuery && matchesAvailability;
  });
}

function renderStats(products) {
  const total = products.length;
  const available = products.filter((p) => p.available).length;
  const sold = total - available;
  const value = products.filter((p) => p.available).reduce((sum, p) => sum + Number(p.price || 0), 0);

  statTotal.textContent = String(total);
  statAvailable.textContent = String(available);
  statSold.textContent = String(sold);
  statValue.textContent = money(value);
}

function renderProductList(products) {
  adminProducts.innerHTML = "";

  if (!products.length) {
    adminProducts.innerHTML = `<div class="empty">No products found for the current filter.</div>`;
    return;
  }

  products.forEach((product) => {
    const row = document.createElement("div");
    row.className = "product-row";

    const image = product.images?.[0] || "";
    const availabilityPill = product.available
      ? `<span class="pill success">Available</span>`
      : `<span class="pill danger">Sold Out</span>`;

    row.innerHTML = `
      <div>
        <img class="product-thumb" src="${image}" alt="${product.title || "Product image"}" onerror="this.style.display='none'">
      </div>
      <div>
        <div class="product-head">
          <div>
            <h3>${product.title || "Untitled Product"}</h3>
            <p><strong>ID:</strong> ${product.id || "-"}</p>
          </div>
          <div>${availabilityPill}</div>
        </div>

        <p><strong>Price:</strong> ${money(product.price)}</p>
        <p><strong>Age:</strong> ${product.ageCategory || "-"}</p>
        <p><strong>Description:</strong> ${product.description || "No description"}</p>
        <p><strong>Image:</strong> ${image || "No image"}</p>

        <div class="product-actions">
          <button class="mini-btn ${product.available ? "" : "success"}" data-action="toggle" data-id="${product.firestoreDocId}">
            ${product.available ? "Mark as Sold Out" : "Mark as Available"}
          </button>
          <button class="mini-btn" data-action="edit" data-id="${product.firestoreDocId}">
            Edit
          </button>
          <button class="mini-btn danger" data-action="delete" data-id="${product.firestoreDocId}">
            Delete
          </button>
        </div>
      </div>
    `;

    adminProducts.appendChild(row);
  });
}

async function loadAdminProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    allProducts = normalizeProducts(snapshot);

    const filtered = applyFilters(allProducts);
    renderStats(allProducts);
    renderProductList(filtered);
  } catch (error) {
    console.error("Failed to load admin products:", error);
    adminProducts.innerHTML = `<div class="empty">Failed to load products.</div>`;
  }
}

searchInput.addEventListener("input", () => {
  renderProductList(applyFilters(allProducts));
});

filterAvailability.addEventListener("change", () => {
  renderProductList(applyFilters(allProducts));
});

reloadProductsBtn.addEventListener("click", async () => {
  await loadAdminProducts();
  setStatus("Products reloaded", "success");
});

refreshBtn.addEventListener("click", async () => {
  await loadAdminProducts();
  setStatus("Products refreshed", "success");
});

openAddModalBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  productTitle.focus();
});

adminLoginBtn.addEventListener("click", async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value.trim();

  if (!email || !password) {
    setStatus("Enter email and password", "error");
    return;
  }

  setButtonLoading(adminLoginBtn, true, "Logging in...");
  setStatus("Logging in...", "info");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setStatus("Login successful", "success");
  } catch (error) {
    console.error("Admin login failed:", error);
    setStatus("Login failed", "error");
  } finally {
    setButtonLoading(adminLoginBtn, false);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("Logged out", "success");
  } catch (error) {
    console.error("Logout failed:", error);
    setStatus("Logout failed", "error");
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    authBadge.textContent = `Logged in: ${user.email}`;
    logoutBtn.classList.remove("hidden");
    setStatus(`Logged in as ${user.email}`, "success");
    await loadAdminProducts();
  } else {
    authBadge.textContent = "Not logged in";
    logoutBtn.classList.add("hidden");
    setStatus("Not logged in", "info");
    adminProducts.innerHTML = `<div class="empty">Log in to manage products.</div>`;
    allProducts = [];
    renderStats([]);
  }
});

addProductBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    setStatus("You must log in first", "error");
    return;
  }

  const id = productId.value.trim();
  const title = productTitle.value.trim();
  const price = Number(productPrice.value);
  const ageCategory = productAge.value.trim();
  const description = productDescription.value.trim();
  const file = productImageFile.files[0];
  const imageUrlInput = productImageUrl.value.trim();

  if (!id || !title || Number.isNaN(price) || price < 0 || !ageCategory) {
    setStatus("Fill in Product ID, Title, Price, and Age Category", "error");
    return;
  }

  setButtonLoading(addProductBtn, true, "Adding...");
  setStatus("Adding product...", "info");

  try {
    let finalImage = "";

    if (file) {
      finalImage = await uploadImageIfNeeded(file, "");
    } else if (imageUrlInput) {
      finalImage = imageUrlInput;
    }

    await withTimeout(
      addDoc(collection(db, "products"), {
        id,
        title,
        price,
        description: description || "",
        ageCategory,
        available: true,
        images: finalImage ? [finalImage] : [],
        createdAt: new Date().toISOString()
      }),
      10000,
      "Adding product timed out."
    );

    clearAddForm();
    await loadAdminProducts();
    setStatus("Product added successfully", "success");
  } catch (error) {
    console.error("Failed to add product:", error);
    setStatus(error.message || "Failed to add product.", "error");
  } finally {
    setButtonLoading(addProductBtn, false);
  }
});

adminProducts.addEventListener("click", async (e) => {
  const button = e.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const docId = button.dataset.id;
  const product = allProducts.find((p) => p.firestoreDocId === docId);

  if (!product) return;

  if (action === "toggle") {
    button.disabled = true;
    try {
      await updateDoc(doc(db, "products", docId), {
        available: !product.available
      });
      await loadAdminProducts();
      setStatus("Availability updated", "success");
    } catch (error) {
      console.error("Failed to update availability:", error);
      setStatus("Failed to update availability", "error");
    } finally {
      button.disabled = false;
    }
  }

  if (action === "edit") {
    openEditModal(product);
  }

  if (action === "delete") {
    const ok = confirm(`Delete ${product.title}? This cannot be undone.`);
    if (!ok) return;

    button.disabled = true;
    try {
      await deleteDoc(doc(db, "products", docId));
      await loadAdminProducts();
      setStatus("Product deleted", "success");
    } catch (error) {
      console.error("Failed to delete product:", error);
      setStatus("Failed to delete product", "error");
    } finally {
      button.disabled = false;
    }
  }
});

saveEditBtn.addEventListener("click", async () => {
  if (!currentEditDocId || !currentEditProduct) return;

  const user = auth.currentUser;
  if (!user) {
    setStatus("You must log in first", "error", editStatus);
    return;
  }

  const id = editProductId.value.trim();
  const title = editProductTitle.value.trim();
  const price = Number(editProductPrice.value);
  const ageCategory = editProductAge.value.trim();
  const description = editProductDescription.value.trim();
  const file = editProductImageFile.files[0];
  const imageUrlInput = editProductImageUrl.value.trim();

  if (!id || !title || Number.isNaN(price) || price < 0 || !ageCategory) {
    setStatus("Fill in Product ID, Title, Price, and Age Category", "error", editStatus);
    return;
  }

  setButtonLoading(saveEditBtn, true, "Saving...");
  setStatus("Saving changes...", "info", editStatus);

  try {
    let finalImage = currentEditProduct.images?.[0] || "";

    if (file) {
      finalImage = await uploadImageIfNeeded(file, finalImage);
    } else if (imageUrlInput) {
      finalImage = imageUrlInput;
    }

    await updateDoc(doc(db, "products", currentEditDocId), {
      id,
      title,
      price,
      ageCategory,
      description: description || "",
      images: finalImage ? [finalImage] : []
    });

    await loadAdminProducts();
    setStatus("Product updated successfully", "success");
    closeEditModal();
  } catch (error) {
    console.error("Failed to save edit:", error);
    setStatus(error.message || "Failed to save changes.", "error", editStatus);
  } finally {
    setButtonLoading(saveEditBtn, false);
  }
});

window.adminSignOut = async function () {
  await signOut(auth);
};
