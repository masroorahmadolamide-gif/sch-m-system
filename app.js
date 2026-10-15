
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==============================
// FIREBASE CONFIGURATION
// ==============================

const firebaseConfig = {
    apiKey: "AIzaSyC5AIhj-oze4EDIdgEc0QgMqgn-2GmRPu8",
    authDomain: "sch-m-system.firebaseapp.com",
    projectId: "sch-m-system",
    storageBucket: "sch-m-system.firebasestorage.app",
    messagingSenderId: "24559011089",
    appId: "1:24559011089:web:8009d445b45223b53e38b0",
    measurementId: "G-4J1V0208LJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("APP.JS LOADED SUCCESSFULLY");


// ==============================
// HTML ELEMENTS
// ==============================

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

const registerSection = document.getElementById("register-section");
const loginSection = document.getElementById("login-section");

const showLoginButton = document.getElementById("show-login");
const showRegisterButton = document.getElementById("show-register");


// ==============================
// FRIENDLY ERROR MESSAGES
// ==============================

function getAuthErrorMessage(error, action) {
    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered. Please log in instead.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password must be at least 6 characters long.";

        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password. Please try again.";

        case "auth/too-many-requests":
            return "Too many attempts. Please wait and try again.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        case "auth/operation-not-allowed":
            return "Email and password sign-in is not enabled in Firebase.";

        default:
            return action === "register"
                ? "Unable to create your account. Please try again."
                : "Unable to log in. Please try again.";
    }
}




function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}



if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        const message = document.getElementById("message");
        const registerButton = document.getElementById("register-btn");

        // Validate name

        if (!name) {
            message.textContent = "Please enter your full name.";
            return;
        }

        // Validate email

        if (!isValidEmail(email)) {
            message.textContent = "Please enter a valid email address.";
            return;
        }

        // Validate password

        if (password.length < 6) {
            message.textContent =
                "Password must be at least 6 characters long.";
            return;
        }

        // Validate role

        if (!["student", "instructor"].includes(role)) {
            message.textContent = "Please select a valid account type.";
            return;
        }

        let accountCreated = false;

        try {
            message.textContent = "Creating your account...";

            if (registerButton) {
                registerButton.disabled = true;
            }

            // Create Firebase Authentication account

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;
            accountCreated = true;

            console.log("USER CREATED:", user.uid);

            // Save user profile to Firestore

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: role,
                uid: user.uid,
                createdAt: serverTimestamp()
            });

            console.log("PROFILE SAVED TO FIRESTORE");

            message.textContent = "Account created successfully!";

            registerForm.reset();

            // Redirect according to account type

            if (role === "instructor") {
                window.location.href = "instructor-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } catch (error) {
            console.error("Registration Error:", error);

            if (accountCreated) {
                message.textContent =
                    "Your account was created, but saving your profile failed. Check your Firestore rules or contact support.";
            } else {
                message.textContent =
                    getAuthErrorMessage(error, "register");
            }

        } finally {
            if (registerButton) {
                registerButton.disabled = false;
            }
        }
    });
}


// ==============================
// LOGIN
// ==============================

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email =
            document.getElementById("login-email").value.trim();

        const password =
            document.getElementById("login-password").value;

        const message =
            document.getElementById("login-message");

        const loginButton =
            document.getElementById("login-btn");

        // Validate email

        if (!isValidEmail(email)) {
            message.textContent = "Please enter a valid email address.";
            return;
        }

        if (!password) {
            message.textContent = "Please enter your password.";
            return;
        }

        try {
            message.textContent = "Logging in...";

            if (loginButton) {
                loginButton.disabled = true;
            }

            // Authenticate user

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            console.log("USER LOGGED IN:", user.uid);

            // Read saved user profile

            const userDoc = await getDoc(
                doc(db, "users", user.uid)
            );

            let role = "student";

            if (userDoc.exists()) {
                role = userDoc.data().role || "student";
            }

            message.textContent = "Login successful!";

            loginForm.reset();

            // Redirect according to saved role

            if (role === "instructor") {
                window.location.href = "instructor-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } catch (error) {
            console.error("Login Error:", error);

            if (
                error.code &&
                error.code.startsWith("auth/")
            ) {
                message.textContent =
                    getAuthErrorMessage(error, "login");
            } else {
                message.textContent =
                    "Login succeeded or failed during profile loading. Check your Firestore connection and rules.";
            }

        } finally {
            if (loginButton) {
                loginButton.disabled = false;
            }
        }
    });
}


// ==============================
// SWITCH TO LOGIN
// ==============================

if (showLoginButton && registerSection && loginSection) {
    showLoginButton.addEventListener("click", () => {
        registerSection.hidden = true;
        loginSection.hidden = false;
    });
}


// ==============================
// SWITCH TO REGISTER
// ==============================

if (showRegisterButton && registerSection && loginSection) {
    showRegisterButton.addEventListener("click", () => {
        loginSection.hidden = true;
        registerSection.hidden = false;
    });
}
