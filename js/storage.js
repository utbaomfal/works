
let users = JSON.parse(localStorage.getItem("users")) || [
  { username: "test", password: "1234", birth: "01/01/2000" }
];

let currentUser = null;

function save() {
  localStorage.setItem("users", JSON.stringify(users));
}
