import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, get } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// 🔥 Firebase config
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

// 👤 Gebruiker
const username = localStorage.getItem("fitnessUsername");
if (!username) {
  alert("Geen gebruikersnaam gevonden. Ga terug naar de loginpagina.");
  window.location.href = "index.html";
}

// 📋 Vooraf ingestelde oefeningen
const EXERCISES = [
  { id: "squat", name: "Squat" },
  { id: "bench_press", name: "Bench Press" },
  { id: "deadlift", name: "Deadlift" },
  { id: "overhead_press", name: "Overhead Press" }
];

// 🔽 Elementen
const workoutName = document.getElementById("workoutName");
const exerciseList = document.getElementById("exerciseList");
const selectedExercisesContainer = document.getElementById("selectedExercisesContainer");
const saveButton = document.getElementById("saveButton");
const workoutList = document.getElementById("workoutList");
const workoutDetails = document.getElementById("workoutDetails");

// 📦 Toon alle oefeningen als checkbox
EXERCISES.forEach(exercise => {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = exercise.id;
  checkbox.dataset.name = exercise.name;
  checkbox.addEventListener("change", renderSelectedExercises);
  label.appendChild(checkbox);
  label.append(` ${exercise.name}`);
  exerciseList.appendChild(label);
  exerciseList.appendChild(document.createElement("br"));
});

// 🧩 Bij selectie: tonen van setvelden
function renderSelectedExercises() {
  selectedExercisesContainer.innerHTML = "";

  const selected = [...exerciseList.querySelectorAll("input:checked")];
  selected.forEach(checkbox => {
    const exerciseId = checkbox.value;
    const name = checkbox.dataset.name;

    const exerciseDiv = document.createElement("div");
    exerciseDiv.innerHTML = `<h4>${name}</h4>`;

    const addSetBtn = document.createElement("button");
    addSetBtn.textContent = "Set toevoegen";
    exerciseDiv.appendChild(addSetBtn);

    const setList = document.createElement("div");
    exerciseDiv.appendChild(setList);

    addSetBtn.addEventListener("click", () => {
      const setDiv = document.createElement("div");
      setDiv.innerHTML = `
        Gewicht: <input type="number" step="0.1" class="weight"> kg |
        RIR: <input type="number" class="rir"> |
        Moeilijkheid (1-10): <input type="number" min="1" max="10" class="difficulty">
      `;
      setList.appendChild(setDiv);
    });

    selectedExercisesContainer.appendChild(exerciseDiv);
  });
}

// 💾 Workout opslaan
saveButton.addEventListener("click", () => {
  const name = workoutName.value.trim();
  if (!name) {
    alert("Geef een naam voor je workout in.");
    return;
  }

  const workoutData = { name, exercises: [] };
  const selected = [...exerciseList.querySelectorAll("input:checked")];

  selected.forEach((checkbox, i) => {
    const exerciseName = checkbox.dataset.name;
    const exerciseDiv = selectedExercisesContainer.children[i];
    const setInputs = [...exerciseDiv.querySelectorAll("div > div")];
    const sets = setInputs.map(setDiv => {
      return {
        weight: setDiv.querySelector(".weight").value,
        rir: setDiv.querySelector(".rir").value,
        difficulty: setDiv.querySelector(".difficulty").value
      };
    });
    workoutData.exercises.push({ name: exerciseName, sets });
  });

  const workoutsRef = ref(database, `users/${username}/workouts`);
  const newWorkoutRef = push(workoutsRef);
  set(newWorkoutRef, workoutData).then(() => {
    alert("Workout opgeslagen!");
    workoutName.value = "";
    exerciseList.querySelectorAll("input:checked").forEach(cb => cb.checked = false);
    selectedExercisesContainer.innerHTML = "";
    getWorkoutData(); // refresh
  }).catch(err => {
    console.error("Fout bij opslaan:", err);
  });
});

// 📥 Workout lijst ophalen
function getWorkoutData() {
  const workoutsRef = ref(database, `users/${username}/workouts`);
  onValue(workoutsRef, (snapshot) => {
    workoutList.innerHTML = "";
    workoutDetails.innerHTML = "";

    snapshot.forEach(child => {
      const workout = child.val();
      const key = child.key;

      const li = document.createElement("li");
      li.textContent = workout.name;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => showWorkoutDetails(workout));
      workoutList.appendChild(li);
    });
  });
}

// 📤 Details van workout tonen
function showWorkoutDetails(workout) {
  workoutDetails.innerHTML = `<h3>${workout.name}</h3>`;
  workout.exercises.forEach(ex => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${ex.name}</strong><br>`;
    ex.sets.forEach((set, i) => {
      div.innerHTML += `Set ${i + 1}: ${set.weight} kg, RIR: ${set.rir}, Moeilijkheid: ${set.difficulty}<br>`;
    });
    workoutDetails.appendChild(div);
  });
}

getWorkoutData();
