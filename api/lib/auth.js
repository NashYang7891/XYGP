import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'stock_jwt_secret_2025'

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}
