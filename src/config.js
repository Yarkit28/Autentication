if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en el .env');
}

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES || '1h',
};