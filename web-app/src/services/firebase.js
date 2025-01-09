import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWV5n0pMQrXsu-ystHTIf_kDcD15mjuCc",
  authDomain: "formulario-app-5e4dd.firebaseapp.com",
  projectId: "formulario-app-5e4dd",
  storageBucket: "formulario-app-5e4dd.appspot.com",
  messagingSenderId: "374078948069",
  appId: "1:374078948069:web:2f35772f950569f9544a0c",
  measurementId: "G-P7LW90GB2J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configurar persistencia de autenticación
auth.useDeviceLanguage();

export { auth, db };
