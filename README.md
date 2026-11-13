# 💈 Wright Cut Barbershop — Digital Grooming System (WIL 3A)

[![Android CI Build & Automated Tests](https://github.com/DYBALABES/Wright-Cut-Barbershop/actions/workflows/android-build.yml/badge.svg)](https://github.com/DYBALABES/Wright-Cut-Barbershop/actions/workflows/android-build.yml)
[![Live Web Application](https://img.shields.io/badge/Live%20App-Firebase%20Hosting-orange)](https://wright-cut-db.web.app)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20PWA-blue)](https://github.com/DYBALABES/Wright-Cut-Barbershop)
[![Region](https://img.shields.io/badge/Cloud%20Region-africa--south1%20(JHB)-green)](https://console.firebase.google.com/)

A modern, cross-platform appointment scheduling, hairstyle showcase, and administrative management solution developed for **Wright Cut Barbershop**, located in Ga-Rankuwa View, Zone 15, Gauteng.

---

## 📹 Video Demonstration & Live Links
- **YouTube Demonstration (Unlisted):** [Click to Watch Video Demo](https://youtu.be/YOUR_UNLISTED_LINK_HERE)
- **Production Web Application (PWA):** [https://wright-cut-db.web.app](https://wright-cut-db.web.app)
- **GitHub Source Code Repository:** [https://github.com/DYBALABES/Wright-Cut-Barbershop](https://github.com/DYBALABES/Wright-Cut-Barbershop)

---

## 👥 Project Team & Stakeholders
- **Client / Primary Stakeholder:** Wright Cut Barbershop (Founded by Boikhutso Maswanganyi & Kagiso Maluleka)
- **Physical Address:** 932 Monato Street, Ga-Rankuwa View, Zone 15, 0208, Gauteng
- **Institution:** Faculty of Information and Communications Technology
- **Module:** XISD5319 / DISD0601 — Work Integrated Learning 3A (Term 1)
- **Project Lead / Administrator:** Kagiso Maluleka (`kagisogeorge09@gmail.com`)

---

## 🎯 Purpose of the Application
Historically, community barbershops in township areas rely on manual walk-ins and physical waitlists, resulting in unpredictable queue times, double-booking conflicts, and revenue loss during unexpected emergencies. 

The **Wright Cut Mobile & Web System** solves this by delivering:
1. **Zero-Conflict Cloud Booking:** Clients select guaranteed, real-time time slots with instant atomic lockout of booked intervals.
2. **Dedicated Settings & Persistent Customisation:** Users configure persistent profile data, notification preferences (SMS/Email toggles), preferred barbers, and interface density that survive device restarts.
3. **Emergency Management:** Administrators can immediately reschedule or cancel appointments with automated client notifications via email and SMS.
4. **Offline Resilience & Fast Access:** Session guards and cached navigation credentials ensure immediate app launch into authenticated portals without UI flicker.

---

## 🎨 System Design Considerations & Architecture
- **Front-End Design Language:** A bespoke, responsive Dark/Gold aesthetic (`--primary: #d4af37`, `--bg-dark: #121212`) engineered with pure CSS3 tokens, CSS Grid, and Flexbox for zero-dependency performance on low-end mobile devices.
- **Mobile Container (Capacitor Native Runtime):** Wraps responsive web assets into a native Android project compiled with Gradle, Java 21, and modern Android SDKs.
- **Backend & Cloud Database:** Google Firebase Cloud Firestore hosted in the `africa-south1` (Johannesburg) region to guarantee low latency and compliance with South Africa's Protection of Personal Information Act (POPIA).
- **Security & RBAC:** Password encryption at rest via Firebase Authentication and Google Single Sign-On (SSO), combined with role-based routing (`admin` vs `customer`).
- **Atomic Concurrency Engine:** Utilises Firestore `runTransaction` to prevent race conditions during simultaneous slot bookings.

---

## 🔄 Utilisation of GitHub & DevOps CI/CD Lifecycle
Version control and continuous integration were adhered to across all milestones:
- **Git Commit Workflow:** Incremental, descriptive commits documenting UI refinement, database restructuring, and bug fixes.
- **Automated CI/CD Pipeline (`android-build.yml`):**
  - Triggers on every `push` and `pull_request` to the `main` branch.
  - Spins up an Ubuntu runner configured with Node.js 22 and JDK 21.
  - Executes the automated unit testing suite (`test-suite.js`) validating phone regex, email sanitation, and slot allocation logic.
  - Synchronises Capacitor assets and compiles the native Android debug APK (`./gradlew assembleDebug`).
  - Stores the compiled APK as a downloadable GitHub Actions artifact.

---

## 📋 Comprehensive Release Notes

### Version 1.0 (Task 1 Prototype)
- Initial client-side static prototype utilizing browser `localStorage`.
- Basic navigation and non-responsive appointment scheduling table.
- Standard image gallery without enlargement or modal navigation.

### Version 2.0 (Task 2 & 3 Production Release — Major Innovations)
- **Persistent Settings Menu:** Built `settings.html` allowing clients to manage profile information, preferred barbers, UI display density, and notification channels across application restarts.
- **Atomic Slot Locking:** Implemented Firestore transaction locks to eliminate race conditions and double-bookings.
- **Responsive Mobile Dashboard:** Transformed the administrative view into adaptive touch-friendly cards on narrow screens, removing horizontal scroll constraints.
- **Interactive Lightbox Modal:** Full-screen gallery viewer with boundary-aware Next and Previous image controls.
- **Dual-Channel Notification Engine:** Simultaneous automated confirmation delivery via EmailJS (`template_h03ryyc`) and cellular SMS protocol.
- **Client Rescheduling Portal:** Added interactive "My Appointments" interface enabling clients to reschedule bookings through a live calendar.
- **Automated CI/CD Test Suite:** Configured GitHub Actions workflow executing unit tests and assembling release-ready Android binaries.

---

## 🚀 Local Installation & Developer Setup
1. Clone repository:
   ```bash
   git clone https://github.com/DYBALABES/Wright-Cut-Barbershop.git
   cd Wright-Cut-Barbershop