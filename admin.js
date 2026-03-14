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
  storageBucket: "april-blossoms.firebasestorage.app",
  messagingSenderId: "514363089189",
  appId: "1:514363089189:web:8abdc1c01ececd99653acc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* =========================
   DOM
========================= */
const authShell = document.getElementById("authShell");
const adminApp = document.getElementById("adminApp");

const loginForm = document.getElementById("loginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminStatus = document.getElementById("adminStatus");

const authBadge = document.getElementById("authBadge");
const mobileAuthBadge = document.getElementById("mobileAuthBadge");
const logoutBtn = document.getElementById("logoutBtn");
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const headerPageTitle = document.getElementById("headerPageTitle");

const mobileUserMenuBtn = document.getElementById("mobileUserMenuBtn");
const mobileUserDropdown = document.getElementById("mobileUserDropdown");

const pageSections = Array.from(document.querySelectorAll(".page-section"));
const pageLinks = Array.from(document.querySelectorAll("[data-page-link]"));
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));

const dashboardRefreshBtn = document.getElementById("dashboardRefreshBtn");

const statTotal = document.getElementById("statTotal");
const statAvailable = document.getElementById("statAvailable");
const statSold = document.getElementById("statSold");
const statValue = document.getElementById("statValue");

const purchaseStatTotal = document.getElementById("purchaseStatTotal");
const purchaseStatPaid = document.getElementById("purchaseStatPaid");
const purchaseStatRevenue = document.getElementById("purchaseStatRevenue");
const purchaseStatTotalDuplicate = document.getElementById("purchaseStatTotalDuplicate");
const purchaseStatPaidDuplicate = document.getElementById("purchaseStatPaidDuplicate");
const purchaseStatRevenueDuplicate = document.getElementById("purchaseStatRevenueDuplicate");

const refreshPurchasesBtnSecondary = document.getElementById("refreshPurchasesBtnSecondary");
const purchaseList = document.getElementById("purchaseList");

const productId = document.getElementById("productId");
const productTitle = document.getElementById("productTitle");
const productPrice = document.getElementById("productPrice");
const productAge = document.getElementById("productAge");
const productDescription = document.getElementById("productDescription");
const productImageFile = document.getElementById("productImageFile");
const productImageUrl = document.getElementById("productImageUrl");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewText = document.getElementById("imagePreviewText");
const addProductBtn = document.getElementById("addProductBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const bulkImportBtn = document.getElementById("bulkImportBtn");

const searchInput = document.getElementById("searchInput");
const filterAvailability = document.getElementById("filterAvailability");
const sortProducts = document.getElementById("sortProducts");
const reloadProductsBtn = document.getElementById("reloadProductsBtn");
const adminProducts = document.getElementById("adminProducts");

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
let activePageId = "dashboardPage";

/* =========================
   ORIGINAL 50 PRODUCTS
========================= */
const SEED_PRODUCTS = [
  { id: "DRESS-001", title: "Floral Ruffles", price: 40.0, description: "One-of-a-kind floral ruffle dress", ageCategory: "4-5", images: ["IMG_5700.JPG"], available: true, createdAt: new Date(Date.now()-1*86400000).toISOString() },
  { id: "DRESS-002", title: "Sunshine Dress", price: 30.0, description: "Bright yellow play dress", ageCategory: "4-5", images: ["IMG_5701.JPG"], available: true, createdAt: new Date(Date.now()-2*86400000).toISOString() },
  { id: "DRESS-003", title: "Party Bow Dress", price: 35.0, description: "Elegant dress for special occasions", ageCategory: "4-5", images: ["IMG_5702.JPG"], available: true, createdAt: new Date(Date.now()-3*86400000).toISOString() },
  { id: "DRESS-004", title: "Polka Play", price: 35.0, description: "Polka-dot twirl dress", ageCategory: "4-5", images: ["IMG_5703.JPG"], available: true, createdAt: new Date(Date.now()-4*86400000).toISOString() },
  { id: "DRESS-005", title: "Candy Stripes", price: 35.0, description: "Soft striped cotton dress", ageCategory: "4-5", images: ["IMG_5704.JPG"], available: true, createdAt: new Date(Date.now()-5*86400000).toISOString() },
  { id: "DRESS-006", title: "Meadow Tiny", price: 35.0, description: "Hand-stitched meadow pattern", ageCategory: "4-5", images: ["IMG_5705.JPG"], available: true, createdAt: new Date(Date.now()-6*86400000).toISOString() },
  { id: "DRESS-007", title: "Lace Halo", price: 40.0, description: "Lace-trim party dress", ageCategory: "4-5", images: ["IMG_5706.JPG"], available: true, createdAt: new Date(Date.now()-7*86400000).toISOString() },
  { id: "DRESS-008", title: "Seaside Sundress", price: 35.0, description: "Cool and breezy sun dress", ageCategory: "4-5", images: ["IMG_5707.JPG"], available: true, createdAt: new Date(Date.now()-8*86400000).toISOString() },
  { id: "DRESS-009", title: "Minty Bow", price: 100.0, description: "White Shirt with skirt", ageCategory: "4-5", images: ["IMG_5708.JPG"], available: true, createdAt: new Date(Date.now()-9*86400000).toISOString() },
  { id: "DRESS-010", title: "Rosette Charm", price: 35.0, description: "Rosette detailing, comfy fit", ageCategory: "4-5", images: ["IMG_5709.JPG"], available: true, createdAt: new Date(Date.now()-10*86400000).toISOString() },

  { id: "DRESS-011", title: "Blossom Day", price: 30.0, description: "Lightweight blossom print dress", ageCategory: "4-5", images: ["IMG_5710.JPG"], available: true, createdAt: new Date(Date.now()-11*86400000).toISOString() },
  { id: "DRESS-012", title: "Vintage Coral", price: 40.0, description: "Retro coral dress with pockets", ageCategory: "4-5", images: ["IMG_5711.JPG"], available: true, createdAt: new Date(Date.now()-12*86400000).toISOString() },
  { id: "DRESS-013", title: "Petal Puff", price: 30.0, description: "Petal-pattern puff sleeve dress", ageCategory: "4-5", images: ["IMG_5712.JPG"], available: true, createdAt: new Date(Date.now()-13*86400000).toISOString() },
  { id: "DRESS-014", title: "Lemon Drop", price: 65.0, description: "Blue jeans trousers", ageCategory: "4-5", images: ["IMG_5713.JPG"], available: true, createdAt: new Date(Date.now()-14*86400000).toISOString() },
  { id: "DRESS-015", title: "Bluebell Classic", price: 65.0, description: "Black jeans trousers", ageCategory: "4-5", images: ["IMG_5714.JPG"], available: true, createdAt: new Date(Date.now()-15*86400000).toISOString() },
  { id: "DRESS-016", title: "Gingham Girl", price: 35.0, description: "Cute gingham for playdates", ageCategory: "4-5", images: ["IMG_5715.JPG"], available: true, createdAt: new Date(Date.now()-16*86400000).toISOString() },
  { id: "DRESS-017", title: "Velvet Holiday", price: 50.0, description: "Velvet holiday edition", ageCategory: "4-5", images: ["IMG_5716.JPG"], available: true, createdAt: new Date(Date.now()-17*86400000).toISOString() },
  { id: "DRESS-018", title: "Daisy Chain", price: 70.0, description: "Daisy print with soft lining", ageCategory: "4-5", images: ["IMG_5717.JPG"], available: true, createdAt: new Date(Date.now()-18*86400000).toISOString() },
  { id: "DRESS-019", title: "Sunset Ombre", price: 50.0, description: "Ombre fade summer dress", ageCategory: "4-5", images: ["IMG_5718.JPG"], available: true, createdAt: new Date(Date.now()-19*86400000).toISOString() },
  { id: "DRESS-020", title: "Coral Petals", price: 70.0, description: "Coral floral with ruffled hem", ageCategory: "4-5", images: ["IMG_5719.JPG"], available: true, createdAt: new Date(Date.now()-20*86400000).toISOString() },

  { id: "DRESS-021", title: "Lavender Mist", price: 28.0, description: "Soft lavender cotton dress", ageCategory: "4-5", images: ["IMG_5720.JPG"], available: true, createdAt: new Date(Date.now()-21*86400000).toISOString() },
  { id: "DRESS-022", title: "Plaid Picnic", price: 28.0, description: "Cute plaid button dress", ageCategory: "4-5", images: ["IMG_5720.JPG"], available: true, createdAt: new Date(Date.now()-22*86400000).toISOString() },
  { id: "DRESS-023", title: "Rosebud Twirl", price: 120.0, description: "Lightweight twirl skirt", ageCategory: "4-5", images: ["IMG_5721.JPG"], available: true, createdAt: new Date(Date.now()-23*86400000).toISOString() },
  { id: "DRESS-024", title: "Mint Sprig", price: 80.0, description: "Refreshingly cool mint dress", ageCategory: "4-5", images: ["IMG_5722.JPG"], available: true, createdAt: new Date(Date.now()-24*86400000).toISOString() },
  { id: "DRESS-025", title: "Buttercup", price: 35.0, description: "Premium buttercup fabric", ageCategory: "4-5", images: ["IMG_5723.JPG"], available: true, createdAt: new Date(Date.now()-25*86400000).toISOString() },
  { id: "DRESS-026", title: "Peach Dream", price: 60.0, description: "Soft peach party dress", ageCategory: "4-5", images: ["IMG_5724.JPG"], available: true, createdAt: new Date(Date.now()-26*86400000).toISOString() },
  { id: "DRESS-027", title: "Ivy Garden", price: 35.0, description: "Ivy print with tiny pleats", ageCategory: "4-5", images: ["IMG_5725.JPG"], available: true, createdAt: new Date(Date.now()-27*86400000).toISOString() },
  { id: "DRESS-028", title: "Ocean Breeze", price: 45.0, description: "Nautical details and stripes", ageCategory: "4-5", images: ["IMG_5726.JPG"], available: true, createdAt: new Date(Date.now()-28*86400000).toISOString() },
  { id: "DRESS-029", title: "Lilac Lace", price: 35.0, description: "Delicate lilac lace overlay", ageCategory: "4-5", images: ["IMG_5727.JPG"], available: true, createdAt: new Date(Date.now()-29*86400000).toISOString() },
  { id: "DRESS-030", title: "Maple Sweet", price: 40.0, description: "Warm tones for autumn play", ageCategory: "4-5", images: ["IMG_5728.JPG"], available: true, createdAt: new Date(Date.now()-30*86400000).toISOString() },

  { id: "DRESS-031", title: "Cherry Puff", price: 40.0, description: "Cherry prints and puff sleeves", ageCategory: "4-5", images: ["IMG_5729.JPG"], available: true, createdAt: new Date(Date.now()-31*86400000).toISOString() },
  { id: "DRESS-032", title: "Starry Night", price: 35.0, description: "Dark blue with star pattern", ageCategory: "4-5", images: ["IMG_5730.JPG"], available: true, createdAt: new Date(Date.now()-32*86400000).toISOString() },
  { id: "DRESS-033", title: "Palm Picnic", price: 35.0, description: "Tropical print for sunny days", ageCategory: "4-5", images: ["IMG_5731.JPG"], available: true, createdAt: new Date(Date.now()-33*86400000).toISOString() },
  { id: "DRESS-034", title: "Velvet Ribbon", price: 40.0, description: "Lux velvet with ribbon tie", ageCategory: "4-5", images: ["IMG_5732.JPG"], available: true, createdAt: new Date(Date.now()-34*86400000).toISOString() },
  { id: "DRESS-035", title: "Rose Quartz", price: 35.0, description: "Soft pink, comfy cotton", ageCategory: "4-5", images: ["IMG_5733.JPG"], available: true, createdAt: new Date(Date.now()-35*86400000).toISOString() },
  { id: "DRESS-036", title: "Star Bloom", price: 30.0, description: "Star bloom pattern, breezy", ageCategory: "4-5", images: ["IMG_5734.JPG"], available: true, createdAt: new Date(Date.now()-36*86400000).toISOString() },
  { id: "DRESS-037", title: "Meadow Stitch", price: 40.0, description: "Detailed stitching, floral", ageCategory: "4-5", images: ["IMG_5735.JPG"], available: true, createdAt: new Date(Date.now()-37*86400000).toISOString() },
  { id: "DRESS-038", title: "Denim Dolly", price: 50.0, description: "Soft denim dress with buttons", ageCategory: "4-5", images: ["IMG_5736.JPG"], available: true, createdAt: new Date(Date.now()-38*86400000).toISOString() },
  { id: "DRESS-039", title: "Citrine Bloom", price: 65.0, description: "Sunny citrine color", ageCategory: "4-5", images: ["IMG_5737.JPG"], available: true, createdAt: new Date(Date.now()-39*86400000).toISOString() },
  { id: "DRESS-040", title: "Cloud Puff", price: 25.0, description: "Puffy clouds print", ageCategory: "4-5", images: ["IMG_5738.JPG"], available: true, createdAt: new Date(Date.now()-40*86400000).toISOString() },

  { id: "DRESS-041", title: "Mint Melody", price: 28.0, description: "Light mint with trims", ageCategory: "4-5", images: ["IMG_5739.JPG"], available: true, createdAt: new Date(Date.now()-41*86400000).toISOString() },
  { id: "DRESS-042", title: "Petite Pearl", price: 25.0, description: "Pearl button detail", ageCategory: "4-5", images: ["IMG_5740.JPG"], available: true, createdAt: new Date(Date.now()-42*86400000).toISOString() },
  { id: "DRESS-043", title: "Coral Breeze", price: 35.0, description: "Soft coral shade", ageCategory: "4-5", images: ["IMG_5741.JPG"], available: true, createdAt: new Date(Date.now()-43*86400000).toISOString() },
  { id: "DRESS-044", title: "Pineapple Pop", price: 30.0, description: "Fun pineapple print", ageCategory: "4-5", images: ["IMG_5742.JPG"], available: true, createdAt: new Date(Date.now()-44*86400000).toISOString() },
  { id: "DRESS-045", title: "Willow Whisper", price: 40.0, description: "Earthy willow tones", ageCategory: "4-5", images: ["IMG_5743.JPG"], available: true, createdAt: new Date(Date.now()-45*86400000).toISOString() },
  { id: "DRESS-046", title: "Sunbeam Tuck", price: 35.0, description: "Tucked waist, sunny print", ageCategory: "4-5", images: ["IMG_5744.JPG"], available: true, createdAt: new Date(Date.now()-46*86400000).toISOString() },
  { id: "DRESS-047", title: "Peppermint Twist", price: 30.0, description: "Mint stripes and soft collar", ageCategory: "4-5", images: ["IMG_5745.JPG"], available: true, createdAt: new Date(Date.now()-47*86400000).toISOString() },
  { id: "DRESS-048", title: "Dotted Dreams", price: 60.0, description: "Subtle dotted pattern", ageCategory: "4-5", images: ["IMG_5746.JPG"], available: true, createdAt: new Date(Date.now()-48*86400000).toISOString() },
  { id: "DRESS-049", title: "Little Luxe", price: 80.0, description: "Tiny luxe finish", ageCategory: "7-8", images: ["IMG_5747.JPG"], available: true, createdAt: new Date(Date.now()-49*86400000).toISOString() },
  { id: "DRESS-050", title: "Pocket Garden", price: 40.0, description: "Playful pockets and cotton", ageCategory: "4-5", images: ["IMG_5748.JPG"], available: true, createdAt: new Date(Date.now()-50*86400000).toISOString() }
];

/* =========================
   HELPERS
========================= */
function money(value) {
  return `₵${Number(value || 0).toFixed(2)}`;
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

function setStatus(message, type = "info", target = adminStatus) {
  if (!target) return;
  target.textContent = message || "";
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

function normalizeProducts(snapshot) {
  return snapshot.docs.map((docSnap) => ({
    firestoreDocId: docSnap.id,
    ...docSnap.data()
  }));
}

function previewImageFromUrl(url, imgEl, textEl, fallbackText) {
  if (!imgEl || !textEl) return;
  if (!url) {
    imgEl.src = "";
    imgEl.classList.add("hidden");
    textEl.textContent = fallbackText;
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

function closeMobileUserDropdown() {
  mobileUserDropdown?.classList.add("hidden");
}

function closeSidebar() {
  sidebar?.classList.remove("open");
  sidebarOverlay?.classList.add("hidden");
}

function openSidebar() {
  sidebar?.classList.add("open");
  sidebarOverlay?.classList.remove("hidden");
}

function closePurchaseDrawer() {
  purchaseDrawer?.classList.remove("open");
  purchaseDrawerOverlay?.classList.add("hidden");
}

function openPurchaseDrawer() {
  purchaseDrawer?.classList.add("open");
  purchaseDrawerOverlay?.classList.remove("hidden");
}

function closeEditModal() {
  editModal?.classList.remove("open");
  currentEditDocId = null;
  currentEditProduct = null;
  setStatus("", "info", editStatus);
}

function resetAddProductForm() {
  if (productId) productId.value = "";
  if (productTitle) productTitle.value = "";
  if (productPrice) productPrice.value = "";
  if (productAge) productAge.value = "";
  if (productDescription) productDescription.value = "";
  if (productImageFile) productImageFile.value = "";
  if (productImageUrl) productImageUrl.value = "";
  previewImageFromUrl("", imagePreview, imagePreviewText, "Choose an image file or paste an image URL.");
}

function setAuthenticatedUI(user) {
  const isLoggedIn = !!user;
  authShell?.classList.toggle("hidden", isLoggedIn);
  adminApp?.classList.toggle("hidden", !isLoggedIn);

  if (isLoggedIn) {
    const email = user.email || "Admin";
    if (authBadge) authBadge.textContent = email;
    if (mobileAuthBadge) mobileAuthBadge.textContent = email;
  } else {
    if (authBadge) authBadge.textContent = "Admin";
    if (mobileAuthBadge) mobileAuthBadge.textContent = "Admin";
  }
}

function getPageTitle(pageId) {
  const map = {
    dashboardPage: "Dashboard",
    purchasesPage: "Recent Purchases",
    addProductPage: "Add Product",
    inventoryPage: "Inventory",
    overviewPage: "Overview"
  };
  return map[pageId] || "Dashboard";
}

function goToPage(pageId) {
  activePageId = pageId;

  pageSections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== pageId);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.pageLink === pageId);
  });

  if (headerPageTitle) {
    headerPageTitle.textContent = getPageTitle(pageId);
  }

  closeSidebar();
  closeMobileUserDropdown();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getImageSrc(product) {
  const first = Array.isArray(product.images) && product.images.length ? product.images[0] : "";
  return first || "";
}

function getPurchaseItemsWithImages(purchase) {
  const items = Array.isArray(purchase.items) ? purchase.items : [];
  return items.map((item) => {
    const matchingProduct = allProducts.find((product) => product.id === item.id);
    return {
      ...item,
      image: item.image || item.images?.[0] || getImageSrc(matchingProduct || {})
    };
  });
}

/* =========================
   DASHBOARD + STATS
========================= */
function renderInventoryStats(products) {
  const total = products.length;
  const available = products.filter((p) => p.available === true).length;
  const sold = total - available;
  const value = products
    .filter((p) => p.available === true)
    .reduce((sum, p) => sum + Number(p.price || 0), 0);

  if (statTotal) statTotal.textContent = String(total);
  if (statAvailable) statAvailable.textContent = String(available);
  if (statSold) statSold.textContent = String(sold);
  if (statValue) statValue.textContent = money(value);
}

function renderPurchaseStats(purchases) {
  const total = purchases.length;
  const paid = purchases.filter((purchase) => (purchase.status || "paid") === "paid").length;
  const revenue = purchases.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);

  if (purchaseStatTotal) purchaseStatTotal.textContent = String(total);
  if (purchaseStatPaid) purchaseStatPaid.textContent = String(paid);
  if (purchaseStatRevenue) purchaseStatRevenue.textContent = money(revenue);

  if (purchaseStatTotalDuplicate) purchaseStatTotalDuplicate.textContent = String(total);
  if (purchaseStatPaidDuplicate) purchaseStatPaidDuplicate.textContent = String(paid);
  if (purchaseStatRevenueDuplicate) purchaseStatRevenueDuplicate.textContent = money(revenue);
}

/* =========================
   PRODUCTS
========================= */
function applyInventoryFilters(products) {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const availability = filterAvailability?.value || "all";
  const sortValue = sortProducts?.value || "newest";

  let filtered = products.filter((product) => {
    const title = String(product.title || "").toLowerCase();
    const id = String(product.id || "").toLowerCase();
    const age = String(product.ageCategory || "").toLowerCase();
    const desc = String(product.description || "").toLowerCase();

    const matchesQuery =
      !q ||
      title.includes(q) ||
      id.includes(q) ||
      age.includes(q) ||
      desc.includes(q);

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

function renderProductList(products) {
  if (!adminProducts) return;

  if (!products.length) {
    adminProducts.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>No products found</h3>
        <p>Try adjusting your search or availability filter.</p>
      </div>
    `;
    return;
  }

  adminProducts.innerHTML = products.map((product) => {
    const image = getImageSrc(product);
    const available = product.available === true;

    return `
      <article class="product-card">
        <div class="product-card__media">
          ${
            image
              ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(product.title || "Product image")}" onerror="this.style.display='none'">`
              : ""
          }
        </div>

        <div class="product-card__body">
          <div class="product-card__head">
            <div>
              <h3>${escapeHTML(product.title || "Untitled Product")}</h3>
              <div class="product-card__meta">
                <p><strong>ID:</strong> ${escapeHTML(product.id || "-")}</p>
                <p><strong>Age:</strong> ${escapeHTML(product.ageCategory || "-")}</p>
              </div>
            </div>

            <div>
              <span class="pill ${available ? "success" : "danger"}">
                <i class="fa-solid ${available ? "fa-circle-check" : "fa-box-archive"}"></i>
                ${available ? "Available" : "Sold Out"}
              </span>
            </div>
          </div>

          <div class="product-card__meta">
            <p class="product-card__price">${money(product.price)}</p>
            <p>${escapeHTML(product.description || "No description")}</p>
          </div>

          <div class="product-actions">
            <button class="mini-btn ${available ? "danger" : "success"}" data-action="toggle" data-id="${escapeHTML(product.firestoreDocId)}" type="button">
              <i class="fa-solid ${available ? "fa-box-archive" : "fa-circle-check"}"></i>
              <span>${available ? "Mark Sold Out" : "Mark Available"}</span>
            </button>

            <button class="mini-btn" data-action="edit" data-id="${escapeHTML(product.firestoreDocId)}" type="button">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>Edit</span>
            </button>

            <button class="mini-btn danger" data-action="delete" data-id="${escapeHTML(product.firestoreDocId)}" type="button">
              <i class="fa-solid fa-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadAdminProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    allProducts = normalizeProducts(snapshot);
    renderInventoryStats(allProducts);
    renderProductList(applyInventoryFilters(allProducts));
  } catch (error) {
    console.error("Failed to load products:", error);
    if (adminProducts) {
      adminProducts.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Failed to load products</h3>
          <p>Please try again.</p>
        </div>
      `;
    }
  }
}

/* =========================
   PURCHASES
========================= */
function renderPurchaseList(purchases) {
  if (!purchaseList) return;

  if (!purchases.length) {
    purchaseList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-bag-shopping"></i>
        <h3>No purchases yet</h3>
        <p>Purchase records will appear here after successful payments.</p>
      </div>
    `;
    return;
  }

  purchaseList.innerHTML = purchases.map((purchase) => {
    const customer = purchase.customer || {};
    const items = Array.isArray(purchase.items) ? purchase.items : [];
    const paidAt = purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : "No date";

    return `
      <article class="purchase-card" data-purchase-id="${escapeHTML(purchase.firestoreDocId)}">
        <div class="purchase-card-top">
          <div>
            <h4>${escapeHTML(purchase.orderId || "No Order ID")}</h4>
            <p><strong>Name:</strong> ${escapeHTML(customer.fullName || "Unknown customer")}</p>
            <p><strong>Email:</strong> ${escapeHTML(customer.email || "-")}</p>
            <p><strong>Items:</strong> ${items.length}</p>
          </div>

          <div class="purchase-total">
            <strong>${money(purchase.total)}</strong>
            <span class="pill success">
              <i class="fa-solid fa-circle-check"></i>
              ${(purchase.status || "paid").toUpperCase()}
            </span>
            <p><strong>Date:</strong> ${escapeHTML(paidAt)}</p>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderPurchaseDrawer(purchase) {
  if (!purchaseDrawerBody || !purchaseDrawerSub) return;

  const customer = purchase.customer || {};
  const items = getPurchaseItemsWithImages(purchase);

  purchaseDrawerSub.textContent = `${purchase.orderId || "Order"} • ${purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : ""}`;

  purchaseDrawerBody.innerHTML = `
    <section class="purchase-detail-card">
      <h4>Order Information</h4>
      <div class="purchase-lines">
        <p><strong>Order ID:</strong> ${escapeHTML(purchase.orderId || "-")}</p>
        <p><strong>Paystack Ref:</strong> ${escapeHTML(purchase.paystackRef || "-")}</p>
        <p><strong>Status:</strong> ${escapeHTML(purchase.status || "paid")}</p>
        <p><strong>Subtotal:</strong> ${money(purchase.subtotal || 0)}</p>
        <p><strong>Delivery Fee:</strong> ${money(purchase.deliveryFee || 0)}</p>
        <p><strong>Discount:</strong> ${money(purchase.discount || 0)}</p>
        <p><strong>Total:</strong> ${money(purchase.total || 0)}</p>
        <p><strong>Paid At:</strong> ${escapeHTML(purchase.paidAt ? new Date(purchase.paidAt).toLocaleString() : "-")}</p>
      </div>
    </section>

    <section class="purchase-detail-card">
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
    </section>

    <section class="purchase-detail-card">
      <h4>Purchased Items</h4>
      <div class="purchase-lines">
        ${
          items.length
            ? items.map((item) => `
              <div class="purchase-product">
                ${
                  item.image
                    ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title || "Product")}" onerror="this.style.display='none'">`
                    : ""
                }
                <div class="purchase-lines">
                  <p><strong>Title:</strong> ${escapeHTML(item.title || "-")}</p>
                  <p><strong>ID:</strong> ${escapeHTML(item.id || "-")}</p>
                  <p><strong>Price:</strong> ${money(item.price || 0)}</p>
                  <p><strong>Quantity:</strong> ${escapeHTML(item.qty || 1)}</p>
                  <p><strong>Age Category:</strong> ${escapeHTML(item.ageCategory || "-")}</p>
                </div>
              </div>
            `).join("")
            : `<p>No items found for this purchase.</p>`
        }
      </div>
    </section>
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
      purchaseList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Failed to load purchases</h3>
          <p>Please try again.</p>
        </div>
      `;
    }
  }
}

/* =========================
   STORAGE
========================= */
async function uploadImageIfNeeded(file, fallbackUrl = "") {
  if (!file) return fallbackUrl || "";

  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to upload images.");

  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const storageRef = ref(storage, `products/${safeName}`);

  await withTimeout(
    uploadBytes(storageRef, file, {
      contentType: file.type || "image/jpeg"
    }),
    20000,
    "Image upload timed out. Check your Storage setup."
  );

  return withTimeout(
    getDownloadURL(storageRef),
    10000,
    "Could not get image URL after upload."
  );
}

/* =========================
   EDIT
========================= */
function openEditModal(product) {
  currentEditDocId = product.firestoreDocId;
  currentEditProduct = product;

  if (editProductId) editProductId.value = product.id || "";
  if (editProductTitle) editProductTitle.value = product.title || "";
  if (editProductPrice) editProductPrice.value = product.price ?? "";
  if (editProductAge) editProductAge.value = product.ageCategory || "";
  if (editProductDescription) editProductDescription.value = product.description || "";
  if (editProductImageFile) editProductImageFile.value = "";
  if (editProductImageUrl) editProductImageUrl.value = getImageSrc(product) || "";

  previewImageFromUrl(
    getImageSrc(product),
    editImagePreview,
    editImagePreviewText,
    "Choose a replacement image file or URL."
  );

  setStatus("", "info", editStatus);
  editModal?.classList.add("open");
}

/* =========================
   IMPORT
========================= */
async function bulkImportSeedProducts() {
  const user = auth.currentUser;
  if (!user) {
    setStatus("Log in first before importing products.", "error");
    return;
  }

  const ok = window.confirm("Import all missing products from the original 50 into Firestore?");
  if (!ok) return;

  setButtonLoading(bulkImportBtn, true, "Importing...");

  try {
    const snapshot = await getDocs(collection(db, "products"));
    const existingIds = new Set(normalizeProducts(snapshot).map((item) => item.id));

    const missingProducts = SEED_PRODUCTS.filter((item) => !existingIds.has(item.id));

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
async function handleLogin() {
  const email = adminEmail?.value.trim();
  const password = adminPassword?.value.trim();

  if (!email || !password) {
    setStatus("Enter email and password.", "error");
    return;
  }

  setButtonLoading(adminLoginBtn, true, "Logging in...");
  setStatus("Logging in...", "info");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setStatus("Login successful.", "success");
  } catch (error) {
    console.error("Login failed:", error);
    setStatus(error.message || "Login failed.", "error");
  } finally {
    setButtonLoading(adminLoginBtn, false);
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    closeSidebar();
    closeMobileUserDropdown();
    closePurchaseDrawer();
    closeEditModal();
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

/* =========================
   DATA REFRESH
========================= */
async function refreshAllData() {
  await Promise.all([
    loadAdminProducts(),
    loadPurchases()
  ]);
}

/* =========================
   EVENTS
========================= */
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin();
});

adminLoginBtn?.addEventListener("click", handleLogin);
logoutBtn?.addEventListener("click", handleLogout);
mobileLogoutBtn?.addEventListener("click", handleLogout);

menuToggle?.addEventListener("click", () => {
  if (sidebar?.classList.contains("open")) closeSidebar();
  else openSidebar();
});

sidebarOverlay?.addEventListener("click", closeSidebar);

mobileUserMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileUserDropdown?.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".mobile-user-menu")) {
    closeMobileUserDropdown();
  }
});

pageLinks.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.pageLink;
    if (target) goToPage(target);
  });
});

dashboardRefreshBtn?.addEventListener("click", async () => {
  await refreshAllData();
});

refreshPurchasesBtnSecondary?.addEventListener("click", async () => {
  setButtonLoading(refreshPurchasesBtnSecondary, true, "Refreshing...");
  await loadPurchases();
  setButtonLoading(refreshPurchasesBtnSecondary, false);
});

reloadProductsBtn?.addEventListener("click", async () => {
  setButtonLoading(reloadProductsBtn, true, "Reloading...");
  await loadAdminProducts();
  setButtonLoading(reloadProductsBtn, false);
});

clearFormBtn?.addEventListener("click", resetAddProductForm);
bulkImportBtn?.addEventListener("click", bulkImportSeedProducts);

productImageFile?.addEventListener("change", () => {
  const file = productImageFile.files?.[0];
  if (!file) return;
  if (productImageUrl) productImageUrl.value = "";
  previewImageFromFile(file, imagePreview, imagePreviewText);
});

productImageUrl?.addEventListener("input", () => {
  const url = productImageUrl.value.trim();
  if (url && productImageFile) productImageFile.value = "";
  previewImageFromUrl(url, imagePreview, imagePreviewText, "Choose an image file or paste an image URL.");
});

editProductImageFile?.addEventListener("change", () => {
  const file = editProductImageFile.files?.[0];
  if (!file) return;
  if (editProductImageUrl) editProductImageUrl.value = "";
  previewImageFromFile(file, editImagePreview, editImagePreviewText);
});

editProductImageUrl?.addEventListener("input", () => {
  const url = editProductImageUrl.value.trim();
  if (url && editProductImageFile) editProductImageFile.value = "";
  previewImageFromUrl(url, editImagePreview, editImagePreviewText, "Choose a replacement image file or URL.");
});

searchInput?.addEventListener("input", () => {
  renderProductList(applyInventoryFilters(allProducts));
});

filterAvailability?.addEventListener("change", () => {
  renderProductList(applyInventoryFilters(allProducts));
});

sortProducts?.addEventListener("change", () => {
  renderProductList(applyInventoryFilters(allProducts));
});

closeEditModalBtn?.addEventListener("click", closeEditModal);
cancelEditBtn?.addEventListener("click", closeEditModal);

editModal?.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

closePurchaseDrawerBtn?.addEventListener("click", closePurchaseDrawer);
purchaseDrawerOverlay?.addEventListener("click", closePurchaseDrawer);

purchaseList?.addEventListener("click", (e) => {
  const card = e.target.closest("[data-purchase-id]");
  if (!card) return;

  const purchaseId = card.dataset.purchaseId;
  const purchase = allPurchases.find((item) => item.firestoreDocId === purchaseId);
  if (!purchase) return;

  renderPurchaseDrawer(purchase);
  openPurchaseDrawer();
});

addProductBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    setStatus("You must log in first.", "error");
    return;
  }

  const id = productId?.value.trim();
  const title = productTitle?.value.trim();
  const price = Number(productPrice?.value);
  const ageCategory = productAge?.value.trim();
  const description = productDescription?.value.trim();
  const imageFile = productImageFile?.files?.[0];
  const imageUrlInput = productImageUrl?.value.trim();

  if (!id || !title || Number.isNaN(price) || price < 0 || !ageCategory) {
    setStatus("Fill in Product ID, Title, Price, and Age Category.", "error");
    return;
  }

  const duplicate = allProducts.some((item) => String(item.id).toLowerCase() === id.toLowerCase());
  if (duplicate) {
    setStatus("A product with that Product ID already exists.", "error");
    return;
  }

  setButtonLoading(addProductBtn, true, "Adding...");

  try {
    let finalImage = "";

    if (imageFile) {
      finalImage = await uploadImageIfNeeded(imageFile, "");
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
      12000,
      "Adding product timed out."
    );

    resetAddProductForm();
    await loadAdminProducts();
    setStatus("Product added successfully.", "success");
    goToPage("inventoryPage");
  } catch (error) {
    console.error("Failed to add product:", error);
    setStatus(error.message || "Failed to add product.", "error");
  } finally {
    setButtonLoading(addProductBtn, false);
  }
});

adminProducts?.addEventListener("click", async (e) => {
  const actionBtn = e.target.closest("[data-action][data-id]");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;
  const docId = actionBtn.dataset.id;
  const product = allProducts.find((item) => item.firestoreDocId === docId);
  if (!product) return;

  if (action === "toggle") {
    actionBtn.disabled = true;
    try {
      await updateDoc(doc(db, "products", docId), {
        available: !product.available
      });
      await loadAdminProducts();
    } catch (error) {
      console.error("Failed to update availability:", error);
    } finally {
      actionBtn.disabled = false;
    }
  }

  if (action === "edit") {
    openEditModal(product);
  }

  if (action === "delete") {
    const ok = window.confirm(`Delete ${product.title}? This cannot be undone.`);
    if (!ok) return;

    actionBtn.disabled = true;
    try {
      await deleteDoc(doc(db, "products", docId));
      await loadAdminProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      actionBtn.disabled = false;
    }
  }
});

saveEditBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    setStatus("You must log in first.", "error", editStatus);
    return;
  }

  if (!currentEditDocId || !currentEditProduct) {
    setStatus("No product selected.", "error", editStatus);
    return;
  }

  const id = editProductId?.value.trim();
  const title = editProductTitle?.value.trim();
  const price = Number(editProductPrice?.value);
  const ageCategory = editProductAge?.value.trim();
  const description = editProductDescription?.value.trim();
  const imageFile = editProductImageFile?.files?.[0];
  const imageUrlInput = editProductImageUrl?.value.trim();

  if (!id || !title || Number.isNaN(price) || price < 0 || !ageCategory) {
    setStatus("Fill in Product ID, Title, Price, and Age Category.", "error", editStatus);
    return;
  }

  const duplicate = allProducts.some((item) =>
    item.firestoreDocId !== currentEditDocId &&
    String(item.id).toLowerCase() === id.toLowerCase()
  );

  if (duplicate) {
    setStatus("Another product already uses that Product ID.", "error", editStatus);
    return;
  }

  setButtonLoading(saveEditBtn, true, "Saving...");
  setStatus("Saving changes...", "info", editStatus);

  try {
    let finalImage = getImageSrc(currentEditProduct);

    if (imageFile) {
      finalImage = await uploadImageIfNeeded(imageFile, finalImage);
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
    closeEditModal();
  } catch (error) {
    console.error("Failed to save changes:", error);
    setStatus(error.message || "Failed to save changes.", "error", editStatus);
  } finally {
    setButtonLoading(saveEditBtn, false);
  }
});

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async (user) => {
  setAuthenticatedUI(user);

  if (user) {
    setStatus(`Logged in as ${user.email}`, "success");
    goToPage(activePageId || "dashboardPage");
    await refreshAllData();
  } else {
    allProducts = [];
    allPurchases = [];
    renderInventoryStats([]);
    renderPurchaseStats([]);
    renderProductList([]);
    renderPurchaseList([]);
    closePurchaseDrawer();
    closeEditModal();
    closeSidebar();
    closeMobileUserDropdown();
    goToPage("dashboardPage");
    setStatus("Not logged in.", "info");
  }
});

/* =========================
   INITIAL
========================= */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEditModal();
    closePurchaseDrawer();
    closeSidebar();
    closeMobileUserDropdown();
  }
});

window.adminSignOut = async function adminSignOut() {
  await handleLogout();
};
