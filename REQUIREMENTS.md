# Requisitos de Animuizu

Este documento detalla los requisitos funcionales y no funcionales de la aplicación de trivia de anime Animuizu.

## 1. Requisitos Funcionales

Los requisitos funcionales describen las funcionalidades específicas que el sistema debe ofrecer.

### 1.1. Autenticación y Gestión de Usuarios
- **RF-001:** Los usuarios deben poder registrarse proporcionando un apodo, una dirección de correo electrónico y una contraseña.
- **RF-002:** El sistema debe verificar que el apodo elegido no esté ya en uso durante el registro.
- **RF-003:** Los usuarios deben poder iniciar sesión utilizando su correo electrónico y contraseña.
- **RF-004:** Los usuarios deben poder iniciar sesión de forma alternativa utilizando su cuenta de Google.
- **RF-005:** Los usuarios autenticados deben poder cerrar sesión en cualquier momento.

### 1.2. Perfiles de Usuario
- **RF-006:** Cada usuario debe tener un perfil público accesible a través de una URL única (`/profile/:userId`).
- **RF-007:** El perfil debe mostrar el apodo, la imagen de perfil, la puntuación total y los logros desbloqueados del usuario.
- **RF-008:** Los usuarios deben poder editar su propio perfil, permitiendo cambiar el apodo y la URL de la imagen de perfil.
- **RF-009:** El sistema debe permitir el acceso a los perfiles de otros jugadores, por ejemplo, desde la tabla de clasificación.

### 1.3. Sistema de Juego
- **RF-010:** Desde el `Dashboard`, los jugadores pueden iniciar una partida pública seleccionando uno de tres niveles de dificultad: Fácil, Normal o Difícil.
- **RF-011:** El sistema debe ofrecer un modo de juego "Supervivencia", donde el jugador responde preguntas hasta que pierde tres vidas.
- **RF-012:** Los usuarios pueden crear una sala de juego privada y compartir un enlace de invitación para competir 1 vs 1.
- **RF-013:** En las partidas privadas, debe existir una sala de espera donde los jugadores se reúnen antes de que el anfitrión inicie el juego.
- **RF-014:** Las partidas consisten en 10 preguntas de opción múltiple (para los modos estándar).
- **RF-015:** Cada pregunta debe tener un temporizador de 15 segundos para ser respondida.
- **RF-016:** El sistema debe otorgar puntos por cada respuesta correcta, con una puntuación mayor cuanto más rápido se responda.
- **RF-017:** La interfaz debe proporcionar feedback visual inmediato (colores verde/rojo) al seleccionar una opción.
- **RF-018:** Al finalizar una partida, se debe mostrar una pantalla de resumen con la clasificación y las puntuaciones de esa ronda.

### 1.4. Sistema de Clasificación (Leaderboard)
- **RF-019:** Debe existir una página de `Leaderboard` que muestre una clasificación de jugadores.
- **RF-020:** La clasificación debe poder filtrarse por modo de juego: Global, Fácil, Normal, Difícil y Supervivencia.
- **RF-021:** Las puntuaciones obtenidas en cada modo de juego deben sumarse tanto a la clasificación de ese modo como a la clasificación global.

### 1.5. Sistema de Logros
- **RF-022:** Los usuarios pueden desbloquear logros basados en su rendimiento en el juego.
- **RF-023:** Cada logro debe tener un nombre, descripción, icono y nivel de rareza (Común, Raro, Épico, Legendario).
- **RF-024:** Los logros desbloqueados deben ser visibles en el perfil del usuario, diferenciándose visualmente de los no desbloqueados.
- **RF-025:** El sistema debe notificar al usuario cuando desbloquea un nuevo logro.

### 1.6. Panel de Administración
- **RF-026:** Debe existir un panel de administración en `/admin`, accesible únicamente para usuarios con el rol de "admin".
- **RF-027:** Los administradores pueden ver una lista de todos los usuarios registrados.
- **RF-028:** Los administradores pueden realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las preguntas del quiz.
- **RF-029:** Los administradores tienen acceso a una herramienta para generar preguntas automáticamente mediante IA, proporcionando un tema de anime.

## 2. Requisitos No Funcionales

Los requisitos no funcionales describen las cualidades y restricciones del sistema.

### 2.1. Rendimiento
- **RNF-001:** Las transiciones de página y la carga inicial de datos deben ser rápidas, idealmente por debajo de los 2 segundos.
- **RNF-002:** La interacción durante el quiz (respuesta, avance a la siguiente pregunta) debe ser fluida y sin latencia perceptible.
- **RNF-003:** La base de datos debe responder eficientemente a las consultas, incluso con un aumento en el número de usuarios y preguntas.

### 2.2. Usabilidad y Experiencia de Usuario (UX)
- **RNF-004:** La interfaz debe ser visualmente atractiva, moderna y coherente con una temática de anime.
- **RNF-005:** El diseño debe ser responsivo, garantizando una experiencia de usuario óptima en dispositivos de escritorio, tabletas y móviles.
- **RNF-006:** La navegación debe ser clara, permitiendo a los usuarios acceder a todas las funcionalidades principales con un mínimo de clics.

### 2.3. Seguridad
- **RNF-007:** Las contraseñas de los usuarios deben ser hasheadas y almacenadas de forma segura.
- **RNF-008:** El acceso a rutas y funcionalidades protegidas (como el panel de administración) debe estar rigurosamente controlado por roles de usuario.
- **RNF-009:** La aplicación debe estar protegida contra vulnerabilidades comunes como XSS (Cross-Site Scripting) y CSRF (Cross-Site Request Forgery).

### 2.4. Escalabilidad
- **RNF-010:** La arquitectura de la aplicación (Next.js y Firebase) debe permitir un crecimiento horizontal para soportar un mayor número de jugadores concurrentes.
- **RNF-011:** El sistema debe ser capaz de gestionar una base de datos de preguntas en constante crecimiento sin degradar el rendimiento de las consultas.

### 2.5. Mantenibilidad
- **RNF-012:** El código fuente debe seguir las mejores prácticas, estar bien estructurado y organizado en componentes reutilizables.
- **RNF-013:** La adición de nuevas funcionalidades (como logros o modos de juego) debe ser modular y no requerir cambios extensos en el código existente.
- **RNF-014:** La documentación, como este archivo y el `README.md`, debe mantenerse actualizada para reflejar el estado actual del proyecto.
