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
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* =========================
   FIREBASE
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyCY6ueoS5QRikxMd46OYJDrKcLpxg0UMmE",
  authDomain: "april-blossoms.firebaseapp.com",
  projectId: "april-blossoms",
  storageBucket: "april-blossoms-admin-images",
  messagingSenderId: "514363089189",
  appId: "1:514363089189:web:8abdc1c01ececd99653acc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app, "gs://april-blossoms-admin-images");

/* =========================
   DOM
========================= */
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

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
const bulkImportBtn = document.getElementById("bulkImportBtn");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewText = document.getElementById("imagePreviewText");

const adminProducts = document.getElementById("adminProducts");
const searchInput = document.getElementById("searchInput");
const filterAvailability = document.getElementById("filterAvailability");
const sortProducts = document.getElementById("sortProducts");
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

const reloadPurchasesBtn = document.getElementById("reloadPurchasesBtn");
const purchaseList = document.getElementById("purchaseList");
const purchaseStatTotal = document.getElementById("purchaseStatTotal");
const purchaseStatPaid = document.getElementById("purchaseStatPaid");
const purchaseStatRevenue = document.getElementById("purchaseStatRevenue");

const purchaseDrawer = document.getElementById("purchaseDrawer");
const purchaseDrawerOverlay = document.getElementById("purchaseDrawerOverlay");
const purchaseDrawerBody = document.getElementById("purchaseDrawerBody");
const purchaseDrawerSub = document.getElementById("purchaseDrawerSub");
const closePurchaseDrawerBtn = document.getElementById("closePurchaseDrawerBtn");

/* =========================
   STATE
========================= */
let allProducts = [];
let allPurchases = [];
let currentEditDocId = null;
let currentEditProduct = null;

/* =========================
   SEED PRODUCTS
========================= */
const SEED_PRODUCTS = [
  { id: "DRESS-001", title: "Floral Ruffles", price: 40.0, description: "One-of-a-kind floral ruffle dress", ageCategory: "4-5", images: ["IMG_5700.JPG"], available: true, createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "DRESS-002", title: "Sunshine Dress", price: 30.0, description: "Bright yellow play dress", ageCategory: "4-5", images: ["IMG_5701.JPG"], available: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "DRESS-003", title: "Party Bow Dress", price: 35.0, description: "Elegant dress for special occasions", ageCategory: "4-5", images: ["IMG_5702.JPG"], available: true, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "DRESS-004", title: "Polka Play", price: 35.0, description: "Polka-dot twirl dress", ageCategory: "4-5", images: ["IMG_5703.JPG"], available: true, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: "DRESS-005", title: "Candy Stripes", price: 35.0, description: "Soft striped cotton dress", ageCategory: "4-5", images: ["IMG_5704.JPG"], available: true, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "DRESS-006", title: "Meadow Tiny", price: 35.0, description: "Hand-stitched meadow pattern", ageCategory: "4-5", images: ["IMG_5705.JPG"], available: true, createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: "DRESS-007", title: "Lace Halo", price: 40.0, description: "Lace-trim party dress", ageCategory: "4-5", images: ["IMG_5706.JPG"], available: true, createdAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: "DRESS-008", title: "Seaside Sundress", price: 35.0, description: "Cool and breezy sun dress", ageCategory: "4-5", images: ["IMG_5707.JPG"], available: true, createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: "DRESS-009", title: "Minty Bow", price: 100.0, description: "White Shirt with skirt", ageCategory: "4-5", images: ["IMG_5708.JPG"], available: true, createdAt: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: "DRESS-010", title: "Rosette Charm", price: 35.0, description: "Rosette detailing, comfy fit", ageCategory: "4-5", images: ["IMG_5709.JPG"], available: true, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },

  { id: "DRESS-011", title: "Blossom Day", price: 30.0, description: "Lightweight blossom print dress", ageCategory: "4-5", images: ["IMG_5710.JPG"], available: true, createdAt: new Date(Date.now() - 11 * 86400000).toISOString() },
  { id: "DRESS-012", title: "Vintage Coral", price: 40.0, description: "Retro coral dress with pockets", ageCategory: "4-5", images: ["IMG_5711.JPG"], available: true, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: "DRESS-013", title: "Petal Puff", price: 30.0, description: "Petal-pattern puff sleeve dress", ageCategory: "4-5", images: ["IMG_5712.JPG"], available: true, createdAt: new Date(Date.now() - 13 * 86400000).toISOString() },
  { id: "DRESS-014", title: "Lemon Drop", price: 65.0, description: "Blue jeans trousers", ageCategory: "4-5", images: ["IMG_5713.JPG"], available: true, createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: "DRESS-015", title: "Bluebell Classic", price: 65.0, description: "Black jeans trousers", ageCategory: "4-5", images: ["IMG_5714.JPG"], available: true, createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "DRESS-016", title: "Gingham Girl", price: 35.0, description: "Cute gingham for playdates", ageCategory: "4-5", images: ["IMG_5715.JPG"], available: true, createdAt: new Date(Date.now() - 16 * 86400000).toISOString() },
  { id: "DRESS-017", title: "Velvet Holiday", price: 50.0, description: "Velvet holiday edition", ageCategory: "4-5", images: ["IMG_5716.JPG"], available: true, createdAt: new Date(Date.now() - 17 * 86400000).toISOString() },
  { id: "DRESS-018", title: "Daisy Chain", price: 70.0, description: "Daisy print with soft lining", ageCategory: "4-5", images: ["IMG_5717.JPG"], available: true, createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: "DRESS-019", title: "Sunset Ombre", price: 50.0, description: "Ombre fade summer dress", ageCategory: "4-5", images: ["IMG_5718.JPG"], available: true, createdAt: new Date(Date.now() - 19 * 86400000).toISOString() },
  { id: "DRESS-020", title: "Coral Petals", price: 70.0, description: "Coral floral with ruffled hem", ageCategory: "4-5", images: ["IMG_5719.JPG"], available: true, createdAt: new Date(Date.now() - 20 * 86400000).toISOString() },

  { id: "DRESS-021", title: "Lavender Mist", price: 28.0, description: "Soft lavender cotton dress", ageCategory: "4-5", images: ["IMG_5720.JPG"], available: true, createdAt: new Date(Date.now() - 21 * 86400000).toISOString() },
  { id: "DRESS-022", title: "Plaid Picnic", price: 28.0, description: "Cute plaid button dress", ageCategory: "4-5", images: ["IMG_5720.JPG"], available: true, createdAt: new Date(Date.now() - 22 * 86400000).toISOString() },
  { id: "DRESS-023", title: "Rosebud Twirl", price: 120.0, description: "Lightweight twirl skirt", ageCategory: "4-5", images: ["IMG_5721.JPG"], available: true, createdAt: new Date(Date.now() - 23 * 86400000).toISOString() },
  { id: "DRESS-024", title: "Mint Sprig", price: 80.0, description: "Refreshingly cool mint dress", ageCategory: "4-5", images: ["IMG_5722.JPG"], available: true, createdAt: new Date(Date.now() - 24 * 86400000).toISOString() },
  { id: "DRESS-025", title: "Buttercup", price: 35.0, description: "Premium buttercup fabric", ageCategory: "4-5", images: ["IMG_5723.JPG"], available: true, createdAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: "DRESS-026", title: "Peach Dream", price: 60.0, description: "Soft peach party dress", ageCategory: "4-5", images: ["IMG_5724.JPG"], available: true, createdAt: new Date(Date.now() - 26 * 86400000).toISOString() },
  { id: "DRESS-027", title: "Ivy Garden", price: 35.0, description: "Ivy print with tiny pleats", ageCategory: "4-5", images: ["IMG_5725.JPG"], available: true, createdAt: new Date(Date.now() - 27 * 86400000).toISOString() },
  { id: "DRESS-028", title: "Ocean Breeze", price: 45.0, description: "Nautical details and stripes", ageCategory: "4-5", images: ["IMG_5726.JPG"], available: true, createdAt: new Date(Date.now() - 28 * 86400000).toISOString() },
  { id: "DRESS-029", title: "Lilac Lace", price: 35.0, description: "Delicate lilac lace overlay", ageCategory: "4-5", images: ["IMG_5727.JPG"], available: true, createdAt: new Date(Date.now() - 29 * 86400000).toISOString() },
  { id: "DRESS-030", title: "Maple Sweet", price: 40.0, description: "Warm tones for autumn play", ageCategory: "4-5", images: ["IMG_5728.JPG"], available: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },

  { id: "DRESS-031", title: "Cherry Puff", price: 40.0, description: "Cherry prints and puff sleeves", ageCategory: "4-5", images: ["IMG_5729.JPG"], available: true, createdAt: new Date(Date.now() - 31 * 86400000).toISOString() },
  { id: "DRESS-032", title: "Starry Night", price: 35.0, description: "Dark blue with star pattern", ageCategory: "4-5", images: ["IMG_5730.JPG"], available: true, createdAt: new Date(Date.now() - 32 * 86400000).toISOString() },
  { id: "DRESS-033", title: "Palm Picnic", price: 35.0, description: "Tropical print for sunny days", ageCategory: "4-5", images: ["IMG_5731.JPG"], available: true, createdAt: new Date(Date.now() - 33 * 86400000).toISOString() },
  { id: "DRESS-034", title: "Velvet Ribbon", price: 40.0, description: "Lux velvet with ribbon tie", ageCategory: "4-5", images: ["IMG_5732.JPG"], available: true, createdAt: new Date(Date.now() - 34 * 86400000).toISOString() },
  { id: "DRESS-035", title: "Rose Quartz", price: 35.0, description: "Soft pink, comfy cotton", ageCategory: "4-5", images: ["IMG_5733.JPG"], available: true, createdAt: new Date(Date.now() - 35 * 86400000).toISOString() },
  { id: "DRESS-036", title: "Star Bloom", price: 30.0, description: "Star bloom pattern, breezy", ageCategory: "4-5", images: ["IMG_5734.JPG"], available: true, createdAt: new Date(Date.now() - 36 * 86400000).toISOString() },
  { id: "DRESS-037", title: "Meadow Stitch", price: 40.0, description: "Detailed stitching, floral", ageCategory: "4-5", images: ["IMG_5735.JPG"], available: true, createdAt: new Date(Date.now() - 37 * 86400000).toISOString() },
  { id: "DRESS-038", title: "Denim Dolly", price: 50.0, description: "Soft denim dress with buttons", ageCategory: "4-5", images: ["IMG_5736.JPG"], available: true, createdAt: new Date(Date.now() - 38 * 86400000).toISOString() },
  { id: "DRESS-039", title: "Citrine Bloom", price: 65.0, description: "Sunny citrine color", ageCategory: "4-5", images: ["IMG_5737.JPG"], available: true, createdAt: new Date(Date.now() - 39 * 86400000).toISOString() },
  { id: "DRESS-040", title: "Cloud Puff", price: 25.0, description: "Puffy clouds print", ageCategory: "4-5", images: ["IMG_5738.JPG"], available: true, createdAt: new Date(Date.now() - 40 * 86400000).toISOString() },

  { id: "DRESS-041", title: "Mint Melody", price: 28.0, description: "Light mint with trims", ageCategory: "4-5", images: ["IMG_5739.JPG"], available: true, createdAt: new Date(Date.now() - 41 * 86400000).toISOString() },
  { id: "DRESS-042", title: "Petite Pearl", price: 25.0, description: "Pearl button detail", ageCategory: "4-5", images: ["IMG_5740.JPG"], available: true, createdAt: new Date(Date.now() - 42 * 86400000).toISOString() },
  { id: "DRESS-043", title: "Coral Breeze", price: 35.0, description: "Soft coral shade", ageCategory: "4-5", images: ["IMG_5741.JPG"], available: true, createdAt: new Date(Date.now() - 43 * 86400000).toISOString() },
  { id: "DRESS-044", title: "Pineapple Pop", price: 30.0, description: "Fun pineapple print", ageCategory: "4-5", images: ["IMG_5742.JPG"], available: true, createdAt: new Date(Date.now() - 44 * 86400000).toISOString() },
  { id: "DRESS-045", title: "Willow Whisper", price: 40.0, description: "Earthy willow tones", ageCategory: "4-5", images: ["IMG_5743.JPG"], available: true, createdAt: new Date(Date.now() - 45 * 86400000).toISOString() },
  { id: "DRESS-046", title: "Sunbeam Tuck", price: 35.0, description: "Tucked waist, sunny print", ageCategory: "4-5", images: ["IMG_5744.JPG"], available: true, createdAt: new Date(Date.now() - 46 * 86400000).toISOString() },
  { id: "DRESS-047", title: "Peppermint Twist", price: 30.0, description: "Mint stripes and soft collar", ageCategory: "4-5", images: ["IMG_5745.JPG"], available: true, createdAt: new Date(Date.now() - 47 * 86400000).toISOString() },
  { id: "DRESS-048", title: "Dotted Dreams", price: 60.0, description: "Subtle dotted pattern", ageCategory: "4-5", images: ["IMG_5746.JPG"], available: true, createdAt: new Date(Date.now() - 48 * 86400000).toISOString() },
  { id: "DRESS-049", title: "Little Luxe", price: 80.0, description: "Tiny luxe finish", ageCategory: "7-8", images: ["IMG_5747.JPG"], available: true, createdAt: new Date(Date.now() - 49 * 86400000).toISOString() },
  { id: "DRESS-050", title: "Pocket Garden", price: 40.0, description: "Playful pockets and cotton", ageCategory: "4-5", images: ["IMG_5748.JPG"], available: true, createdAt: new Date(Date.now() - 50 * 86400000).toISOString() }
];

/* =========================
   HELPERS
========================= */
function money(value) {
  return `₵${Number(value || 0).toFixed(2)}`;
}

function setStatus(message, type = "info", target = adminStatus) {
  if (!target) return;
  target.textContent = message;
  target.className = `status ${type}`;
}

function setButtonLoading(button, isLoading, loadingText = "Processing...") {
  if (!button) return;
  const label = button.querySelector(".btn-label");
  button.classList.toggle("is-loading", isLoading);
  button.disabled = isLoading;

  if (label) {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = label.textContent;
    }
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

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

function normalizeProducts(snapshot) {
  return snapshot.docs.map((docSnap) => ({
    firestoreDocId: docSnap.id,
    ...docSnap.data()
  }));
}

function clearAddForm() {
  if (productId) productId.value = "";
  if (productTitle) productTitle.value = "";
  if (productPrice) productPrice.value = "";
  if (productAge) productAge.value = "";
  if (productDescription) productDescription.value = "";
  if (productImageFile) productImageFile.value = "";
  if (productImageUrl) productImageUrl.value = "";
  if (imagePreview) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
  }
  if (imagePreviewText) {
    imagePreviewText.textContent = "Choose an image file or paste an image URL.";
  }
}

function previewImageFromUrl(url, imgEl, textEl) {
  if (!imgEl || !textEl) return;
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
  if (!file || !imgEl || !textEl) return;
  const reader = new FileReader();
  reader.onload = () => {
    imgEl.src = reader.result;
    imgEl.classList.remove("hidden");
    textEl.textContent = `Selected file: ${file.name}`;
  };
  reader.readAsDataURL(file);
}

/* =========================
   SIDEBAR
========================= */
function toggleSidebar() {
  if (!sidebar) return;
  sidebar.classList.toggle("open");
}

function closeSidebarOnMobile() {
  if (!sidebar) return;
  if (window.innerWidth <= 980) {
    sidebar.classList.remove("open");
  }
}

menuToggle?.addEventListener("click", toggleSidebar);
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    sidebar?.classList.remove("open");
  }
});
document.addEventListener("click", (e) => {
  if (window.innerWidth > 980) return;
  if (!sidebar?.classList.contains("open")) return;
  const clickedInsideSidebar = sidebar.contains(e.target);
  const clickedToggle = menuToggle?.contains(e.target);
  if (!clickedInsideSidebar && !clickedToggle) {
    sidebar.classList.remove("open");
  }
});

/* =========================
   STORAGE
========================= */
async function uploadImageIfNeeded(file, fallbackUrl = "") {
  if (!file) return fallbackUrl || "";

  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to upload images.");
  }

  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = `products/${safeName}`;
  const storageRef = ref(storage, filePath);

  const uploadResult = await withTimeout(
    uploadBytes(storageRef, file, {
      contentType: file.type || "image/jpeg"
    }),
    20000,
    "Image upload timed out. Check Storage setup."
  );

  if (!uploadResult) {
    throw new Error("Image upload failed.");
  }

  const downloadUrl = await withTimeout(
    getDownloadURL(storageRef),
    10000,
    "Could not get uploaded image URL."
  );

  return downloadUrl;
}

/* =========================
   PRODUCTS
========================= */
function applyFilters(products) {
  const queryText = (searchInput?.value || "").trim().toLowerCase();
  const availability = filterAvailability?.value || "all";
  const sortValue = sortProducts?.value || "newest";

  let filtered = products.filter((product) => {
    const matchesQuery =
      !queryText ||
      String(product.title || "").toLowerCase().includes(queryText) ||
      String(product.id || "").toLowerCase().includes(queryText) ||
      String(product.ageCategory || "").toLowerCase().includes(queryText);

    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && product.available === true) ||
      (availability === "sold" && product.available === false);

    return matchesQuery && matchesAvailability;
  });

  filtered.sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return sortValue === "oldest" ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

function renderStats(products) {
  if (!statTotal || !statAvailable || !statSold || !statValue) return;

  const total = products.length;
  const available = products.filter((p) => p.available).length;
  const sold = total - available;
  const value = products
    .filter((p) => p.available)
    .reduce((sum, p) => sum + Number(p.price || 0), 0);

  statTotal.textContent = String(total);
  statAvailable.textContent = String(available);
  statSold.textContent = String(sold);
  statValue.textContent = money(value);
}

function renderProductList(products) {
  if (!adminProducts) return;

  if (!products.length) {
    adminProducts.innerHTML = `<div class="empty">No products found for the current filter.</div>`;
    return;
  }

  adminProducts.innerHTML = products.map((product) => {
    const image = product.images?.[0] || "";
    const availableClass = product.available ? "success" : "danger";
    const availableText = product.available ? "Available" : "Sold Out";
    const toggleText = product.available ? "Mark as Sold Out" : "Mark as Available";
    const toggleClass = product.available ? "" : "success";

    return `
      <div class="product-row">
        <div>
          <img class="product-thumb" src="${escapeHTML(image)}" alt="${escapeHTML(product.title || "Product image")}" onerror="this.style.display='none'">
        </div>

        <div>
          <div class="product-head">
            <div>
              <h3>${escapeHTML(product.title || "Untitled Product")}</h3>
              <p><strong>ID:</strong> ${escapeHTML(product.id || "-")}</p>
            </div>

            <div class="pill ${availableClass}">
              <i class="fa-solid ${product.available ? "fa-circle-check" : "fa-box-archive"}"></i>
              <span>${availableText}</span>
            </div>
          </div>

          <p><strong>Price:</strong> ${money(product.price)}</p>
          <p><strong>Age:</strong> ${escapeHTML(product.ageCategory || "-")}</p>
          <p><strong>Description:</strong> ${escapeHTML(product.description || "No description")}</p>
          <p><strong>Image:</strong> ${escapeHTML(image || "No image")}</p>

          <div class="product-actions">
            <button class="mini-btn ${toggleClass}" data-action="toggle" data-id="${product.firestoreDocId}">
              <i class="fa-solid ${product.available ? "fa-box-archive" : "fa-circle-check"}"></i>
              <span>${toggleText}</span>
            </button>

            <button class="mini-btn" data-action="edit" data-id="${product.firestoreDocId}">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Edit</span>
            </button>

            <button class="mini-btn danger" data-action="delete" data-id="${product.firestoreDocId}">
              <i class="fa-solid fa-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function loadAdminProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    allProducts = normalizeProducts(snapshot);
    renderStats(allProducts);
    renderProductList(applyFilters(allProducts));
  } catch (error) {
    console.error("Failed to load products:", error);
    if (adminProducts) {
      adminProducts.innerHTML = `<div class="empty">Failed to load products.</div>`;
    }
  }
}

function openEditModal(product) {
  currentEditDocId = product.firestoreDocId;
  currentEditProduct = product;

  if (editProductId) editProductId.value = product.id || "";
  if (editProductTitle) editProductTitle.value = product.title || "";
  if (editProductPrice) editProductPrice.value = product.price ?? "";
  if (editProductAge) editProductAge.value = product.ageCategory || "";
  if (editProductDescription) editProductDescription.value = product.description || "";
  if (editProductImageFile) editProductImageFile.value = "";
  if (editProductImageUrl) editProductImageUrl.value = product.images?.[0] || "";

  if (product.images?.[0]) {
    previewImageFromUrl(product.images[0], editImagePreview, editImagePreviewText);
  } else {
    if (editImagePreview) {
      editImagePreview.src = "";
      editImagePreview.classList.add("hidden");
    }
    if (editImagePreviewText) {
      editImagePreviewText.textContent = "Choose a replacement image file or URL.";
    }
  }

  setStatus("", "info", editStatus);
  editModal?.classList.add("open");
}

function closeEditModal() {
  editModal?.classList.remove("open");
  currentEditDocId = null;
  currentEditProduct = null;
}

/* =========================
   PURCHASES
========================= */
function renderPurchaseStats(purchases) {
  if (!purchaseStatTotal || !purchaseStatPaid || !purchaseStatRevenue) return;

  const total = purchases.length;
  const paid = purchases.filter((p) => (p.status || "paid") === "paid").length;
  const revenue = purchases.reduce((sum, p) => sum + Number(p.total || 0), 0);

  purchaseStatTotal.textContent = String(total);
  purchaseStatPaid.textContent = String(paid);
  purchaseStatRevenue.textContent = money(revenue);
}

function renderPurchaseList(purchases) {
  if (!purchaseList) return;

  if (!purchases.length) {
    purchaseList.innerHTML = `<div class="empty">No purchases yet.</div>`;
    return;
  }

  purchaseList.innerHTML = purchases.map((purchase) => {
    const customer = purchase.customer || {};
    const itemCount = Array.isArray(purchase.items) ? purchase.items.length : 0;
    const paidAt = purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : "No date";
    const status = purchase.status || "paid";

    return `
      <div class="purchase-card" data-purchase-id="${purchase.firestoreDocId}">
        <div class="purchase-card-top">
          <div>
            <h4>${escapeHTML(purchase.orderId || "No Order ID")}</h4>
            <p><strong>Name:</strong> ${escapeHTML(customer.fullName || "Unknown customer")}</p>
            <p><strong>Email:</strong> ${escapeHTML(customer.email || "-")}</p>
            <p><strong>Items:</strong> ${itemCount}</p>
          </div>

          <div class="purchase-total">
            <strong>${money(purchase.total)}</strong>
            <div class="pill ${status === "paid" ? "success" : "info"}">
              <i class="fa-solid ${status === "paid" ? "fa-circle-check" : "fa-clock"}"></i>
              <span>${escapeHTML(status.toUpperCase())}</span>
            </div>
            <p style="margin-top:8px;"><strong>Date:</strong> ${escapeHTML(paidAt)}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openPurchaseDrawer() {
  purchaseDrawer?.classList.add("open");
  purchaseDrawerOverlay?.classList.remove("hidden");
}

function closePurchaseDrawer() {
  purchaseDrawer?.classList.remove("open");
  purchaseDrawerOverlay?.classList.add("hidden");
}

function renderPurchaseDrawer(purchase) {
  if (!purchaseDrawerBody || !purchaseDrawerSub) return;

  const customer = purchase.customer || {};
  const items = Array.isArray(purchase.items) ? purchase.items : [];

  purchaseDrawerSub.textContent = `${purchase.orderId || "Order"} • ${purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : ""}`;

  purchaseDrawerBody.innerHTML = `
    <div class="purchase-detail-card">
      <h4>Order Information</h4>
      <div class="purchase-lines">
        <p><strong>Order ID:</strong> ${escapeHTML(purchase.orderId || "-")}</p>
        <p><strong>Paystack Ref:</strong> ${escapeHTML(purchase.paystackRef || "-")}</p>
        <p><strong>Status:</strong> ${escapeHTML(purchase.status || "paid")}</p>
        <p><strong>Subtotal:</strong> ${money(purchase.subtotal || 0)}</p>
        <p><strong>Processing Fee:</strong> ${money(purchase.processingFee || 0)}</p>
        <p><strong>Delivery Fee:</strong> ${money(purchase.deliveryFee || 0)}</p>
        <p><strong>Discount:</strong> ${money(purchase.discount || 0)}</p>
        <p><strong>Total:</strong> ${money(purchase.total || 0)}</p>
        <p><strong>Paid At:</strong> ${escapeHTML(purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : "-")}</p>
      </div>
    </div>

    <div class="purchase-detail-card">
      <h4>Customer Details</h4>
      <div class="purchase-lines">
        <p><strong>Full Name:</strong> ${escapeHTML(customer.fullName || "-")}</p>
        <p><strong>Email:</strong> ${escapeHTML(customer.email || "-")}</p>
        <p><strong>Phone:</strong> ${escapeHTML(customer.phone || "-")}</p>
        <p><strong>Delivery Option:</strong> ${escapeHTML(customer.delivery || "-")}</p>
        <p><strong>Address:</strong> ${escapeHTML(customer.address || "-")}</p>
        <p><strong>City:</strong> ${escapeHTML(customer.city || "-")}</p>
        <p><strong>Region:</strong> ${escapeHTML(customer.region || "-")}</p>
        <p><strong>Notes:</strong> ${escapeHTML(customer.notes || "No notes")}</p>
      </div>
    </div>

    <div class="purchase-detail-card">
      <h4>Purchased Items</h4>
      <div class="purchase-lines">
        ${
          items.length
            ? items.map((item) => {
                const image = item.images?.[0] || item.image || "";
                return `
                  <div class="purchase-product">
                    ${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(item.title || "Product")}" onerror="this.style.display='none'">` : ""}
                    <div class="purchase-lines">
                      <p><strong>Title:</strong> ${escapeHTML(item.title || "-")}</p>
                      <p><strong>ID:</strong> ${escapeHTML(item.id || "-")}</p>
                      <p><strong>Price:</strong> ${money(item.price || 0)}</p>
                      <p><strong>Quantity:</strong> ${escapeHTML(item.qty || 1)}</p>
                      <p><strong>Age Category:</strong> ${escapeHTML(item.ageCategory || "-")}</p>
                    </div>
                  </div>
                `;
              }).join("")
            : `<p>No items found for this order.</p>`
        }
      </div>
    </div>
  `;
}

async function loadPurchases() {
  try {
    const purchasesQuery = query(collection(db, "purchases"), orderBy("paidAt", "desc"));
    const snapshot = await getDocs(purchasesQuery);

    allPurchases = snapshot.docs.map((docSnap) => ({
      firestoreDocId: docSnap.id,
      ...docSnap.data()
    }));

    renderPurchaseStats(allPurchases);
    renderPurchaseList(allPurchases);
  } catch (error) {
    console.error("Failed to load purchases:", error);
    if (purchaseList) {
      purchaseList.innerHTML = `<div class="empty">Failed to load purchases.</div>`;
    }
  }
}

/* =========================
   BULK IMPORT
========================= */
async function bulkImportSeedProducts() {
  const user = auth.currentUser;
  if (!user) {
    setStatus("Log in first before bulk import.", "error");
    return;
  }

  const ok = confirm("Import all missing products from the original 50 into Firestore?");
  if (!ok) return;

  setButtonLoading(bulkImportBtn, true, "Importing...");
  setStatus("Checking existing products...", "info");

  try {
    const snapshot = await getDocs(collection(db, "products"));
    const existing = normalizeProducts(snapshot);
    const existingIds = new Set(existing.map((p) => p.id));

    const missingProducts = SEED_PRODUCTS.filter((p) => !existingIds.has(p.id));

    if (!missingProducts.length) {
      setStatus("All 50 products are already in Firestore.", "success");
      await loadAdminProducts();
      return;
    }

    for (const product of missingProducts) {
      await addDoc(collection(db, "products"), {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description || "",
        ageCategory: product.ageCategory || "",
        available: product.available !== false,
        images: Array.isArray(product.images) ? product.images : [],
        createdAt: product.createdAt || new Date().toISOString()
      });
    }

    await loadAdminProducts();
    setStatus(`${missingProducts.length} missing products imported successfully.`, "success");
  } catch (error) {
    console.error("Bulk import failed:", error);
    setStatus(error.message || "Bulk import failed.", "error");
  } finally {
    setButtonLoading(bulkImportBtn, false);
  }
}

/* =========================
   AUTH
========================= */
adminLoginBtn?.addEventListener("click", async () => {
  const email = adminEmail?.value.trim();
  const password = adminPassword?.value.trim();

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

logoutBtn?.addEventListener("click", async () => {
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
    if (authBadge) authBadge.textContent = user.email;
    logoutBtn?.classList.remove("hidden");
    setStatus(`Logged in as ${user.email}`, "success");
    await loadAdminProducts();
    await loadPurchases();
  } else {
    if (authBadge) authBadge.textContent = "Not logged in";
    logoutBtn?.classList.add("hidden");
    setStatus("Not logged in", "info");
    allProducts = [];
    allPurchases = [];
    renderStats([]);
    renderPurchaseStats([]);
    if (adminProducts) {
      adminProducts.innerHTML = `<div class="empty">Log in to manage products.</div>`;
    }
    if (purchaseList) {
      purchaseList.innerHTML = `<div class="empty">Log in to view purchases.</div>`;
    }
    closePurchaseDrawer();
  }
});

/* =========================
   FORM PREVIEWS
========================= */
productImageFile?.addEventListener("change", () => {
  const file = productImageFile.files?.[0];
  if (file) {
    previewImageFromFile(file, imagePreview, imagePreviewText);
    if (productImageUrl) productImageUrl.value = "";
  }
});

productImageUrl?.addEventListener("input", () => {
  const url = productImageUrl.value.trim();
  if (url) {
    previewImageFromUrl(url, imagePreview, imagePreviewText);
    if (productImageFile) productImageFile.value = "";
  } else {
    previewImageFromUrl("", imagePreview, imagePreviewText);
  }
});

editProductImageFile?.addEventListener("change", () => {
  const file = editProductImageFile.files?.[0];
  if (file) {
    previewImageFromFile(file, editImagePreview, editImagePreviewText);
    if (editProductImageUrl) editProductImageUrl.value = "";
  }
});

editProductImageUrl?.addEventListener("input", () => {
  const url = editProductImageUrl.value.trim();
  if (url) {
    previewImageFromUrl(url, editImagePreview, editImagePreviewText);
    if (editProductImageFile) editProductImageFile.value = "";
  } else {
    previewImageFromUrl("", editImagePreview, editImagePreviewText);
  }
});

/* =========================
   GENERAL EVENTS
========================= */
clearFormBtn?.addEventListener("click", clearAddForm);

closeEditModalBtn?.addEventListener("click", closeEditModal);
cancelEditBtn?.addEventListener("click", closeEditModal);
editModal?.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

searchInput?.addEventListener("input", () => {
  renderProductList(applyFilters(allProducts));
});

filterAvailability?.addEventListener("change", () => {
  renderProductList(applyFilters(allProducts));
});

sortProducts?.addEventListener("change", () => {
  renderProductList(applyFilters(allProducts));
});

reloadProductsBtn?.addEventListener("click", async () => {
  await loadAdminProducts();
  setStatus("Products reloaded", "success");
});

refreshBtn?.addEventListener("click", async () => {
  await Promise.all([loadAdminProducts(), loadPurchases()]);
  setStatus("Dashboard refreshed", "success");
});

openAddModalBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  productTitle?.focus();
});

reloadPurchasesBtn?.addEventListener("click", async () => {
  setButtonLoading(reloadPurchasesBtn, true, "Reloading...");
  await loadPurchases();
  setButtonLoading(reloadPurchasesBtn, false);
});

closePurchaseDrawerBtn?.addEventListener("click", closePurchaseDrawer);
purchaseDrawerOverlay?.addEventListener("click", closePurchaseDrawer);

purchaseList?.addEventListener("click", (e) => {
  const card = e.target.closest(".purchase-card");
  if (!card) return;

  const purchaseId = card.dataset.purchaseId;
  const purchase = allPurchases.find((p) => p.firestoreDocId === purchaseId);
  if (!purchase) return;

  renderPurchaseDrawer(purchase);
  openPurchaseDrawer();
  closeSidebarOnMobile();
});

bulkImportBtn?.addEventListener("click", bulkImportSeedProducts);

/* =========================
   ADD PRODUCT
========================= */
addProductBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    setStatus("You must log in first", "error");
    return;
  }

  const id = productId?.value.trim();
  const title = productTitle?.value.trim();
  const price = Number(productPrice?.value);
  const ageCategory = productAge?.value.trim();
  const description = productDescription?.value.trim();
  const file = productImageFile?.files?.[0];
  const imageUrlInput = productImageUrl?.value.trim();

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

/* =========================
   PRODUCT ACTIONS
========================= */
adminProducts?.addEventListener("click", async (e) => {
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

/* =========================
   SAVE EDIT
========================= */
saveEditBtn?.addEventListener("click", async () => {
  if (!currentEditDocId || !currentEditProduct) return;

  const user = auth.currentUser;
  if (!user) {
    setStatus("You must log in first", "error", editStatus);
    return;
  }

  const id = editProductId?.value.trim();
  const title = editProductTitle?.value.trim();
  const price = Number(editProductPrice?.value);
  const ageCategory = editProductAge?.value.trim();
  const description = editProductDescription?.value.trim();
  const file = editProductImageFile?.files?.[0];
  const imageUrlInput = editProductImageUrl?.value.trim();

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

/* =========================
   START
========================= */
window.adminSignOut = async function () {
  await signOut(auth);
};
