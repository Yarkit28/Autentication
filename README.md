# Auth CRUD — API de Autenticación con JWT

API REST desarrollada en **Node.js** con **ES6 Modules** que implementa registro de usuarios, autenticación mediante **JSON Web Tokens (JWT)** y operaciones CRUD protegidas sobre el perfil del usuario.

> **Autores**
> - **Abraham Yamil Rodea Amador**
> - **Fernando Valencia Vargas**

---

## 📋 Tabla de contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Endpoints](#-endpoints)
- [Seguridad](#-seguridad)
- [Pruebas con Postman](#-pruebas-con-postman)
- [Scripts disponibles](#-scripts-disponibles)
- [Autores](#-autores)
- [Licencia](#-licencia)

---

## 📖 Descripción

Este proyecto implementa un sistema de autenticación basado en **JWT** con almacenamiento en memoria (fácilmente reemplazable por una base de datos real). Incluye:

- Registro de usuarios con **contraseña hasheada** usando `bcryptjs` (salt aleatorio por usuario).
- Login que devuelve un **token firmado con HS256** y expiración configurable.
- Endpoint `/user` protegido por middleware que **valida el token en el header** `Authorization`.
- Operaciones **Update** y **Delete** opcionales sobre el usuario autenticado.

---

## 🛠 Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | ≥ 24 | Runtime con soporte nativo de `--watch` y `--env-file` |
| Express | ^4.21 | Framework HTTP |
| jsonwebtoken | ^9.0 | Firma y verificación de JWT |
| bcryptjs | ^2.4 | Hash de contraseñas con salt |
| Postman | — | Cliente para pruebas de los endpoints |

---

## ✅ Requisitos

- **Node.js ≥ 24.0.0** (verifica con `node -v`)
- **npm ≥ 10**
- (Opcional) **Postman** para probar los endpoints

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd Autentication

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env (ver sección Variables de entorno)

# 4. Arrancar en modo desarrollo
npm run dev
```

El servidor quedará disponible en **`http://localhost:3000`**.

---

## 🔐 Variables de entorno

Crea un archivo **`.env`** en la raíz del proyecto:

```env
PORT=3000
JWT_SECRET=cambia_esto_por_un_secreto_largo_y_aleatorio
JWT_EXPIRES=1h
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `JWT_SECRET` | Clave secreta para firmar JWT (**obligatoria**) | — |
| `JWT_EXPIRES` | Tiempo de expiración del token (formato `vercel/ms`) | `1h` |

> ⚠️ **Nunca subas el archivo `.env` a Git**. Ya está incluido en `.gitignore`.

---

## 📁 Estructura del proyecto

```
Autentication/
├── .env
├── .gitignore
├── package.json
├── README.md
├── postman/
│   └── collections/
│       └── Auth CRUD/
└── src/
    ├── index.js                # Punto de entrada del servidor
    ├── config.js               # Configuración centralizada
    ├── db.js                   # Almacenamiento en memoria
    ├── middleware/
    │   └── auth.js             # Verificación de JWT
    ├── utils/
    │   └── password.js         # Hash + salt con bcryptjs
    └── routes/
        ├── auth.routes.js      # /register y /login
        └── user.routes.js      # /user (GET, PUT, DELETE)
```

---

## 🌐 Endpoints

### 🔓 Públicos

#### `POST /register` — Crear usuario

**Request body:**

```json
{
  "name": "ana",
  "password": "123456",
  "email": "ana@test.com"
}
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "name": "ana",
  "email": "ana@test.com"
}
```

**Errores:**

| Código | Causa |
|---|---|
| `400` | Falta `name`/`password`, `password` < 6 caracteres, o `email` inválido |
| `409` | `name` o `email` ya registrados |

---

#### `POST /login` — Obtener token

**Request body:**

```json
{
  "name": "ana",
  "password": "123456"
}
```

> También acepta `email` en lugar de `name`.

**Response `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**

| Código | Causa |
|---|---|
| `400` | Falta `name`/`email` o `password` |
| `401` | Credenciales inválidas |

---

### 🔒 Protegidos (requieren `Authorization: Bearer <token>`)

#### `GET /user` — Datos del usuario autenticado

**Response `200 OK`:**

```json
{
  "id": 1,
  "name": "ana",
  "email": "ana@test.com",
  "createdAt": "2026-11-03T12:34:56.789Z"
}
```

**Errores:**

| Código | Causa |
|---|---|
| `401` | Token ausente, inválido o expirado |
| `404` | Usuario no encontrado |

---

#### `PUT /user` — Actualizar perfil (opcional)

**Request body** (todos los campos son opcionales):

```json
{
  "name": "ana-mod",
  "email": "nuevo@test.com"
}
```

**Response `200 OK`:** datos actualizados sin `passwordHash`.

---

#### `DELETE /user` — Eliminar cuenta (opcional)

**Response `204 No Content`** sin body.

---

### 🗺️ Resumen de rutas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/register` | ❌ | Crear usuario |
| `POST` | `/login` | ❌ | Obtener JWT |
| `GET` | `/user` | ✅ | Datos del usuario autenticado |
| `PUT` | `/user` | ✅ | Actualizar perfil |
| `DELETE` | `/user` | ✅ | Eliminar cuenta |

---

## 🛡 Seguridad

Decisiones de seguridad aplicadas en el proyecto:

| Aspecto | Implementación |
|---|---|
| **Hash de contraseña** | `bcryptjs` con **12 rondas de salt** (salt aleatorio por usuario) |
| **Comparación de hash** | `bcrypt.compare` (timing-safe) |
| **Firma de JWT** | Algoritmo **HS256** explícito, clave en `.env` |
| **Verificación de JWT** | `algorithms: ['HS256']` para evitar *algorithm confusion* |
| **Errores genéricos** | Login no revela si el usuario existe |
| **No exponer hash** | Se elimina `passwordHash` de todas las respuestas |
| **Expiración** | Tokens expiran según `JWT_EXPIRES` (default `1h`) |
| **Header estándar** | `Authorization: Bearer <token>` |

> 💡 Se utiliza `bcryptjs` (JS puro) en lugar de `bcrypt` (nativo) para evitar problemas de compilación en Windows y dependencias obsoletas con vulnerabilidades conocidas.

---

## 🧪 Pruebas con Postman

El proyecto incluye una colección de Postman en `postman/collections/Auth CRUD/` con los siguientes requests:

1. **Register** — Crea el usuario.
2. **Login** — Guarda automáticamente el token en la variable `{{token}}` mediante un script de Tests.
3. **Get User** — Consulta el perfil.
4. **Update User** — Modifica el perfil.
5. **Delete User** — Elimina la cuenta.

### Importar la colección

1. Abre Postman.
2. **File → Import** → selecciona la carpeta `postman/collections/Auth CRUD`.
3. Configura la variable `baseUrl` en `http://localhost:3000`.
4. Ejecuta los requests **en orden**.

### Flujo de prueba recomendado

```
1. Register      → 201 ✅
2. Login         → 200 + token guardado ✅
3. Get User      → 200 (sin passwordHash) ✅
4. Update User   → 200 (datos actualizados) ✅
5. Delete User   → 204 ✅
6. Get User      → 404 (usuario eliminado) ✅
```

---

## 📜 Scripts disponibles

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con **reinicio automático** (`node --watch`) y carga del `.env` |
| `npm start` | Servidor en modo producción |

> Aprovecha las funcionalidades nativas de Node 24: **`--watch`** (recarga automática) y **`--env-file`** (carga del `.env` sin `dotenv`). Sin dependencias de desarrollo.

---

## 👥 Autores

- **Abraham Yamil Rodea Amador**
- **Fernando Valencia Vargas**

---

## 📄 Licencia

Este proyecto se distribuye con fines académicos y de práctica. Uso libre citando a los autores.