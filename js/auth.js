
function showSignup() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function login() {
  let u = loginUser.value;
  let p = loginPass.value;

  let found = users.find(x => x.username === u && x.password === p);

  if (!found) return alert("wrong login");

  currentUser = found;
  startApp();
}

function signup() {
  let u = suUser.value;
  let p = suPass.value;
  let b = suBirth.value;

  if (!u || !p || !b) return alert("fill all");

  users.push({ username: u, password: p, birth: b });
  save();

  alert("account created!");
  showLogin();
}
