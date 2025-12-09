// js/auth.js

// ---- CONFIG FIREBASE ----
const firebaseConfig = {
  apiKey: "AIzaSyDWisOm9z0LrSV0BczsKD5qYuVfswwT7jw",
  authDomain: "progetto-cooperativa-passioni.firebaseapp.com",
  databaseURL: "https://progetto-cooperativa-passioni-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "progetto-cooperativa-passioni",
  storageBucket: "progetto-cooperativa-passioni.firebasestorage.app",
  messagingSenderId: "578783174328",
  appId: "1:578783174328:web:9770c86aa93d7fa3055e4d"
};

// evita errori se lo includi su più pagine
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// CODICE AZIENDALE – CAMBIALO TU
const COMPANY_CODE = "ABC123";

// Capire se siamo su login.html
const href = window.location.href.toLowerCase();
const isLoginPage = href.includes("login.html");

// Redirect automatico in base allo stato di login
auth.onAuthStateChanged(user => {
  if (user && isLoginPage) {
    // Utente già loggato → mandalo in dashboard
    window.location.href = "index.html";
  }
  if (!user && !isLoginPage) {
    // Non loggato ma su pagina privata → torna al login
    window.location.href = "login.html";
  }
});

// Utility per mostrare errori
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

// --------- LOGIN ---------
const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    setError("login-error", "");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    // CONTROLLI BASE
    if (!email || !password) {
      setError("login-error", "Inserisci email e password.");
      return;
    }

    if (!email.includes("@")) {
      setError("login-error", "Inserisci un'email valida.");
      return;
    }

    // LOGIN Firebase
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((err) => {
        console.error(err);
        let msg = err.message;
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          msg = "Credenziali non valide.";
        }
        setError("login-error", msg);
      });
  });
}

// --------- REGISTRAZIONE ---------
const formSignup = document.getElementById("form-signup");

if (formSignup) {
  formSignup.addEventListener("submit", async (e) => {
    e.preventDefault();
    setError("signup-error", "");

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const pass1 = document.getElementById("signup-password").value;
    const pass2 = document.getElementById("signup-password2").value;
    const code = document.getElementById("signup-code").value.trim();

    // CONTROLLI CLIENT
    if (!name || !email || !pass1 || !pass2 || !code) {
      setError("signup-error", "Compila tutti i campi.");
      return;
    }

    if (!email.includes("@")) {
      setError("signup-error", "Inserisci un'email valida.");
      return;
    }

    if (pass1.length < 6) {
      setError("signup-error", "La password deve avere almeno 6 caratteri.");
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

    // REGISTRAZIONE Firebase
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
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") {
        msg = "Questa email è già registrata.";
      }
      setError("signup-error", msg);
    }
  });
}

// --------- LOGOUT (da usare nelle altre pagine) ---------
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
// nelle altre pagine puoi fare: <a href="#" onclick="logout()">Logout</a>
