export type AuthUser = {
  id: string
  username: string
}

export type RegisterRequest = {
  username: string
  password: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type AuthMeResponse = {
  user: AuthUser
}
