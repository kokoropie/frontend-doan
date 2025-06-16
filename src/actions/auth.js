import { deleteSession, createSession } from '@/lib/session'

export async function login({ token, refreshToken }) {
  await createSession('token', token)
  await createSession('refreshToken', refreshToken)
  redirect('/app')
}

export async function logout() {
  deleteSession(['token', 'refreshToken'])
  redirect('/login')
}