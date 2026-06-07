import {
  seedData,
  getCurrentUser,
  getUser,
  getAllUsers,
  getMessages,
  sendMessage,
  timeLabel,
  logout,
  setPresence,
  clearPresence,
  isOnline,
  statusLabel
} from "./storage.js";
import { renderAuth } from "./auth.js";

seedData();

const root = document.getElementById("root");
const bc = "BroadcastChannel" in window ? new BroadcastChannel("discord-demo") : null;

let state = {
  activeChat: "",
  search: "",
  msgText: "",
  showAuth: !getCurrentUser()
};

function avatarHue(name){
  const user = getUser(name);
  return user?.avatarHue ?? 210;
}

function initials(name){
  return name.slice(0, 2).toUpperCase();
}

function avatarStyle(name){
  return `background:hsl(${avatarHue(name)},70%,45%)`;
}

function render(){
  const me = getCurrentUser();

  if (!me){
    clearPresence(me);
    renderAuth(root, () => {
      state.showAuth = false;
      render();
      startPresence();
      notify();
    });
    return;
  }

  const users = getAllUsers(me).filter(u =>
    u.username.toLowerCase().includes(state.search.toLowerCase())
  );

  if (!state.activeChat || !getUser(state.activeChat)){
    state.activeChat = users[0]?.username || "";
  }

  const chatUser = state.activeChat ? getUser(state.activeChat) : null;
  const msgs = chatUser ? getMessages(me, chatUser.username) : [];

  root.innerHTML = `
    <div class="app">
      <aside class="server-rail">
        <div class="server-icon active">D</div>
        <div class="server-sep"></div>
        <div class="server-icon">#</div>
        <div class="server-icon">+</div>
        <div class="server-icon">?</div>
      </aside>

      <aside class="dm-rail">
        <div class="dm-top">
          <input class="search" id="search" placeholder="Find or start a DM" value="${escapeHtml(state.search)}" />
        </div>

        <div class="menu-list">
          <button class="menu-item active">💬 Friends</button>
          <button class="menu-item">🟣 Nitro</button>
          <button class="menu-item">🛒 Shop</button>
          <button class="menu-item">📨 Message Requests</button>
          <button class="menu-item">➕ Add Friend</button>
        </div>

        <div class="dm-list">
          <div class="section-title">Direct Messages</div>
          ${users.map(u => `
            <button class="dm-item ${chatUser?.username === u.username ? "active" : ""}" data-user="${escapeAttr(u.username)}">
              <div class="avatar sm" style="${avatarStyle(u.username)}">${initials(u.username)}</div>
              <div class="user-meta">
                <div class="user-name">${escapeHtml(u.username)}</div>
                <div class="user-sub">${isOnline(u.username) ? "Online" : "Offline"}</div>
              </div>
              <div class="presence ${statusLabel(u.username)}"></div>
            </button>
          `).join("")}
        </div>

        <div class="bottom-user">
          <div class="avatar sm" style="${avatarStyle(me)}">${initials(me)}</div>
          <div class="user-meta">
            <div class="user-name">${escapeHtml(me)}</div>
            <div class="user-sub">${isOnline(me) ? "Online" : "Offline"}</div>
          </div>
          <div class="bottom-actions">
            <button class="icon-btn" id="logoutBtn" title="Log out">⎋</button>
          </div>
        </div>
      </aside>

      <main class="chat-wrap">
        <div class="chat-top">
          <div class="chat-title">
            <div class="avatar sm" style="${chatUser ? avatarStyle(chatUser.username) : "background:#666"}">
              ${chatUser ? initials(chatUser.username) : "?"}
            </div>
            <div>
              <h2>${chatUser ? escapeHtml(chatUser.username) : "No chat selected"}</h2>
              <span>${chatUser ? (isOnline(chatUser.username) ? "Online" : "Offline") : "Choose a DM"}</span>
            </div>
          </div>

          <div class="chat-tools">
            <button class="icon-btn" title="Search">🔎</button>
            <button class="icon-btn" title="Call">📞</button>
            <button class="icon-btn" title="Video">🎥</button>
            <button class="icon-btn" title="Pinned">📌</button>
          </div>
        </div>

        <div class="chat-body" id="chatBody">
          ${chatUser ? renderMessages(me, chatUser.username, msgs) : `
            <div class="empty-state">
              <div>
                <h2>Welcome to your DM space</h2>
                <p>Välj en person i listan till vänster.</p>
              </div>
            </div>
          `}
        </div>

        <form class="composer" id="composerForm">
          <button type="button" class="icon-btn" title="Attach">+</button>
          <div class="composer-box">
            <button type="button" class="icon-btn" title="Emoji">😊</button>
            <input id="msgInput" placeholder="${chatUser ? `Message @${chatUser.username}` : "Pick a DM first"}" ${chatUser ? "" : "disabled"} />
            <button type="button" class="icon-btn" title="GIF">GIF</button>
            <button type="button" class="icon-btn" title="Sticker">▣</button>
          </div>
          <button class="send-btn" type="submit" ${chatUser ? "" : "disabled"}>Send</button>
        </form>
      </main>

      <aside class="right-rail">
        ${chatUser ? renderProfile(chatUser.username) : renderMeCard(me)}
      </aside>
    </div>
  `;

  const search = root.querySelector("#search");
  if (search){
    search.addEventListener("input", e => {
      state.search = e.target.value;
      render();
    });
  }

  root.querySelectorAll("[data-user]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeChat = btn.dataset.user;
      render();
    });
  });

  const logoutBtn = root.querySelector("#logoutBtn");
  if (logoutBtn){
    logoutBtn.addEventListener("click", () => {
      const current = getCurrentUser();
      clearPresence(current);
      logout();
      stopPresence();
      state.activeChat = "";
      render();
    });
  }

  const composerForm = root.querySelector("#composerForm");
  const msgInput = root.querySelector("#msgInput");
  if (composerForm && chatUser){
    msgInput.focus();
    composerForm.addEventListener("submit", e => {
      e.preventDefault();
      const text = msgInput.value.trim();
      if (!text) return;
      sendMessage(me, chatUser.username, text);
      msgInput.value = "";
      render();
      notify();
      setTimeout(() => {
        const box = root.querySelector("#chatBody");
        if (box) box.scrollTop = box.scrollHeight;
      }, 0);
    });
  }

  const box = root.querySelector("#chatBody");
  if (box) box.scrollTop = box.scrollHeight;
}

function renderMessages(me, other, msgs){
  if (!msgs.length){
    return `
      <div class="empty-state">
        <div>
          <h2>Säg hej till @${escapeHtml(other)}</h2>
          <p>Det här chatten är tom just nu.</p>
        </div>
      </div>
    `;
  }

  return msgs.map(m => `
    <div class="msg ${m.from === me ? "me" : ""}">
      ${m.from !== me ? `<div class="avatar sm" style="${avatarStyle(m.from)}">${initials(m.from)}</div>` : ""}
      <div class="bubble">
        <div class="msg-head">
          <strong>${escapeHtml(m.from)}</strong>
          <time>${escapeHtml(timeLabel(m.time))}</time>
        </div>
        <div class="msg-text">${escapeHtml(m.text)}</div>
      </div>
    </div>
  `).join("");
}

function renderProfile(username){
  const user = getUser(username);
  if (!user) return "";
  return `
    <div class="profile-card">
      <div class="profile-banner"></div>
      <div class="avatar" style="width:72px;height:72px;margin-top:-34px;border:4px solid #2b2d31;${avatarStyle(username)}">
        ${initials(username)}
      </div>
      <h3 class="profile-name">${escapeHtml(user.username)}</h3>
      <p class="profile-username">@${escapeHtml(user.username)}</p>
      <div class="profile-badge">🟢 ${isOnline(username) ? "Online" : "Offline"}</div>
      <div>
        <span class="pill">DM</span>
        <span class="pill">Profile</span>
        <span class="pill">Account</span>
      </div>
      <p class="small-text" style="margin-top:12px;">
        Birthday: ${escapeHtml(user.birthday)}
      </p>
    </div>
  `;
}

function renderMeCard(me){
  const user = getUser(me);
  return `
    <div class="profile-card">
      <div class="profile-banner"></div>
      <div class="avatar" style="width:72px;height:72px;margin-top:-34px;border:4px solid #2b2d31;${avatarStyle(me)}">
        ${initials(me)}
      </div>
      <h3 class="profile-name">${escapeHtml(user?.username || me)}</h3>
      <p class="profile-username">@${escapeHtml(me)}</p>
      <div class="profile-badge">🟢 ${isOnline(me) ? "Online" : "Offline"}</div>
      <div>
        <span class="pill">Multiple accounts</span>
        <span class="pill">Local save</span>
      </div>
    </div>
  `;
}

let presenceTimer = null;

function startPresence(){
  stopPresence();
  const me = getCurrentUser();
  if (!me) return;
  setPresence(me, true);
  presenceTimer = setInterval(() => {
    setPresence(getCurrentUser(), true);
    notify();
  }, 10000);

  window.addEventListener("beforeunload", beforeUnloadHandler);
}

function stopPresence(){
  if (presenceTimer){
    clearInterval(presenceTimer);
    presenceTimer = null;
  }
  window.removeEventListener("beforeunload", beforeUnloadHandler);
}

function beforeUnloadHandler(){
  clearPresence(getCurrentUser());
}

function notify(){
  if (bc) bc.postMessage({ type: "refresh" });
}

window.addEventListener("storage", () => {
  render();
});

if (bc){
  bc.onmessage = () => render();
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && getCurrentUser()){
    setPresence(getCurrentUser(), true);
    render();
  }
});

function escapeHtml(text){
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(text){
  return escapeHtml(text).replaceAll("`", "&#096;");
}

render();
startPresence();
