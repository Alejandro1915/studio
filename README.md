# Animuizu - Batalla de Quiz de Anime

Animuizu es una aplicación de trivia de anime en tiempo real creada con Next.js, Firebase y Genkit. Ha sido diseñada para ofrecer una experiencia de juego competitiva y atractiva, con un conjunto completo de características tanto para jugadores como para administradores.

## Funcionalidades Clave

La plataforma ofrece una experiencia integral que abarca desde la autenticación del usuario hasta la gestión de contenido mediante IA. A continuación se detallan sus funciones y apartados principales:

### 1. Sistema de Autenticación y Perfiles
- **Inicio de Sesión y Registro**: Los usuarios pueden crear una cuenta o iniciar sesión utilizando su correo electrónico y contraseña, o de forma rápida y sencilla a través de su cuenta de Google.
- **Perfiles de Usuario Personalizables**: Cada jugador tiene un perfil donde puede elegir un apodo único y establecer una imagen de perfil a través de una URL. El sistema verifica que los apodos no se repitan para mantener la identidad de cada jugador.

### 2. Sala de Juegos (Dashboard)
Una vez autenticados, los usuarios acceden al `Dashboard`, que funciona como la sala de juegos principal. Desde aquí pueden acceder a todos los modos de juego:
- **Partidas Públicas**: Los jugadores pueden unirse a partidas rápidas, eligiendo entre tres niveles de dificultad:
  - **Fácil**: Ideal para principiantes o para un calentamiento rápido.
  - **Normal**: Un desafío equilibrado para la mayoría de los jugadores.
  - **Difícil**: Preguntas complejas para verdaderos expertos en anime.
- **Desafiar a un Amigo**: Los usuarios pueden crear salas de juego privadas y compartir un enlace de invitación único para competir directamente contra un amigo en un duelo 1 vs 1.

### 3. Experiencia de Juego (Página de Partida)
- **Sala de Espera (Partidas Privadas)**: Antes de comenzar una partida privada, los jugadores entran en una sala de espera donde pueden ver quién se ha conectado mientras esperan al oponente. El anfitrión controla cuándo comienza la partida.
- **Quiz en Tiempo Real**: Durante la partida, se presentan 10 preguntas de opción múltiple. Cada pregunta tiene un temporizador de 15 segundos.
- **Sistema de Puntuación**: Los jugadores ganan puntos por cada respuesta correcta. La cantidad de puntos depende de la rapidez con la que respondan, premiando tanto el conocimiento como la agilidad.
- **Interfaz Interactiva**: Las opciones de respuesta cambian de color instantáneamente para dar feedback visual (verde para la correcta, rojo para la incorrecta), mejorando la experiencia de juego.

### 4. Resumen y Clasificación
- **Resumen de la Partida**: Al finalizar una partida, se muestra una pantalla de resumen con la clasificación final y los puntajes obtenidos por cada jugador en esa ronda.
- **Tabla de Clasificación Global (Leaderboard)**: Todos los puntos ganados en las partidas se suman al puntaje total del usuario. Hay una página de `Leaderboard` donde los jugadores pueden ver su posición en una clasificación global y compararse con los mejores jugadores de Animuizu.

### 5. Panel de Administración
La aplicación cuenta con un robusto panel de administración (`/admin`) accesible solo para usuarios con el rol de "admin". Este panel está dividido en dos secciones principales:
- **Gestión de Usuarios**: Permite a los administradores ver una lista de todos los usuarios registrados en la aplicación, junto con su nombre, correo, foto de perfil y rol.
- **Gestión de Preguntas**:
  - **CRUD de Preguntas**: Los administradores pueden añadir, editar y eliminar preguntas del quiz de forma manual. Cada pregunta incluye el texto, cuatro opciones, la respuesta correcta, una dificultad (Fácil, Normal, Difícil) y una URL de imagen opcional.
  - **Generador de Preguntas con IA**: La característica más potente del panel. Los administradores pueden simplemente introducir un tema de anime (ej: "Dragon Ball Z", "Studio Ghibli") y la IA, impulsada por Genkit, genera automáticamente una nueva pregunta de trivia con sus opciones, respuesta y nivel de dificultad. Esta pregunta rellena el formulario de creación, lista para ser revisada y guardada, agilizando enormemente la creación de nuevo contenido.
