// In dit bestand kun je je JavaScript-code schrijven die werkt met de Firebase-database

import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Haal de database instantie op
const database = getDatabase();

// Functie om gegevens op te halen uit de Firebase-database
function getWorkoutData() {
    const workoutRef = ref(database, 'workouts/');
    
    get(workoutRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(data);
            // Verwerk en toon de gegevens op de pagina (bijvoorbeeld in een tabel of lijst)
        } else {
            console.log("Geen gegevens gevonden");
        }
    }).catch((error) => {
        console.error("Fout bij het ophalen van gegevens: ", error);
    });
}

// Roep de functie aan om workoutgegevens op te halen
getWorkoutData();
