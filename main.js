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

// 🏋️‍♀️ Sets toevoegen
let exercisesInWorkout = {};

function addSet(exerciseName) {
  const setContainer = document.createElement("div");
  setContainer.classList.add("setContainer");
  setContainer.dataset.exercise = exerciseName;

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
  exercisesInWorkout[exerciseName] = currentSetNumber + 1;

  setContainer.querySelector(".removeSetButton").addEventListener("click", () => {
    setContainer.remove();
  });
}

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
    alert("Vul naam en beschrijving in.");
    return;
  }

  const exercises = [];
  const allSetContainers = setsContainer.querySelectorAll(".setContainer");

  allSetContainers.forEach((setContainer) => {
    const titleParts = setContainer.querySelector("h4").textContent.split(" ");
    const exerciseName = titleParts[0];
    const setNumber = titleParts[2];

    const weightInput = setContainer.querySelector(`#weight-${exerciseName}-${setNumber}`);
    const rirInput = setContainer.querySelector(`#rir-${exerciseName}-${setNumber}`);
    const difficultyInput = setContainer.querySelector(`#difficulty-${exerciseName}-${setNumber}`);

    if (!weightInput || !rirInput || !difficultyInput) return;

    const weight = weightInput.value;
    const rir = rirInput.value;
    const difficulty = difficultyInput.value;

    if (weight && rir && difficulty) {
      let existingExercise = exercises.find(e => e.exercise === exerciseName);
      if (!existingExercise) {
        existingExercise = { exercise: exerciseName, sets: [] };
        exercises.push(existingExercise);
      }
      existingExercise.sets.push({ weight, rir, difficulty });
    }
  });

  const workoutsRef = ref(database, `users/${username}/workouts`);
  const newWorkoutRef = push(workoutsRef);

  set(newWorkoutRef, {
    name: workoutNameValue,
    description: workoutDescriptionValue,
    exercises,
  }).then(() => {
    console.log("Workout opgeslagen!");
    workoutName.value = "";
    workoutDescription.value = "";
    setsContainer.innerHTML = "";
    exercisesInWorkout = {}; // 🔁 reset setnummers
  }).catch(console.error);
});

// 📑 Workouts laden
function loadWorkouts() {
  const workoutsRef = ref(database, `users/${username}/workouts`);
  onValue(workoutsRef, (snapshot) => {
    workoutList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
      const workout = childSnapshot.val();
      const listItem = document.createElement("li");
      listItem.textContent = workout.name;
      listItem.addEventListener("click", () => showWorkoutDetails(workout));
      workoutList.appendChild(listItem);
    });
  });
}

function showWorkoutDetails(workout) {
  workoutDetailsSection.innerHTML = `
    <h3>${workout.name}</h3>
    <p>${workout.description}</p>
    ${workout.exercises.map(ex => `
      <h4>${ex.exercise}</h4>
      <ul>
        ${ex.sets.map(set => `
          <li>Gewicht: ${set.weight} kg, RIR: ${set.rir}, Moeilijkheidsgraad: ${set.difficulty}</li>
        `).join("")}
      </ul>
    `).join("")}
  `;
}

// Start alles op
getExercises();
loadWorkouts();
