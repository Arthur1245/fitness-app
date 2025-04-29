document.getElementById("loginButton").addEventListener("click", () => {
    const usernameInput = document.getElementById("username");
    const username = usernameInput.value.trim();
  
    if (!username) {
      alert("Geef een geldige gebruikersnaam in.");
      return;
    }
  
    // Sla gebruikersnaam op in localStorage
    localStorage.setItem("fitnessUsername", username);
  
    // Navigeer naar main.html
    window.location.href = "main.html";
  });
  