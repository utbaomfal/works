const defaultUser = {
username:"test",
password:"1234"
};

function showSignup(){
document.getElementById("auth").style.display="none";
document.getElementById("signupPage").style.display="block";
}

function showLogin(){
document.getElementById("signupPage").style.display="none";
document.getElementById("auth").style.display="block";
}

function login(){

const user =
document.getElementById("loginUser").value;

const pass =
document.getElementById("loginPass").value;

const saved =
JSON.parse(localStorage.getItem("account"));

if(
(user === defaultUser.username &&
pass === defaultUser.password)
||
(saved &&
saved.username === user &&
saved.password === pass)
){
openApp();
}else{
alert("Wrong login");
}
}

function signup(){

const birth =
document.getElementById("birth").value;

const username =
document.getElementById("newUser").value;

const password =
document.getElementById("newPass").value;

localStorage.setItem(
"account",
JSON.stringify({
birth,
username,
password
})
);

openApp();
}

function openApp(){
document.getElementById("auth").style.display="none";
document.getElementById("signupPage").style.display="none";
document.getElementById("app").style.display="flex";
}
