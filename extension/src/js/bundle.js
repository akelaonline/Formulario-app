// Función para cargar script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        console.log('Loading script:', src);
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(src);
        script.onload = () => {
            console.log('Script loaded successfully:', src);
            resolve();
        };
        script.onerror = (error) => {
            console.error('Error loading script:', src, error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Cargar scripts en orden
async function initializeApp() {
    try {
        console.log('Starting script loading sequence');

        // 1. Firebase App
        await loadScript('src/lib/firebase-app-compat.js');
        console.log('Firebase App script loaded, checking if firebase is available:', !!window.firebase);

        // 2. Firebase Auth
        await loadScript('src/lib/firebase-auth-compat.js');
        console.log('Firebase Auth script loaded, checking if auth is available:', !!window.firebase?.auth);

        // 3. Firebase Firestore
        await loadScript('src/lib/firebase-firestore-compat.js');
        console.log('Firebase Firestore script loaded, checking if firestore is available:', !!window.firebase?.firestore);

        // Esperar a que firebase esté disponible
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkFirebase = () => {
                attempts++;
                console.log(`Checking for Firebase (attempt ${attempts}/${maxAttempts})`);
                
                if (window.firebase) {
                    console.log('Firebase is available');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Firebase not available after maximum attempts'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });

        console.log('Initializing Firebase');

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAZQFRxGGzxuNZPkAOyNEpXQXqDPFNH2Uc",
            authDomain: "formulario-app-5e4dd.firebaseapp.com",
            projectId: "formulario-app-5e4dd",
            storageBucket: "formulario-app-5e4dd.appspot.com",
            messagingSenderId: "374078948069",
            appId: "1:374078948069:web:9b9b9b9b9b9b9b9b9b9b9b"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized');

        // Export to window
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        console.log('Firebase services exposed globally');

        // 5. Cargar popup.js
        await loadScript('src/js/popup.js');
        console.log('Popup.js loaded successfully');
    } catch (error) {
        console.error('Error in initialization sequence:', error);
    }
}

// Iniciar la carga de scripts
console.log('Starting initialization');
initializeApp().then(() => {
    console.log('Initialization complete');
}).catch(error => {
    console.error('Initialization failed:', error);
});
