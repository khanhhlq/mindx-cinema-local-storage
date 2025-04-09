// if already logged in, redirect to home page
if (localStorage.getItem("currentUser")) {
  location.href = "./index.html";
}

var form = document.querySelector("form");
form.addEventListener("submit", function(e) {
  e.preventDefault();

  var username = document.getElementById("username").value.trim();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var lowerCaseLetter = /[a-z]/g;
  var upperCaseLetter = /[A-Z]/g;
  var numbers = /[0-9]/g;

  if (username.length < 6) {
    alert("Username must be at least 6 characters");
  } else if (password.length < 8) {
    alert("Password must be at least 8 characters");
  } else if (!password.match(lowerCaseLetter)) {
    alert("Password must contain a lowercase letter");
  } else if (!password.match(upperCaseLetter)) {
    alert("Password must contain a uppercase letter");
  } else if (!password.match(numbers)) {
    alert("Password must contain a number or special character");
  } else {
    if (localStorage.getItem("users")) {
      var users = JSON.parse(localStorage.getItem("users"));

      users.push({
        email: email,
        password: password,
        username: username
      });

      localStorage.setItem("users", JSON.stringify(users));
    } else {
      localStorage.setItem(
        "users",
        JSON.stringify([
          {
            email: email,
            password: password,
            username: username
          }
        ])
      );
    }

    alert("User created successfully, please login");
    location.href = "./login.html";
  }
});