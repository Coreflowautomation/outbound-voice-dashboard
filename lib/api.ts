const API_URL = process.env.API_URL ?? "https://204-168-129-214.sslip.io"
const API_SECRET = process.env.API_SECRET ?? ""

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_SECRET}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error("Token non valido (401)")
    if (res.status === 404) throw new Error("Non trovato (404)")
    throw new Error(`Errore server (${res.status})`)
  }

  return res.json()
}
