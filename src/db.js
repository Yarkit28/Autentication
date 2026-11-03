export const users = new Map();
let nextId = 1;

export const createUser = ({ email, passwordHash }) => {
  if ([...users.values()].some(u => u.email === email)) {
    throw new Error('EMAIL_EXISTS');
  }
  const user = { id: nextId++, email, passwordHash, createdAt: new Date() };
  users.set(user.id, user);
  return user;
};

export const findUserByEmail = (email) =>
  [...users.values()].find(u => u.email === email) || null;

export const findUserById = (id) => users.get(Number(id)) || null;

export const updateUser = (id, data) => {
  const user = users.get(Number(id));
  if (!user) return null;
  const updated = { ...user, ...data };
  users.set(updated.id, updated);
  return updated;
};

export const deleteUser = (id) => users.delete(Number(id));

export const listUsers = () =>
  [...users.values()].map(({ passwordHash, ...u }) => u);