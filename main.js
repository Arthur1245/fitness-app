// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// 🔥 JOUW Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB0Q2ez2d9RjSOh4KmuYmXgU59mcwOkcYg",
    authDomain: "fitnessapp-2a7a9.firebaseapp.com",
    projectId: "fitnessapp-2a7a9",
    storageBucket: "fitnessapp-2a7a9.firebasestorage.app",
    messagingSenderId: "109645478176",
    appId: "1:109645478176:web:5b36052d4c798cada83f45",
    databaseURL: "https://fitnessapp-2a7a9-default-rtdb.europe-west1.firebasedatabase.app/",

  };

// 🔥 Initialiseer Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// 🔒 Anonymous login
signInAnonymously(auth)
  .then(() => {
    console.log("Succesvol anoniem ingelogd!");

    // Workouts ophalen en tonen
    getWorkoutData();
  })
  .catch((error) => {
    console.error("Probleem bij inloggen:", error);
  });

// 🔽 Elementen ophalen
const saveButton = document.getElementById("saveButton");
const workoutName = document.getElementById("workoutName");
const workoutDescription = document.getElementById("workoutDescription");
const workoutList = document.getElementById("workoutList");

// 💾 Data opslaan
saveButton.addEventListener("click", () => {
  const name = workoutName.value.trim();
  const description = workoutDescription.value.trim();

  if (name && description) {
    const workoutsRef = ref(database, "workouts");
    const newWorkoutRef = push(workoutsRef);

    set(newWorkoutRef, {
      name,
      description
    }).then(() => {
      console.log("Workout opgeslagen!");
      workoutName.value = "";
      workoutDescription.value = "";
    }).catch((error) => {
      console.error("Fout bij opslaan:", error);
    });
  } else {
    alert("Vul beide velden in.");
  }
});

// 📚 Workouts ophalen
function getWorkoutData() {
  const workoutsRef = ref(database, "workouts");

  onValue(workoutsRef, (snapshot) => {
    workoutList.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
      const workout = childSnapshot.val();
      const li = document.createElement("li");
      li.textContent = `${workout.name}: ${workout.description}`;
      workoutList.appendChild(li);
    });
  });
};
