const ACCOUNTS_KEY = "dc_accounts";
const MSG_KEY = "dc_messages";
const PRESENCE_KEY = "dc_presence";
const CURRENT_KEY = "dc_current_user";

const DEFAULT_ACCOUNTS = [
  { username: "test", password: "1234", birthday: "01/01/2000", avatarHue: 210 },
  { username: "alice", password: "1111", birthday: "10/10/2004", avatarHue: 320 },
  { username: "bob", password: "2222", birthday: "05/05/2003", avatarHue: 140 }
];

export function seedData(){
  const accounts = getAccounts();
  if (!accounts.length){
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  }
  if (!localStorage.getItem(MSG_KEY)){
    localStorage.setItem(MSG_KEY, JSON.stringify({}));
  }
  if (!localStorage.getItem(PRESENCE_KEY)){
    localStorage.setItem(PRESENCE_KEY, JSON.stringify({}));
  }
}

export function getAccounts(){
  return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
}

export function saveAccounts(accounts){
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function createAccount({ username, password, birthday }){
  const accounts = getAccounts();
  const exists = accounts.some(a => a.username.toLowerCase() === username.toLowerCase());
  if (exists) return { ok: false, error: "Användarnamnet finns redan." };

  const nextHue = Math.floor(Math.random() * 360);
  accounts.push({ username, password, birthday, avatarHue: nextHue });
  saveAccounts(accounts);
  return { ok: true };
}

export function login(username, password){
  const accounts = getAccounts();
  const user = accounts.find(
    a => a.username.toLowerCase() === username.toLowerCase() && a.password === password
  );
  if (!user) return { ok: false, error: "Fel username eller password." };

  sessionStorage.setItem(CURRENT_KEY, user.username);
  return { ok: true, user };
}

export function getCurrentUser(){
  return sessionStorage.getItem(CURRENT_KEY) || "";
}

export function logout(){
  sessionStorage.removeItem(CURRENT_KEY);
  clearPresence(getCurrentUser());
}

export function getUser(username){
  return getAccounts().find(a => a.username.toLowerCase() === username.toLowerCase()) || null;
}

export function getAllUsers(exceptUsername = ""){
  return getAccounts()
    .filter(u => u.username.toLowerCase() !== exceptUsername.toLowerCase())
    .sort((a, b) => a.username.localeCompare(b.username));
}

export function getConversationKey(a, b){
  return [a.toLowerCase(), b.toLowerCase()].sort().join("__");
}

export function getMessages(a, b){
  const all = JSON.parse(localStorage.getItem(MSG_KEY) || "{}");
  return all[getConversationKey(a, b)] || [];
}

export function sendMessage(from, to, text){
  const all = JSON.parse(localStorage.getItem(MSG_KEY) || "{}");
  const key = getConversationKey(from, to);
  if (!all[key]) all[key] = [];

  all[key].push({
    from,
    to,
    text,
    time: Date.now()
  });

  localStorage.setItem(MSG_KEY, JSON.stringify(all));
}

export function getPresenceMap(){
  return JSON.parse(localStorage.getItem(PRESENCE_KEY) || "{}");
}

export function setPresence(username, online = true){
  if (!username) return;
  const map = getPresenceMap();
  if (online){
    map[username] = Date.now();
  } else {
    delete map[username];
  }
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(map));
}

export function clearPresence(username){
  if (!username) return;
  const map = getPresenceMap();
  delete map[username];
  localStorage.setItem(PRESENCE_KEY, JSON.stringify(map));
}

export function isOnline(username){
  const map = getPresenceMap();
  const last = map[username];
  return !!last && (Date.now() - last) < 30000;
}

export function statusLabel(username){
  return isOnline(username) ? "online" : "offline";
}

export function timeLabel(ts){
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
