import 'server-only'
import { cookies } from 'next/headers'

export async function createSessions(keyValue) {
  Object.keys(keyValue).forEach(key => {
    createSession(key, keyValue[key])
  })
}

export async function createSession(key, value) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
 
  cookieStore.set(key, value, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(keys) {
  const cookieStore = await cookies()
  if (!Array.isArray(keys)) {
    keys = [keys]
  }
  keys.forEach(key => {
    cookieStore.delete(key)
  })
}