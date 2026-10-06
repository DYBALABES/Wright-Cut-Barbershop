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
  doc 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Firebase Configuration
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

// ============================================================
// THE 2 PERMANENT OWNER / ADMIN EMAILS
// (Add any newly hired barber email here, or change role in Firestore)
// ============================================================
export const PRIMARY_ADMIN_EMAILS = [
  "kagisogeorge09@gmail.com", // Admin 1: Kagiso
  "admin@wrightcut.com"       // Admin 2: Boikhutso / Shop Admin
];

export function checkIsAdmin(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return PRIMARY_ADMIN_EMAILS.includes(cleanEmail);
}

// Compute Initials (e.g., KM, AD)
function computeInitials(fullName, email) {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (email) {
    const prefix = email.split("@")[0].replace(/[^a-zA-Z]/g, "");
    if (prefix.length >= 2) return prefix.substring(0, 2).toUpperCase();
    return (prefix[0] || "W").toUpperCase() + "C";
  }
  return "WC";
}

// Render the Initials Badge
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

// Instant Navigation Cache (Zero-delay render)
function applyInstantCachedNav() {
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
  } catch (e) {
    console.warn("Cache parse error:", e);
  }
}

applyInstantCachedNav();

window.toggleMobileNav = function() {
  const links = document.getElementById("navLinks");
  if (links) links.classList.toggle("open");
};

// ============================================================
// AUTH STATE & CLOUD DATABASE ROLE VERIFICATION
// ============================================================
onAuthStateChanged(auth, async (user) => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const protectedPages = ["booking.html", "admin-dashboard.html"];

  if (!user && protectedPages.includes(currentPage)) {
    localStorage.removeItem("wc_cached_user");
    window.location.href = "login.html";
    return;
  }

  const loginLink = document.querySelector('a[href="login.html"]');
  const logoutBtn = document.querySelector('button[onclick*="Logout"], button[onclick*="logout"]');
  const adminLink = document.getElementById("adminNavLink");

  if (user) {
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    // 1. Initial check against the 2 permanent owner emails
    let isUserAdmin = checkIsAdmin(user.email);
    let displayName = user.displayName || "";

    // 2. Read cloud Firestore profile to check for manually promoted Admins
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.name) displayName = userData.name;
        // If an employee was promoted to admin in Firestore, grant admin privileges
        if (userData.role === "admin") {
          isUserAdmin = true;
        }
      }
    } catch (e) {
      console.log("Profile read:", e);
    }

    // Protect Admin Dashboard: Only allow if isUserAdmin is true
    if (currentPage === "admin-dashboard.html" && !isUserAdmin) {
      alert("Access Denied: Only authorized shop administrators can access the schedule.");
      window.location.href = "index.html";
      return;
    }

    if (adminLink) {
      adminLink.style.display = isUserAdmin ? "inline-block" : "none";
    }

    const fastInitials = computeInitials(displayName, user.email);
    renderAvatarBadge(fastInitials, `Logged in as: ${displayName || user.email} (${isUserAdmin ? "Admin" : "Customer"})`);

    // Cache user state for instant page loads
    localStorage.setItem("wc_cached_user", JSON.stringify({
      email: user.email,
      name: displayName,
      initials: fastInitials,
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

// Logout
window.handleLogout = async function() {
  try {
    localStorage.removeItem("wc_cached_user");
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Sign-out error:", err);
  }
};

// Google SSO
window.handleGoogleSSO = async function() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user is in the 2 admin emails list OR in Firestore as admin
    let isAdmin = checkIsAdmin(user.email);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        isAdmin = true;
      }
    } catch(e) {}

    if (isAdmin) {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (error) {
    alert("Google Sign-In Error: " + error.message);
  }
};