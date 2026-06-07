
function startApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("signupPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("meName").innerText = currentUser.username;

  loadUsers();
}

function loadUsers() {
  let list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(u => {
    let div = document.createElement("div");
    div.innerText = u.username;
    div.onclick = () => openChat(u.username);
    list.appendChild(div);
  });
}

let activeChat = null;

function openChat(name) {
  activeChat = name;
  document.getElementById("chatBox").innerHTML += 
    `<p>Chat with ${name}</p>`;
}

function sendMsg() {
  let msg = document.getElementById("msg").value;

  if (!msg) return;

  let box = document.getElementById("chatBox");
  box.innerHTML += `<p><b>${currentUser.username}:</b> ${msg}</p>`;

  document.getElementById("msg").value = "";
}
