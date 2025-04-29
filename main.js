import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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

// 🔒 Gebruikersnaam ophalen uit localStorage
const username = localStorage.getItem("fitnessUsername");

if (!username) {
  alert("Geen gebruikersnaam gevonden. Ga terug naar de loginpagina.");
  window.location.href = "index.html";
}

// 🔽 Elementen ophalen
const workoutName = document.getElementById("workoutName");
const workoutDescription = document.getElementById("workoutDescription");
const addExerciseButton = document.getElementById("addExerciseButton");
const exerciseSelect = document.getElementById("exerciseSelect");
const setsContainer = document.getElementById("setsContainer");
const saveButton = document.getElementById("saveButton");
const workoutList = document.getElementById("workoutList");
const workoutDetailsSection = document.getElementById("workoutDetails");

// 🏋️‍♀️ Lijst met oefeningen ophalen
function getExercises() {
  const exercisesRef = ref(database, "exercises");
  onValue(exercisesRef, (snapshot) => {
    exerciseSelect.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const exercise = childSnapshot.val();
      const option = document.createElement("option");
      option.value = exercise.name;
      option.textContent = exercise.name;
      exerciseSelect.appendChild(option);
    });
  });
}

// 🏋️‍♀️ Sets toevoegen voor gekozen oefening
let exercisesInWorkout = {};  // Dit houdt het aantal sets per oefening bij.

function addSet(exerciseName) {
  const setContainer = document.createElement("div");
  setContainer.classList.add("setContainer");

  const currentSetNumber = exercisesInWorkout[exerciseName] || 1;

  setContainer.innerHTML = `
    <h4>${exerciseName} Set ${currentSetNumber}</h4>
    <label for="weight-${exerciseName}-${currentSetNumber}">Gewicht:</label>
    <input type="number" id="weight-${exerciseName}-${currentSetNumber}" placeholder="Gewicht (kg)">
    <label for="rir-${exerciseName}-${currentSetNumber}">RIR:</label>
    <input type="number" id="rir-${exerciseName}-${currentSetNumber}" placeholder="RIR">
    <label for="difficulty-${exerciseName}-${currentSetNumber}">Moeilijkheidsgraad:</label>
    <input type="number" id="difficulty-${exerciseName}-${currentSetNumber}" placeholder="Moeilijkheidsgraad (1-10)">
    <button class="removeSetButton">Verwijder set</button>
  `;

  setsContainer.appendChild(setContainer);

  // Verhoog het setnummer voor de gekozen oefening
  exercisesInWorkout[exerciseName] = currentSetNumber + 1;

  // Voeg eventlistener toe aan de "Verwijder set" knop
  const removeButton = setContainer.querySelector(".removeSetButton");
  removeButton.addEventListener("click", () => removeSet(setContainer));
}

// 📉 Verwijder een set
function removeSet(setContainer) {
  setContainer.remove();
}

// 👟 Oefening toevoegen aan workout
addExerciseButton.addEventListener("click", () => {
  const exerciseName = exerciseSelect.value;
  if (exerciseName) {
    addSet(exerciseName);
  } else {
    alert("Kies een oefening.");
  }
});

// 💾 Workout opslaan
saveButton.addEventListener("click", () => {
  const workoutNameValue = workoutName.value.trim();
  const workoutDescriptionValue = workoutDescription.value.trim();

  if (!workoutNameValue || !workoutDescriptionValue) {
    alert("Vul de naam en beschrijving van de workout in.");
    return;
  }

  const exercises = [];
  setsContainer.querySelectorAll(".setContainer").forEach((setContainer, index) => {
    const exerciseName = setContainer.querySelector("h4").textContent.split(" ")[0]; // Haal de naam van de oefening op
    const weightInput = setContainer.querySelector(`#weight-${exerciseName}-${index + 1}`);
const rirInput = setContainer.querySelector(`#rir-${exerciseName}-${index + 1}`);
const difficultyInput = setContainer.querySelector(`#difficulty-${exerciseName}-${index + 1}`);

if (!weightInput || !rirInput || !difficultyInput) {
  console.error("Een inputveld ontbreekt voor oefening:", exerciseName, "index:", index + 1);
  return;
}

const weight = weightInput.value;
const rir = rirInput.value;
const difficulty = difficultyInput.value;

    if (weight && rir && difficulty) {
      if (!exercises.some(e => e.exercise === exerciseName)) {
        exercises.push({
          exercise: exerciseName,
          sets: [{
            weight,
            rir,
            difficulty,
          }]
        });
      } else {
        const exercise = exercises.find(e => e.exercise === exerciseName);
        exercise.sets.push({
          weight,
          rir,
          difficulty,
        });
      }
    }
  });

  // 🏋️‍♀️ Opslaan in Firebase onder de gebruikersnaam
  const workoutsRef = ref(database, `users/${username}/workouts`);
  const newWorkoutRef = push(workoutsRef);

  set(newWorkoutRef, {
    name: workoutNameValue,
    description: workoutDescriptionValue,
    exercises: exercises,
  }).then(() => {
    console.log("Workout opgeslagen!");
    workoutName.value = "";
    workoutDescription.value = "";
    setsContainer.innerHTML = "";
  }).catch((error) => {
    console.error("Fout bij opslaan:", error);
  });
});

// 📑 Werkouts ophalen en weergeven
function loadWorkouts() {
  const workoutsRef = ref(database, `users/${username}/workouts`);
  onValue(workoutsRef, (snapshot) => {
    workoutList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const workout = childSnapshot.val();
      const listItem = document.createElement("li");
      listItem.textContent = `${workout.name}: ${workout.description}`;
      listItem.addEventListener("click", () => {
        showWorkoutDetails(workout);
      });
      workoutList.appendChild(listItem);
    });
  });
}

// 👀 Workout details tonen onderaan het scherm
function showWorkoutDetails(workout) {
  workoutDetailsSection.innerHTML = `
    <h3>${workout.name}</h3>
    <p>${workout.description}</p>
    <div>
      ${workout.exercises && Array.isArray(workout.exercises)
        ? workout.exercises.map(ex => `
            <div class="exerciseDetail">
              <h4>${ex.exercise}</h4>
              ${ex.sets.map((set, index) => `
                <p>Set ${index + 1}: Gewicht: ${set.weight}kg, RIR: ${set.rir}, Moeilijkheid: ${set.difficulty}/10</p>
              `).join("")}
            </div>
          `).join("")
        : "<p>Geen oefeningen gevonden voor deze workout.</p>"}
    </div>
  `;
}


// Start de oefeningenlijst op
getExercises();

// Laad de workouts bij het laden van de pagina
loadWorkouts();
