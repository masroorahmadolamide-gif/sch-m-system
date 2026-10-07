import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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


const registerForm =
    document.getElementById("register-form");

const loginForm =
    document.getElementById("login-form");

const registerSection =
    document.getElementById("register-section");

const loginSection =
    document.getElementById("login-section");


registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const role =
        document.getElementById("role").value;

    const message =
        document.getElementById("message");


    try {

        message.textContent =
            "Creating account...";


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "USER CREATED:",
            userCredential.user
        );


        await setDoc(
            doc(
                db,
                "users",
                userCredential.user.uid
            ),
            {
                name: name,
                email: email,
                role: role,
                createdAt: serverTimestamp()
            }
        );


        console.log(
            "PROFILE SAVED TO FIRESTORE"
        );


        message.textContent =
            "Account created successfully!";


        registerForm.reset();
        if (role === "instructor") {
            window.location.href =
                "instructor-dashboard.html";
        } else {
            window.location.href =
                "dashboard.html";
        }


    } catch (error) {

        console.error(
            "Firebase Register Error:",
            error
        );


        message.textContent =
            `${error.code}: ${error.message}`;

    }

});


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();


    const email =
        document
            .getElementById("login-email")
            .value
            .trim();


    const password =
        document
            .getElementById("login-password")
            .value;


    const message =
        document.getElementById("login-message");


    try {

        message.textContent =
            "Logging in...";


        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "USER LOGGED IN:",
            userCredential.user
        );


        message.textContent =
            "Login successful!";


        loginForm.reset();


        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Firebase Login Error:",
            error
        );


        message.textContent =
            `${error.code}: ${error.message}`;

    }

});


document
    .getElementById("show-login")
    .addEventListener("click", () => {

        registerSection.hidden = true;

        loginSection.hidden = false;

    });


document
    .getElementById("show-register")
    .addEventListener("click", () => {

        loginSection.hidden = true;

        registerSection.hidden = false;

    });