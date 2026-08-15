const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur serveur (${res.status})`);
  }
  return res.json();
}

export function fetchCandidates() {
  return fetch(`${BASE}/candidates`).then(handle);
}

export function registerCandidate(fields, photoFile) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v ?? ""));
  if (photoFile) form.append("photo", photoFile);
  return fetch(`${BASE}/candidates`, { method: "POST", body: form }).then(handle);
}

export function voteCandidate(id, { qty, method, phone }) {
  return fetch(`${BASE}/candidates/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty, method, phone }),
  }).then(handle);
}

export function fetchSettings() {
  return fetch(`${BASE}/settings`).then(handle);
}

export function saveSettings(settings, password) {
  return fetch(`${BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": password },
    body: JSON.stringify(settings),
  }).then(handle);
}
