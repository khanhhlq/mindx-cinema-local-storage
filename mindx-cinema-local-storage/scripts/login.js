// if already logged in, redirect to home page
if (localStorage.getItem("currentUser")) {
  location.href = "./index.html";
}

var form = document.querySelector("form");
form.addEventListener("submit", function(e) {
  e.preventDefault();

  if (!localStorage.getItem("users")) {
    alert("No user found");
  } else {
    var users = JSON.parse(localStorage.getItem("users"));

    var email = document.getElementById("email");
    var password = document.getElementById("password");

    var existingUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email.value.trim() && 
          users[i].password === password.value.trim()) {
        existingUser = users[i];
        break;
      }
    }

    if (existingUser) {
      localStorage.setItem("currentUser", JSON.stringify(existingUser));
      location.href = "/index.html";
    } else {
      alert("Email or password is incorrect");
    }
  }
});