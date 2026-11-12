import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCG94vYKYSHrHqJpui1kKeipAiKlyvKH8A",
  authDomain: "wright-cut-db.firebaseapp.com",
  projectId: "wright-cut-db",
  storageBucket: "wright-cut-db.firebasestorage.app",
  messagingSenderId: "210876408255",
  appId: "1:210876408255:web:52bce253aebf4ed38e010a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

const savedPref = localStorage.getItem("wc_user_settings");
if (savedPref) {
  try {
    const p = JSON.parse(savedPref);
    if (p.density === "compact") document.body.classList.add("density-compact");
  } catch (e) {}
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
const isAuthPage = currentPage === "login.html" || currentPage === "register.html";
const hasActiveSession = sessionStorage.getItem("wc_session_active");

if (!hasActiveSession && !isAuthPage) {
  localStorage.removeItem("wc_cached_user");
  window.location.replace("login.html");
}

export const PRIMARY_ADMIN_EMAILS = [
  "kagisogeorge09@gmail.com",
  "admin@wrightcut.com"
];

export function checkIsAdmin(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return (
    PRIMARY_ADMIN_EMAILS.includes(cleanEmail) ||
    cleanEmail.includes("kagiso") ||
    cleanEmail.includes("boikhutso")
  );
}

function computeInitials(fullName, email) {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email) {
    const prefix = email.split("@")[0].replace(/[^a-zA-Z]/g, "");
    if (prefix.length >= 2) return prefix.substring(0, 2).toUpperCase();
    return (prefix[0] || "W").toUpperCase() + "C";
  }
  return "WC";
}

function renderAvatarBadge(initials, tooltipText) {
  const navLinksContainer = document.getElementById("navLinks");
  if (!navLinksContainer) return;

  const logoutBtn = document.querySelector('button[onclick*="Logout"], button[onclick*="logout"]');
  let avatarBadge = document.getElementById("navUserAvatar");

  if (!avatarBadge) {
    avatarBadge = document.createElement("div");
    avatarBadge.id = "navUserAvatar";
    avatarBadge.className = "user-avatar-badge";

    if (logoutBtn) {
      navLinksContainer.insertBefore(avatarBadge, logoutBtn);
    } else {
      navLinksContainer.appendChild(avatarBadge);
    }
  }

  avatarBadge.innerText = initials;
  avatarBadge.title = tooltipText || "Logged in profile";
  avatarBadge.style.display = "inline-flex";
}

function applyInstantCachedNav() {
  if (!sessionStorage.getItem("wc_session_active")) return;
  const cachedUserStr = localStorage.getItem("wc_cached_user");
  if (!cachedUserStr) return;

  try {
    const cachedUser = JSON.parse(cachedUserStr);
    const loginLink = document.querySelector('a[href="login.html"]');
    const logoutBtn = document.querySelector('button[onclick*="Logout"], button[onclick*="logout"]');
    const adminLink = document.getElementById("adminNavLink");

    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (adminLink && cachedUser.isAdmin) adminLink.style.display = "inline-block";

    renderAvatarBadge(cachedUser.initials, `Logged in as: ${cachedUser.name || cachedUser.email}`);
  } catch (e) {}
}

applyInstantCachedNav();

window.toggleMobileNav = function() {
  const links = document.getElementById("navLinks");
  if (links) links.classList.toggle("open");
};

onAuthStateChanged(auth, async (user) => {
  const isSessionValid = sessionStorage.getItem("wc_session_active");

  if ((!user || !isSessionValid) && !isAuthPage) {
    localStorage.removeItem("wc_cached_user");
    window.location.replace("login.html");
    return;
  }

  const loginLink = document.querySelector('a[href="login.html"]');
  const logoutBtn = document.querySelector('button[onclick*="Logout"], button[onclick*="logout"]');
  const adminLink = document.getElementById("adminNavLink");

  if (user && isSessionValid) {
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    let isUserAdmin = checkIsAdmin(user.email);
    let displayName = user.displayName || "";

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.name) displayName = data.name;
        if (data.role === "admin") isUserAdmin = true;
      }
    } catch (e) {}

    if (currentPage === "admin-dashboard.html" && !isUserAdmin) {
      alert("Access Denied: Only shop administrators can access the schedule.");
      window.location.replace("index.html");
      return;
    }

    if (adminLink) {
      adminLink.style.display = isUserAdmin ? "inline-block" : "none";
    }

    const initials = computeInitials(displayName, user.email);
    renderAvatarBadge(initials, `Logged in as: ${displayName || user.email} (${isUserAdmin ? "Admin" : "Customer"})`);

    localStorage.setItem("wc_cached_user", JSON.stringify({
      email: user.email,
      name: displayName,
      initials: initials,
      isAdmin: isUserAdmin
    }));
  } else {
    localStorage.removeItem("wc_cached_user");
    if (loginLink) loginLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (adminLink) adminLink.style.display = "none";

    const avatarBadge = document.getElementById("navUserAvatar");
    if (avatarBadge) avatarBadge.style.display = "none";
  }

  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay && user) {
    userDisplay.innerText = user.email;
  }
});

window.handleLogout = async function() {
  try {
    sessionStorage.removeItem("wc_session_active");
    localStorage.removeItem("wc_cached_user");
    await signOut(auth);
    window.location.replace("login.html");
  } catch (err) {}
};

window.handleGoogleSSO = async function() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    let isUserAdmin = checkIsAdmin(user.email);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        isUserAdmin = true;
      }
    } catch (e) {}

    sessionStorage.setItem("wc_session_active", "true");
    localStorage.setItem("wc_cached_user", JSON.stringify({
      email: user.email,
      name: user.displayName || "",
      initials: computeInitials(user.displayName || "", user.email),
      isAdmin: isUserAdmin
    }));

    if (isUserAdmin) {
      window.location.replace("admin-dashboard.html");
    } else {
      window.location.replace("index.html");
    }
  } catch (error) {
    showToast("Google Sign-In Error: " + error.message, "danger");
  }
};