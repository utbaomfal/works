// Test account
const defaultAccount = {
  username: "test",
  password: "1234"
};

function showSignup() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "block";
}

function showLogin() {
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

function openHome(username) {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("signupPage").style.display = "none";
  document.getElementById("homePage").style.display = "block";

  document.getElementById("welcomeUser").textContent = username;
}

function login() {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  // test account
  if (
    username === defaultAccount.username &&
    password === defaultAccount.password
  ) {
    openHome(username);
    return;
  }

  const users =
    JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (user) {
    openHome(user.username);
  } else {
    alert("Wrong username or password");
  }
}

function signup() {
  const age = document.getElementById("age").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const gender = document.getElementById("gender").value;

  if (
    !age ||
    !username ||
    !password
  ) {
    alert("Fill all fields");
    return;
  }

  const users =
    JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(
    u => u.username === username
  );

  if (exists) {
    alert("Username already exists");
    return;
  }

  users.push({
    age,
    username,
    password,
    gender
  });

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

  openHome(username);
}

function logout() {
  location.reload();
}
