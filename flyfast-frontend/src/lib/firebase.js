import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
// Idealmente, estas chaves devem estar num ficheiro .env na raiz do projeto frontend
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Adicione estes logs para verificar os valores
console.log("Firebase Config carregada:");
console.log("REACT_APP_FIREBASE_API_KEY:", firebaseConfig.apiKey ? "Configurada" : "NÃO CONFIGURADA");
console.log("REACT_APP_FIREBASE_AUTH_DOMAIN:", firebaseConfig.authDomain ? "Configurada" : "NÃO CONFIGURADA");
console.log("REACT_APP_FIREBASE_PROJECT_ID:", firebaseConfig.projectId ? "Configurada" : "NÃO CONFIGURADA");
// Você pode logar todas as chaves se quiser

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);