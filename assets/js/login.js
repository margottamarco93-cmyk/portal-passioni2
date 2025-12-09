// ---- UI SWITCH LOGIN / SIGNUP ----
const loginText = document.querySelector(".title-text .login");
const formInner = document.querySelector(".form-inner");
const loginLabel = document.querySelector("label.login");
const signupLabel = document.querySelector("label.signup");
const signupLink = document.querySelector("form.login .signup-link a");

signupLabel.onclick = () => {
  formInner.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};

loginLabel.onclick = () => {
  formInner.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};

if (signupLink) {
  signupLink.onclick = (e) => {
    e.preventDefault();
    signupLabel.click();
  };
}

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db   = firebase.firestore();

// CODICE AZIENDALE
const COMPANY_CODE = "ABC123"; // CAMBIA QUESTO

// Sei su login.html?
const href = window.location.href.toLowerCase();
const isLoginPage = href.includes("login.html");

// Redirect base (se lo useremo sulle altre pagine)
auth.onAuthStateChanged(user => {
  if (user && isLoginPage) {
    // già loggato → vai a index
    // commenta se per ora vuoi solo testare i controlli
    // window.location.href = "index.html";
  }
});

// Utility per errori
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
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setError("login-error", "");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      setError("login-error", "Inserisci email e password.");
      return;
    }

    if (!email.includes("@")) {
      setError("login-error", "Inserisci un'email valida.");
      return;
    }

    // DEBUG: togli commento per vedere che entra qui
    // alert("Login: controlli lato client OK");

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(err => {
        console.error(err);
        let msg = err.message;
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          msg = "Credenziali non valide.";
        }
        setError("login-error", msg);
      });
  });
}

// ---- SIGNUP ----
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
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

    // DEBUG: togli commento per vedere che entra
    // alert("Signup: controlli lato client OK");

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

// ---- LOGOUT PER ALTRE PAGINE ----
function logout() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}
