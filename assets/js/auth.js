// js/auth.js

// ---- CONFIG FIREBASE (usiamo la tua) ----
const firebaseConfig = {
  apiKey: "AIzaSyDWisOm9z0LrSV0BczsKD5qYuVfswwT7jw",
  authDomain: "progetto-cooperativa-passioni.firebaseapp.com",
  databaseURL: "https://progetto-cooperativa-passioni-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "progetto-cooperativa-passioni",
  storageBucket: "progetto-cooperativa-passioni.firebasestorage.app",
  messagingSenderId: "578783174328",
  appId: "1:578783174328:web:9770c86aa93d7fa3055e4d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// CAMBIA QUESTO con il vero codice aziendale
const COMPANY_CODE = "ABC123";

// Capire se siamo su login.html o sulle altre pagine
const path = window.location.pathname.toLowerCase();
const isLoginPage = path.includes("login.html");

// Redirect automatici in base allo stato login
auth.onAuthStateChanged(user => {
  if (user && isLoginPage) {
    // se sei già loggato e apri login → vai in dashboard
    window.location.href = "index.html";
  }
  if (!user && !isLoginPage) {
    // se non sei loggato e provi ad aprire index o altre pagine → manda al login
    window.location.href = "login.html";
  }
});

// ---- FUNZIONI UTILITÀ ----
function setError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!msg) {
    el.textContent = "";
    el.classList.remove("visible");
  } else {
    el.textContent = msg;
    el.classList.add("visible");
  }
}

// ---- LOGIN ----
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", e => {
    e.preventDefault();
    setError("login-error", "");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      setError("login-error", "Compila email e password.");
      return;
    }

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error(err);
        setError("login-error", err.message);
      });
  });
}

// ---- REGISTRAZIONE ----
const formSignup = document.getElementById("form-signup");

if (formSignup) {
  formSignup.addEventListener("submit", async e => {
    e.preventDefault();
    setError("signup-error", "");

    const name  = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const pass1 = document.getElementById("signup-password").value;
    const pass2 = document.getElementById("signup-password2").value;
    const code  = document.getElementById("signup-code").value.trim();

    if (!name || !email || !pass1 || !pass2 || !code) {
      setError("signup-error", "Compila tutti i campi.");
      return;
    }

    if (pass1 !== pass2) {
      setError("signup-error", "Le password non coincidono.");
      return;
    }

    if (code !== COMPANY_CODE) {
      setError("signup-error", "Codice aziendale non valido.");
      return;
    }

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass1);
      const user = cred.user;

      await db.collection("profiles").doc(user.uid).set({
        name,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      window.location.href = "index.html";
    } catch (err) {
      console.error(err);
      setError("signup-error", err.message);
    }
  });
}

// ---- Logout (puoi usarlo nei menu delle altre pagine) ----
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
// puoi collegare <a onclick="logout()">Logout</a> nelle altre pagine
