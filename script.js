let users = [
{
username:"test",
password:"1234",
birthday:"01/01/2000",
gender:"Male"
}
];

function login(){

const user =
document.getElementById("loginUser").value;

const pass =
document.getElementById("loginPass").value;

const found = users.find(
u => u.username === user &&
u.password === pass
);

if(found){
goHome(found.username);
}
else{
alert("Wrong username or password");
}

}

function signup(){

const birthday =
document.getElementById("signupAge").value;

const gender =
document.getElementById("signupGender").value;

const username =
document.getElementById("signupUser").value;

const password =
document.getElementById("signupPass").value;

if(
!birthday ||
!username ||
!password
){
alert("Fill all fields");
return;
}

const exists = users.find(
u => u.username === username
);

if(exists){
alert("Username already exists");
return;
}

users.push({
birthday,
gender,
username,
password
});

goHome(username);

}

function goHome(username){

document.getElementById("authPage").style.display="none";

document.getElementById("homePage").style.display="block";

document.getElementById("welcomeText").textContent =
"Logged in as " + username;

}

function logout(){

document.getElementById("homePage").style.display="none";

document.getElementById("authPage").style.display="block";

}
