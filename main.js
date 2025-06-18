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

const username = localStorage.getItem("fitnessUsername");
if (!username) {
  alert("Geen gebruikersnaam gevonden. Ga terug naar de loginpagina.");
  window.location.href = "index.html";
}

const workoutName = document.getElementById("workoutName");
const workoutDescription = document.getElementById("workoutDescription");
const addExerciseButton = document.getElementById("addExerciseButton");
const exerciseSelect = document.getElementById("exerciseSelect");
const setsContainer = document.getElementById("setsContainer");
const saveButton = document.getElementById("saveButton");
const workoutList = document.getElementById("workoutList");
const workoutDetailsSection = document.getElementById("workoutDetails");

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

let exercisesInWorkout = {};

function addSet(exerciseName) {
  const currentSetNumber = exercisesInWorkout[exerciseName] || 1;
  const setId = `${exerciseName.replaceAll(" ", "_")}-${currentSetNumber}`;

  const setContainer = document.createElement("div");
  setContainer.classList.add("setContainer");

  setContainer.innerHTML = `
  <h4>${exerciseName} - Set ${currentSetNumber}</h4>
  <label>Gewicht:</label>
  <input type="number" id="weight-${setId}" placeholder="Gewicht (kg)">
  <label>Hoeveelheid reps:</label>
  <input type="number" id="reps-${setId}" placeholder="Aantal reps">
  <label>RIR:</label>
  <input type="number" id="rir-${setId}" placeholder="RIR">
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

saveButton.addEventListener("click", () => {
  const workoutNameValue = workoutName.value.trim();
  const workoutDescriptionValue = workoutDescription.value.trim();

  if (!workoutNameValue || !workoutDescriptionValue) {
    alert("Vul naam en beschrijving in.");
    return;
  }

  const exercises = {};
  const allSetContainers = setsContainer.querySelectorAll(".setContainer");

  allSetContainers.forEach((setContainer) => {
    const h4 = setContainer.querySelector("h4").textContent;
    const exerciseName = h4.split(" - Set ")[0];

    const setId = `${exerciseName.replaceAll(" ", "_")}-${exercisesInWorkout[exerciseName] - 1}`;
    const weightInput = setContainer.querySelector(`[id^="weight-"]`);
    const rirInput = setContainer.querySelector(`[id^="rir-"]`);
    const repsInput = setContainer.querySelector(`[id^="reps-"]`);

    const weight = weightInput.value;
    const rir = rirInput.value;
    const reps = repsInput.value;

    if (weight && rir && reps) {
      if (!exercises[exerciseName]) {
        exercises[exerciseName] = [];
      }
      exercises[exerciseName].push({ weight, rir, reps });
    }
  });

  const formattedExercises = Object.entries(exercises).map(([name, sets]) => ({
    exercise: name,
    sets
  }));

  const workoutsRef = ref(database, `users/${username}/workouts`);
  const newWorkoutRef = push(workoutsRef);

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(":").slice(0, 2).join(":");
  const datetime = `${date}T${time}`;

  set(newWorkoutRef, {
    name: workoutNameValue,
    description: workoutDescriptionValue,
    date,
    datetime,
    exercises: formattedExercises
  }).then(() => {
    console.log("Workout opgeslagen!");
    workoutName.value = "";
    workoutDescription.value = "";
    setsContainer.innerHTML = "";
    exercisesInWorkout = {};
  }).catch(console.error);
});

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
  if (!Array.isArray(workout.exercises)) {
    workout.exercises = [];
  }

  workoutDetailsSection.innerHTML = `
    <h3>${workout.name}</h3>
    <p>${workout.description}</p>
    ${workout.exercises.map(ex => `
      <h4>${ex.exercise}</h4>
      <ul>
        ${ex.sets.map(set => `
          <li>Gewicht: ${set.weight} kg, Hoeveelheid reps: ${set.reps}, RIR: ${set.rir}</li>

        `).join("")}
      </ul>
    `).join("")}
  `;
}

getExercises();
loadWorkouts();
