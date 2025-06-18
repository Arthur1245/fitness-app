import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB0Q2ez2d9RjSOh4KmuYmXgU59mcwOkcYg",
  authDomain: "fitnessapp-2a7a9.firebaseapp.com",
  projectId: "fitnessapp-2a7a9",
  storageBucket: "fitnessapp-2a7a9.appspot.com",
  messagingSenderId: "109645478176",
  appId: "1:109645478176:web:5b36052d4c798cada83f45",
  databaseURL: "https://fitnessapp-2a7a9-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Haal fitnessUsername uit localStorage
const username = localStorage.getItem("fitnessUsername");

if (!username) {
  alert("Gebruiker niet gevonden. Je wordt teruggestuurd naar het login-scherm.");
  window.location.href = "index.html"; // of je login pagina
}

// Haal het calendar-element op
const calendarEl = document.getElementById("calendar");

// Maak een nieuwe fullcalendar instantie aan
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "dayGridMonth",
  events: function(info, successCallback, failureCallback) {
    // Haal workouts op van Firebase voor deze gebruiker
    const workoutsRef = ref(database, `users/${username}/workouts`);
    onValue(workoutsRef, (snapshot) => {
      const events = [];
      snapshot.forEach((childSnapshot) => {
        const workout = childSnapshot.val();
        const date = new Date(workout.date); // zorg dat je het juiste formaat hebt
        events.push({
          title: workout.name || "Naam ontbreekt",
          start: date,
          description: workout.description || "",
          exercises: workout.exercises || [],
          allDay: true
        });
      });
      successCallback(events);
    });
  },
  eventClick: function(info) {
    // Event details weergeven
    const workoutDetails = document.getElementById("workoutDetails");
    const workoutTitle = document.getElementById("workoutTitle");
    const workoutDescription = document.getElementById("workoutDescription");
    const exercisesList = document.getElementById("exercisesList");

    workoutTitle.textContent = info.event.title;
    workoutDescription.textContent = info.event.extendedProps.description;

    exercisesList.innerHTML = "";
    info.event.extendedProps.exercises.forEach(exercise => {
      const exerciseItem = document.createElement("div");
      exerciseItem.innerHTML = `
        <h4>${exercise.exercise}</h4>
        <ul>
          ${exercise.sets.map(set => `
            <li>Gewicht: ${set.weight} kg, Hoeveelheid reps: ${set.reps}, RIR: ${set.rir}</li>

          `).join("")}
        </ul>
      `;
      exercisesList.appendChild(exerciseItem);
    });

    workoutDetails.style.display = "block";
  }
});
// Voeg eventlistener toe aan de 'Terug naar Main' knop
document.getElementById("backBtn").addEventListener("click", function() {
  window.location.href = "main.html"; // Zorg ervoor dat je naar je main pagina gaat
});

calendar.render();
