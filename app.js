(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const cfg = window.APP_CONFIG || {};
const sb = (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase) ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const LS = "roomPlannerData";
let data = {}, canEdit = !sb, building = "front", loggedIn = false;

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toast = m => { const t = $("#toast"); t.textContent = m; t.hidden = false; setTimeout(() => t.hidden = true, 2500); };

/* ---------- data ---------- */
async function load() {
  if (sb) {
    const { data: rows, error } = await sb.from("rooms").select("*");
    if (error) return toast("Could not load data");
    data = {}; rows.forEach(r => data[r.room_no] = r);
  } else { try { data = JSON.parse(localStorage.getItem(LS) || "{}"); } catch { data = {}; } }
}
async function save(no, rec) {
  if (sb) {
    const { error } = rec ? await sb.from("rooms").upsert({ room_no: no, ...rec, updated_at: new Date().toISOString() })
                          : await sb.from("rooms").delete().eq("room_no", no);
    if (error) { toast("Save failed: " + error.message); return false; }
  }
  if (rec) data[no] = { room_no: no, ...rec }; else delete data[no];
  if (!sb) localStorage.setItem(LS, JSON.stringify(data));
  return true;
}

/* ---------- planner ---------- */
function render() {
  const b = window.ROOMS[building]; let total = 0, booked = 0, persons = 0;
  $("#floors").innerHTML = [...b.floors].reverse().map(f => `<h3>${esc(f.label)}</h3><div class="grid">` +
    f.rooms.map(r => { const g = data[r.no]; total++; if (g) { booked++; persons += Number(g.people) || 0; }
      const part = g && g.people < r.cap;
      return `<button class="room ${g ? "booked " + g.side : ""} ${part ? "partial" : ""}" data-no="${esc(r.no)}"><b>${esc(r.no)}</b><small>${g ? esc(label(g.guest_name)) : "Vacant"}</small><i>${g ? g.people + " of " : "Max "}${r.cap}</i></button>`;
    }).join("") + `</div>`).join("");
  $("#summary").innerHTML = `<div><b>${total}</b>Rooms</div><div><b>${total - booked}</b>Vacant</div><div><b>${persons}</b>Persons</div>  `;
  $$("#tabs button").forEach(t => t.classList.toggle("on", t.dataset.b === building));
}
const label = n => { const l = String(n).split(/\n/).map(x => x.trim()).filter(Boolean); return (l[0] || "") + (l.length > 1 ? " +" + (l.length - 1) : ""); };
const findRoom = no => Object.values(window.ROOMS).flatMap(b => b.floors.flatMap(f => f.rooms)).find(r => r.no === no);

function openRoom(no) {
  const r = findRoom(no), g = data[no], sheet = $("#sheet");
  if (!canEdit) {
    sheet.innerHTML = `<h4>Room ${esc(no)}</h4>` + (g
      ? `<p class="names"><b>${esc(g.guest_name)}</b></p><p>${g.people} of ${r.cap} people</p><p>${g.side === "bride" ? "Bride" : "Groom"} side</p>`
      : `<p>Vacant (max ${r.cap} people)</p>`) + `<div class="row"><button class="btn alt" data-x>Close</button></div>`;
  } else {
    sheet.innerHTML = `<h4>Room ${esc(no)}</h4><p>${g ? "Change guest" : "Vacant. Add guest"} (max ${r.cap} people)</p>
      <label for="gn">Guest name(s). One name or family per line</label><textarea id="gn" rows="4">${esc(g?.guest_name)}</textarea>
      <label for="gp">Number of people</label><input id="gp" type="number" min="1" value="${g?.people || 1}" inputmode="numeric">
      <label>Side</label><div class="side">
        <label class="b"><input type="radio" name="side" value="bride" ${g?.side !== "groom" ? "checked" : ""}><span>Bride side</span></label>
        <label class="g"><input type="radio" name="side" value="groom" ${g?.side === "groom" ? "checked" : ""}><span>Groom side</span></label></div>
      <p class="note" id="err" hidden></p>
      <div class="row">${g ? `<button class="btn del" data-del>Vacate</button>` : ""}<button class="btn alt" data-x>Cancel</button><button class="btn" data-save>Save</button></div>`;
  }
  $("#modal").hidden = false;
  sheet.onclick = async e => {
    if (e.target.matches("[data-x]")) return closeModal();
    if (e.target.matches("[data-del]")) { if (await save(no, null)) { closeModal(); render(); } }
    if (e.target.matches("[data-save]")) {
      const name = $("#gn").value.trim(), people = parseInt($("#gp").value, 10), side = sheet.querySelector("[name=side]:checked").value, err = $("#err");
      if (!name || !(people > 0)) { err.textContent = "Enter the guest name(s) and number of people."; err.hidden = false; return; }
      if (people > r.cap && !confirm(`This room fits ${r.cap}. Save ${people} people anyway?`)) return;
      if (await save(no, { guest_name: name, people, side })) { closeModal(); render(); }
    }
  };
}
const closeModal = () => { $("#modal").hidden = true; };
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });
$("#floors").addEventListener("click", e => { const b = e.target.closest(".room"); if (b) openRoom(b.dataset.no); });
$("#tabs").addEventListener("click", e => { if (e.target.dataset.b) { building = e.target.dataset.b; render(); window.scrollTo(0, 0); } });

/* ---------- owner login (shared mode only) ---------- */
function openLogin() {
  const sheet = $("#sheet");
  sheet.innerHTML = loggedIn
    ? `<h4>Editing is on</h4><p>You are signed in as the owner.</p><div class="row"><button class="btn alt" data-x>Close</button><button class="btn" data-out>Sign out</button></div>`
    : `<h4>Owner login</h4><p>Sign in to edit rooms. Others can only view.</p>
       <label for="em">Email</label><input id="em" type="email" autocomplete="username">
       <label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password">
       <p class="note" id="err" hidden></p><div class="row"><button class="btn alt" data-x>Cancel</button><button class="btn" data-in>Sign in</button></div>`;
  $("#modal").hidden = false;
  sheet.onclick = async e => {
    if (e.target.matches("[data-x]")) closeModal();
    if (e.target.matches("[data-out]")) { await sb.auth.signOut(); setAuth(false); closeModal(); }
    if (e.target.matches("[data-in]")) {
      const { error } = await sb.auth.signInWithPassword({ email: $("#em").value.trim(), password: $("#pw").value });
      if (error) { $("#err").textContent = error.message; $("#err").hidden = false; return; }
      setAuth(true); closeModal(); toast("Editing enabled");
    }
  };
}
function setAuth(on) { loggedIn = on; canEdit = on; $("#lockBtn").textContent = on ? "🔓" : "🔒"; }
if (sb) {
  $("#lockBtn").hidden = false; $("#lockBtn").onclick = openLogin;
  sb.auth.getSession().then(({ data: { session } }) => setAuth(!!session));
}

/* ---------- menu + routing ---------- */
const drawer = (on) => { $("#drawer").classList.toggle("on", on); $("#scrim").classList.toggle("on", on); };
$("#menuBtn").onclick = () => drawer(true);
$("#scrim").onclick = () => drawer(false);
$$("[data-close]").forEach(a => a.addEventListener("click", () => drawer(false)));

const vid = $("#vid");
function startVideo() { vid.muted = false; return vid.play(); }
$("#enter").onclick = () => { startVideo().then(() => $("#enter").hidden = true).catch(() => { vid.muted = true; vid.play(); $("#enter").hidden = true; }); };

async function route() {
  const page = location.hash === "#planner" ? "planner" : "home";
  $("#home").hidden = page !== "home"; $("#planner").hidden = page !== "planner"; $("#tabs").hidden = page !== "planner";
  if (page === "home") { startVideo().catch(() => { $("#enter").hidden = false; }); }
  else { vid.pause(); await load(); render(); }
}
window.addEventListener("hashchange", route);
// Viewers: refresh shared data every 30 seconds and when the tab becomes visible again.
const refresh = async () => { if (sb && location.hash === "#planner" && $("#modal").hidden) { await load(); render(); } };
setInterval(refresh, 30000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
route();
})();
