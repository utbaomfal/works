import { createAccount, login as doLogin } from "./storage.js";

function isDateLike(value){
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

export function renderAuth(root, onSuccess){
  root.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-left">
          <div>
            <div class="auth-brand">
              <div class="discord-badge">D</div>
              <div>Discord Demo</div>
            </div>
            <div class="auth-copy" style="margin-top:28px;">
              <h1>Chatta, DM:a och testa konton.</h1>
              <p>En enkel Discord-lik sida för att testa layout, login och DMs.</p>
            </div>
          </div>
          <div class="auth-note">
            Testkonto: <b>test</b> / <b>1234</b><br>
            Detta är bara frontend. Riktiga DMs mellan olika datorer kräver server senare.
          </div>
        </div>

        <div class="auth-right">
          <div class="auth-panel">
            <div class="tab-row">
              <button class="tab-btn active" data-tab="login">Log in</button>
              <button class="tab-btn" data-tab="signup">Sign up</button>
            </div>

            <div id="authFormSlot"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const slot = root.querySelector("#authFormSlot");
  let active = "login";

  function renderForm(){
    if (active === "login"){
      slot.innerHTML = `
        <form class="form" id="loginForm">
          <div class="field">
            <label>Username</label>
            <input name="username" autocomplete="username" placeholder="test" />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" autocomplete="current-password" placeholder="1234" />
          </div>
          <div class="error" id="authError"></div>
          <button class="primary-btn" type="submit">Log in</button>
          <div class="small-text">
            Du kan logga in med test / 1234 direkt.
          </div>
        </form>
      `;
      const form = slot.querySelector("#loginForm");
      const err = slot.querySelector("#authError");
      form.addEventListener("submit", e => {
        e.preventDefault();
        const username = form.username.value.trim();
        const password = form.password.value;
        const res = doLogin(username, password);
        if (!res.ok){
          err.textContent = res.error;
          return;
        }
        onSuccess?.();
      });
    } else {
      slot.innerHTML = `
        <form class="form" id="signupForm">
          <div class="field">
            <label>Age / birthday</label>
            <input name="birthday" placeholder="00/00/yyyy" />
          </div>
          <div class="field">
            <label>Username</label>
            <input name="username" autocomplete="username" placeholder="coolname" />
          </div>
          <div class="field">
            <label>Password</label>
            <input name="password" type="password" autocomplete="new-password" />
          </div>
          <div class="field">
            <label>Confirm password</label>
            <input name="confirm" type="password" autocomplete="new-password" />
          </div>
          <div class="error" id="authError"></div>
          <button class="primary-btn" type="submit">Create account</button>
          <div class="small-text">
            Formaten måste vara som 00/00/yyyy.
          </div>
        </form>
      `;
      const form = slot.querySelector("#signupForm");
      const err = slot.querySelector("#authError");
      form.addEventListener("submit", e => {
        e.preventDefault();
        const birthday = form.birthday.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value;
        const confirm = form.confirm.value;

        if (!isDateLike(birthday)){
          err.textContent = "Skriv födelsedag som 00/00/yyyy.";
          return;
        }
        if (username.length < 3){
          err.textContent = "Username måste vara minst 3 tecken.";
          return;
        }
        if (password.length < 4){
          err.textContent = "Password måste vara minst 4 tecken.";
          return;
        }
        if (password !== confirm){
          err.textContent = "Passwords matchar inte.";
          return;
        }

        const res = createAccount({ username, password, birthday });
        if (!res.ok){
          err.textContent = res.error;
          return;
        }

        doLogin(username, password);
        onSuccess?.();
      });
    }
  }

  root.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      active = btn.dataset.tab;
      root.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderForm();
    });
  });

  renderForm();
}
