Perfecto, este código es *ideal* para hacerles un mini-manual a los alumnos 💻
Te lo voy a desmenuzar en bloques con tres ideas claras:

* **¿Qué hace?**
* **¿Por qué es necesario?**
* **¿Qué se podría quitar en una versión más simple?**

Voy marcando con:

* ✅ **Esencial** → sin esto, el login/registro NO funciona.
* ⭐ **Recomendable** → mejora la experiencia, pero se puede quitar.
* 🧩 **Opcional/didáctico** → útil para aprender, pero no imprescindible.

---

## 1. Estado global de la app

```js
let estado = {
  usuario: null,   // { id, nombre, email }
  token: null      // string con el JWT
};
```

### ¿Qué hace?

Guarda en un solo objeto la información clave de la sesión:

* `usuario`: quién está conectado (o `null` si nadie).
* `token`: el JWT que nos ha dado el backend al hacer login/registro.

### ¿Por qué es necesario?

✅ Necesitamos **recordar en memoria** quién es el usuario y su token para:

* mostrar cosas distintas en la interfaz (mostrar login o “Hola, Elena”)
* poder enviar el token en futuras peticiones protegidas (pedidos, perfil, etc.)

Tenerlo en un objeto `estado` lo hace muy comprensible: *“aquí vive el cerebro de la sesión”*.

### ¿Qué se podría quitar?

🤏 Podrías **no usar el objeto `estado`** y tener dos variables sueltas:

```js
let usuario = null;
let token = null;
```

Funciona igual, pero enseñarles `estado` ayuda a introducir la idea de “estado global de la app”, muy útil para React, Vue, etc. ➜ ⭐ Recomendable mantenerlo.

---

## 2. Guardar, cargar y borrar sesión (localStorage)

```js
function guardarSesion(token, usuario) { ... }
function cerrarSesion() { ... }
function cargarSesionGuardada() { ... }
```

### 2.1 `guardarSesion(token, usuario)`

```js
function guardarSesion(token, usuario) {
  estado.token = token;
  estado.usuario = usuario;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(usuario));

  console.log('💾 Sesión guardada para:', usuario.nombre);
}
```

#### ¿Qué hace?

* Actualiza el `estado` en memoria.
* Guarda también los datos en `localStorage` para que **persistan aunque se cierre el navegador**.

#### ¿Por qué es necesario?

* ✅ Para que el resto del código sepa quién está logueado (**estado**).
* ⭐ Para que al recargar la página el usuario siga logueado (**localStorage**).

Si solo quisieras que la sesión dure mientras la pestaña está abierta, podrías quitar lo de `localStorage`.

#### ¿Qué se podría quitar?

En una versión ultra-simple de clase:

```js
function guardarSesion(token, usuario) {
  estado.token = token;
  estado.usuario = usuario;
}
```

Sin `localStorage`. El login funcionaría, pero al recargar el navegador se pierde la sesión.

---

### 2.2 `cerrarSesion()`

```js
function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  console.log('👋 Sesión cerrada');
  mostrarInterfaz();
}
```

#### ¿Qué hace?

* Limpia los datos de `estado`.
* Borra también los datos almacenados en el navegador.
* Llama a `mostrarInterfaz()` para refrescar la pantalla y volver a enseñar el login.

#### ¿Por qué es necesario?

✅ *Alguna forma* de “borrar sesión” es imprescindible si hay logout.
Si no limpias `estado.usuario`, la web pensará que el usuario sigue dentro.

#### ¿Qué se podría quitar?

* Si no quisieras persistencia, puedes quitar las líneas de `localStorage`.
* También podrías no llamar a `mostrarInterfaz()`, pero entonces la pantalla no reflejaría el cierre de sesión hasta recargar.

---

### 2.3 `cargarSesionGuardada()`

```js
function cargarSesionGuardada() {
  const tokenGuardado = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('user');

  if (tokenGuardado && usuarioGuardado) {
    try {
      estado.token = tokenGuardado;
      estado.usuario = JSON.parse(usuarioGuardado);
      console.log('👤 Sesión restaurada:', estado.usuario.nombre);
    } catch (err) {
      console.error('❌ Sesión corrupta, limpiando...', err);
      cerrarSesion();
    }
  }
}
```

#### ¿Qué hace?

* Al cargar la página, mira si había `token` y `user` guardados.
* Si existen, los mete de nuevo en `estado` (restaura la sesión).
* Si hay algo raro, llama a `cerrarSesion()`.

#### ¿Por qué es necesario?

⭐ No es imprescindible para que login/registro funcionen, pero:

* Mejora muchísimo la experiencia: el usuario no tiene que loguearse cada vez.
* Es una oportunidad muy buena para explicar **localStorage + JSON.parse**.

#### ¿Qué se podría quitar?

En un mini-ejemplo de clase se puede omitir completamente.
Funcionarían login y registro, pero al recargar se olvida todo.

---

## 3. Funciones de comunicación con el backend

### 3.1 `iniciarSesion(email, password)`

```js
async function iniciarSesion(email, password) {
  try {
    const respuesta = await fetch(`${URL_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const datos = await respuesta.json();
    console.log('📥 Respuesta login:', respuesta.status, datos);

    if (respuesta.ok) {
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`Bienvenido, ${datos.usuario.nombre}`);
    } else {
      alert(datos.message || 'Error al iniciar sesión');
    }
  } catch (error) {
    console.error('❌ Error login:', error);
    alert('No se pudo conectar con el servidor');
  }
}
```

#### ¿Qué hace?

* Llama al endpoint `/auth/login` del backend con `email` y `password`.
* Si el servidor responde 200:

  * Llama a `guardarSesion(...)`.
  * Actualiza la interfaz.
  * Muestra un mensaje de bienvenida.
* Si responde con error, enseña el mensaje.

#### ¿Por qué es necesario?

✅ Es la función que **conecta el formulario de login con el backend**.
Sin ella no hay login.

#### ¿Qué se podría simplificar?

* Quitar logs (`console.log`) ➜ solo son didácticos.
* Quitar el `alert` y solo hacer `guardarSesion + mostrarInterfaz`.

Una versión ultra-mínima:

```js
async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${URL_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const datos = await respuesta.json();

  if (respuesta.ok) {
    guardarSesion(datos.token, datos.usuario);
    mostrarInterfaz();
  } else {
    alert('Login incorrecto');
  }
}
```

---

### 3.2 `registrarUsuario(nombre, email, password)`

```js
async function registrarUsuario(nombre, email, password) {
  try {
    const respuesta = await fetch(`${URL_API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const datos = await respuesta.json();
    console.log('📥 Respuesta registro:', respuesta.status, datos);

    if (respuesta.ok) {
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`Cuenta creada. Bienvenido, ${datos.usuario.nombre}`);
    } else {
      alert(datos.message || 'Error al registrarse');
    }
  } catch (error) {
    console.error('❌ Error registro:', error);
    alert('No se pudo conectar con el servidor');
  }
}
```

#### ¿Qué hace?

* Llama al endpoint `/auth/register` enviando nombre, email y password.
* Si el registro es correcto, **directamente loguea al usuario** (misma lógica que login).
* Si hay problema, muestra error.

#### ¿Por qué es necesario?

✅ Es la pieza que permite **crear nuevos usuarios** desde el frontend.

#### ¿Qué se podría simplificar?

Igual que antes: menos logs y mensajes, pero la estructura básica (fetch → comprobar `ok` → `guardarSesion`) es esencial.

---

## 4. Pintar la interfaz según si hay usuario o no

### `mostrarInterfaz()`

```js
function mostrarInterfaz() {
  const authSection = document.getElementById('authSection');
  const authNav     = document.getElementById('authNav');

  const logged = !!estado.usuario;

  // Formulario login/registro
  if (authSection) {
    if (logged) {
      authSection.classList.add('hidden');
    } else {
      authSection.classList.remove('hidden');
    }
  }

  // Zona de navegación (opcional)
  if (authNav) {
    if (logged) {
      authNav.innerHTML = `
        <span class="user-name">👤 ${estado.usuario.nombre}</span>
        <button id="logoutButton" class="btn btn-outline">Cerrar sesión</button>
      `;
      document.getElementById('logoutButton')
        .addEventListener('click', cerrarSesion);
    } else {
      authNav.innerHTML = `<span>Inicia sesión para comprar</span>`;
    }
  }
}
```

#### ¿Qué hace?

* Mira si hay usuario en `estado`.
* Si hay usuario:

  * Oculta el bloque de formularios (`authSection`).
  * Rellena la barra de navegación con “👤 Nombre” + botón “Cerrar sesión”.
* Si NO hay usuario:

  * Muestra el login/registro.
  * Muestra un mensaje neutro en `authNav`.

#### ¿Por qué es necesario?

⭐ No es estrictamente necesario para que “exista” login, pero:

* Da feedback visual al usuario: sabe que ha iniciado sesión.
* Permite tener un botón de cerrar sesión.
* Enseña un patrón muy típico: *“la UI depende del estado”*.

#### ¿Qué se podría quitar?

En un mini-ejemplo lo más básico sería solo:

* No ocultar/mostrar nada, simplemente hacer un `console.log` al loguearse.

Pero entonces no habría sensación de “sesión iniciada”, así que didácticamente merece la pena mantener la parte de `authSection`.
`authNav` sí es más opcional.

---

## 5. Conectar el HTML con el JS: `configurarEventosLogin()`

```js
function configurarEventosLogin() {
  const loginForm    = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  const showRegister = document.getElementById('showRegister');
  const showLogin    = document.getElementById('showLogin');

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      await iniciarSesion(email, password);
      loginForm.reset();
    });
  }

  // REGISTRO
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre   = document.getElementById('registerNombre').value;
      const email    = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      await registrarUsuario(nombre, email, password);
      registerForm.reset();
    });
  }

  // Cambiar de login → registro
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
    });
  }

  // Cambiar de registro → login
  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
    });
  }
}
```

#### ¿Qué hace?

* Escucha el **submit** de los formularios:

  * impide que se recargue la página (`e.preventDefault()`),
  * llama a `iniciarSesion(...)` o `registrarUsuario(...)`,
  * limpia los campos (`reset()`).
* Maneja los enlaces “Regístrate aquí” / “Inicia sesión aquí” para mostrar un formulario u otro.

#### ¿Por qué es necesario?

✅ Sin estos listeners nada llama a `iniciarSesion` ni `registrarUsuario`.
El usuario rellenaría el formulario, pero no pasaría nada.

#### ¿Qué se podría quitar?

* Quitar el `reset()` (los campos quedarían rellenos).
* Quitar la parte de alternar formularios si decides mostrar login y registro siempre a la vez, uno debajo de otro.

Por ejemplo, versión súper mínima:

```js
function configurarEventosLogin() {
  const loginForm    = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      await iniciarSesion(email, password);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre   = document.getElementById('registerNombre').value;
      const email    = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      await registrarUsuario(nombre, email, password);
    });
  }
}
```

---

## 6. Punto de entrada: `DOMContentLoaded`

```js
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App de login/registro lista');
  cargarSesionGuardada();   // opcional, pero bonito para recordar al usuario
  configurarEventosLogin();
  mostrarInterfaz();
});
```

### ¿Qué hace?

* Espera a que el HTML esté cargado.
* Intenta restaurar sesión (si la hubiera).
* Conecta los eventos de los formularios.
* Pinta la interfaz correcta según si hay usuario o no.

### ¿Por qué es necesario?

✅ Necesitas alguna forma de:

1. Asegurar que los elementos del DOM ya existen antes de hacer `getElementById`.
2. Llamar una vez a `configurarEventosLogin()` y `mostrarInterfaz()`.

### ¿Qué se podría quitar?

* Quitar el `cargarSesionGuardada()` si no quieres persistencia.
* En teoría podrías no usar `DOMContentLoaded` si pones el `<script>` al final del `<body>`, pero es una buena práctica enseñar ese patrón.

---

## Resumen 

> **Para tener login + registro en el front hacen falta 4 ideas:**
>
> 1. **Estado** → dónde guardo quién soy (`estado.usuario`) y mi token (`estado.token`).
> 2. **Funciones que hablan con el backend** → `iniciarSesion` y `registrarUsuario`.
> 3. **Funciones de sesión** → `guardarSesion`, `cerrarSesion` (y opcional `cargarSesionGuardada`).
> 4. **Conectar HTML con JS** → escuchar los `submit` de los formularios y llamar a esas funciones, y luego actualizar la interfaz con `mostrarInterfaz`.

// ==========================================
// 🌐 CONFIGURACIÓN BÁSICA
// ==========================================

// ✅ Esencial: URL de tu API (backend)
const URL_API = "http://localhost:3000/api";

// ✅ Esencial: estado mínimo de la sesión
let estado = {
  usuario: null,   // { id, nombre, email }
  token: null      // string con el JWT
};

// ==========================================
// 💾 GESTIÓN DE SESIÓN
// ==========================================

// ✅ Esencial: guardar sesión en memoria
// ⭐ Recomendable: también en localStorage
function guardarSesion(token, usuario) {
  // Guardar en memoria
  estado.token = token;
  estado.usuario = usuario;

  // ⭐ Guardar en el navegador (para recordar al usuario)
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(usuario));
}

// ⭐ Recomendable: permitir cerrar sesión
function cerrarSesion() {
  estado.token = null;
  estado.usuario = null;

  localStorage.removeItem('token');
  localStorage.removeItem('user');

  mostrarInterfaz();
}

// 🧩 Opcional: restaurar sesión al recargar la página
function cargarSesionGuardada() {
  const tokenGuardado = localStorage.getItem('token');
  const usuarioGuardado = localStorage.getItem('user');

  if (tokenGuardado && usuarioGuardado) {
    try {
      estado.token = tokenGuardado;
      estado.usuario = JSON.parse(usuarioGuardado);
    } catch (err) {
      cerrarSesion();
    }
  }
}

// ==========================================
// 🔐 FUNCIONES DE AUTENTICACIÓN
// ==========================================

// ✅ Esencial: LOGIN → llama a /auth/login y guarda sesión
async function iniciarSesion(email, password) {
  const respuesta = await fetch(`${URL_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const datos = await respuesta.json();
  console.log('📥 Respuesta login:', respuesta.status, datos);

  if (respuesta.ok) {
    guardarSesion(datos.token, datos.usuario);
    mostrarInterfaz();
    alert(`Bienvenido, ${datos.usuario.nombre}`); // ⭐ Recomendable (feedback)
  } else {
    alert(datos.message || 'Error al iniciar sesión'); // ⭐
  }
}

// ✅ Esencial: REGISTRO → llama a /auth/register y guarda sesión
async function registrarUsuario(nombre, email, password) {
  const respuesta = await fetch(`${URL_API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password })
  });

  const datos = await respuesta.json();
  console.log('📥 Respuesta registro:', respuesta.status, datos);

  if (respuesta.ok) {
    guardarSesion(datos.token, datos.usuario);
    mostrarInterfaz();
    alert(`Cuenta creada. Bienvenido, ${datos.usuario.nombre}`); // ⭐
  } else {
    alert(datos.message || 'Error al registrarse'); // ⭐
  }
}

// ==========================================
// 🎨 INTERFAZ SEGÚN SI HAY USUARIO
// ==========================================

// ⭐ Recomendable: mostrar/ocultar cosas según si hay usuario
function mostrarInterfaz() {
  const authSection = document.getElementById('authSection');
  const authNav     = document.getElementById('authNav'); // si existe

  const logged = !!estado.usuario;

  // Formularios de login/registro
  if (authSection) {
    authSection.classList.toggle('hidden', logged);
  }

  // Barra de navegación (texto + botón logout)
  if (authNav) {
    if (logged) {
      authNav.innerHTML = `
        <span class="user-name">👤 ${estado.usuario.nombre}</span>
        <button id="logoutButton" class="btn btn-outline">Cerrar sesión</button>
      `;
      document
        .getElementById('logoutButton')
        .addEventListener('click', cerrarSesion);
    } else {
      authNav.innerHTML = `<span>Inicia sesión para comprar</span>`;
    }
  }
}

// ==========================================
// 🎛️ CONEXIÓN FORMULARIOS ↔ FUNCIONES
// ==========================================

// ✅ Esencial: enganchar los formularios con iniciarSesion / registrarUsuario
function configurarEventosLogin() {
  const loginForm    = document.getElementById('loginFormElement');
  const registerForm = document.getElementById('registerFormElement');
  const showRegister = document.getElementById('showRegister');
  const showLogin    = document.getElementById('showLogin');

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      await iniciarSesion(email, password);
      loginForm.reset(); // ⭐
    });
  }

  // REGISTRO
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre   = document.getElementById('registerNombre').value;
      const email    = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      await registrarUsuario(nombre, email, password);
      registerForm.reset(); // ⭐
    });
  }

  // 🧩 Opcional: alternar visualmente entre login y registro
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
    });
  }

  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerForm').classList.add('hidden');
      document.getElementById('loginForm').classList.remove('hidden');
    });
  }
}

// ==========================================
// 🚀 ARRANQUE
// ==========================================

// ✅ Esencial: esperar a que el HTML esté cargado y arrancar todo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App de login/registro mínima lista');

  cargarSesionGuardada();   // 🧩 Opcional: comentar si no queréis persistencia
  configurarEventosLogin(); // ✅
  mostrarInterfaz();        // ⭐ para ver inmediatamente el estado correcto
});
