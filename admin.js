import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

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
const db = getDatabase(app);

const exerciseName = document.getElementById("exerciseName");
const exerciseDescription = document.getElementById("exerciseDescription");
const addBtn = document.getElementById("addExerciseButton");
const overviewList = document.getElementById("exerciseOverview");

addBtn.addEventListener("click", () => {
  const name = exerciseName.value.trim();
  const description = exerciseDescription.value.trim();

  if (!name) return alert("Naam is verplicht!");

  const newRef = push(ref(db, "exercises"));
  set(newRef, {
    name,
    description
  }).then(() => {
    exerciseName.value = "";
    exerciseDescription.value = "";
  });
});

function loadExercises() {
  const refExercises = ref(db, "exercises");
  onValue(refExercises, (snapshot) => {
    overviewList.innerHTML = "";
    snapshot.forEach((child) => {
      const ex = child.val();
      const li = document.createElement("li");
      li.textContent = `${ex.name} – ${ex.description || "geen beschrijving"}`;
      overviewList.appendChild(li);
    });
  });
}

loadExercises();
