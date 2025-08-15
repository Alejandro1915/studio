# Manual Técnico de Animuizu

## 1. Descripción General

Animuizu es una aplicación web de trivia de anime en tiempo real que permite a los usuarios competir en partidas públicas, desafiar a amigos en duelos privados y ascender en una clasificación global. La aplicación está diseñada para ser escalable, interactiva y fácil de administrar.

### 1.1. Pila Tecnológica

-   **Framework Frontend**: [Next.js](https://nextjs.org/) (con React y TypeScript)
-   **Componentes UI**: [ShadCN UI](https://ui.shadcn.com/) y [Tailwind CSS](https://tailwindcss.com/)
-   **Backend y Base de Datos**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
-   **Funcionalidad de IA**: [Genkit (integrado en Firebase)](https://firebase.google.com/docs/genkit)
-   **Hosting**: [Firebase App Hosting](https://firebase.google.com/docs/hosting)

## 2. Arquitectura de la Aplicación

La aplicación sigue una arquitectura moderna basada en componentes, aprovechando las características de Next.js como el App Router y los Server Components.

-   **Frontend (Cliente)**: Construido con React y Next.js. Se encarga de la renderización de la interfaz de usuario, la gestión del estado local y la interacción con los servicios de backend. Los componentes de ShadCN UI proporcionan un sistema de diseño coherente y accesible.
-   **Backend (Servicios de Firebase)**:
    -   **Firebase Authentication**: Gestiona el registro, inicio de sesión (correo/contraseña y Google) y las sesiones de usuario.
    -   **Firestore**: Actúa como la base de datos NoSQL en tiempo real para almacenar toda la información de la aplicación, incluyendo usuarios, preguntas, partidas y notificaciones.
-   **IA (Genkit)**: Un flujo de Genkit se ejecuta en el lado del servidor para generar contenido (preguntas de trivia) basado en las peticiones del panel de administración.

![Diagrama de Arquitectura](https://placehold.co/800x450.png?text=Diagrama+de+Arquitectura)
*<p align="center" data-ai-hint="application architecture diagram">Diagrama simplificado de la arquitectura de Animuizu.</p>*

---

## 3. Estructura del Proyecto

El proyecto está organizado siguiendo las convenciones de Next.js para facilitar la navegación y la mantenibilidad.

```
/
├── src/
│   ├── app/                # App Router: páginas y layouts de la aplicación.
│   │   ├── (auth)/         # Rutas de autenticación.
│   │   ├── admin/          # Panel de administración (ruta protegida).
│   │   ├── dashboard/      # Lobby principal del juego.
│   │   ├── game/[gameId]/  # Sala de juego (espera, quiz, resumen).
│   │   ├── leaderboard/    # Página de clasificación.
│   │   ├── profile/        # Perfiles de usuario (público y edición).
│   │   └── layout.tsx      # Layout principal de la aplicación.
│   │
│   ├── components/         # Componentes reutilizables de React.
│   │   ├── admin/          # Componentes para el panel de administración.
│   │   ├── auth/           # Componentes de autenticación y perfil.
│   │   ├── game/           # Componentes relacionados con el juego.
│   │   ├── layout/         # Componentes de la estructura (Header, etc.).
│   │   └── ui/             # Componentes base de ShadCN (Button, Card, etc.).
│   │
│   ├── hooks/              # Hooks personalizados de React.
│   │   ├── use-auth.tsx    # Hook central para la gestión de la autenticación y el usuario.
│   │   └── use-toast.tsx   # Hook para mostrar notificaciones (toasts).
│   │
│   ├── lib/                # Utilidades y configuración.
│   │   ├── achievements.ts # Definición de los logros.
│   │   ├── firebase.ts     # Configuración e inicialización de Firebase.
│   │   └── utils.ts        # Funciones de utilidad (ej. cn para clases de Tailwind).
│   │
│   └── ai/                 # Lógica de Inteligencia Artificial con Genkit.
│       ├── flows/          # Flujos de Genkit.
│       └── genkit.ts       # Configuración global de Genkit.
│
├── public/                 # Archivos estáticos.
├── firestore.rules         # Reglas de seguridad de Firestore.
├── next.config.ts          # Configuración de Next.js.
└── tailwind.config.ts      # Configuración de Tailwind CSS.
```

---

## 4. Sistemas Fundamentales (Análisis Detallado)

### 4.1. Sistema de Autenticación

-   **Hook `useAuth`**: Es el núcleo de la autenticación en el cliente. Proporciona el estado del usuario actual (`user`, `loading`), métodos para `login`, `signup`, `logout`, y la lógica para sincronizar el estado de Firebase Auth con los datos del perfil de usuario en Firestore.
-   **Sincronización de Datos**: Al iniciar sesión, `useAuth` obtiene los datos del usuario de la colección `users` de Firestore y los combina con la información de Firebase Auth para crear un objeto de usuario unificado.
-   **Protección de Rutas**: El hook redirige a los usuarios no autenticados a la página de login y protege el panel de administración para que solo los usuarios con el rol `admin` puedan acceder.

### 4.2. Lógica de Juego y Estados

El flujo de una partida se gestiona a través de la colección `games` en Firestore y el estado del documento de la partida actual.

-   **Estados de la Partida**:
    1.  `waiting`: La partida ha sido creada (generalmente en un duelo 1vs1), y está esperando a que se unan los jugadores. En este estado, la sala de espera (`WaitingRoom.tsx`) está activa.
    2.  `in-progress`: El anfitrión ha iniciado el juego. El componente `QuizArea.tsx` se renderiza, presentando las preguntas y gestionando el tiempo y las respuestas.
    3.  `finished`: La partida ha terminado. El componente `MatchSummary.tsx` se muestra con los resultados.
-   **Modos de Juego**:
    -   **Público/Aleatorio (`/game/random?difficulty=...`)**: No crea un documento de partida persistente. Las preguntas se cargan directamente en el cliente, y la puntuación se envía a la página de resumen a través de parámetros de URL.
    -   **Supervivencia (`/game/survival`)**: Similar al modo público, pero con una lógica de vidas y carga progresiva de preguntas.
    -   **Privado (Duelo 1vs1)**: Utiliza un documento de partida en Firestore para sincronizar el estado entre los dos jugadores en tiempo real.

### 4.3. Sistema de Invitaciones a Duelos

Este sistema permite a un usuario desafiar a otro directamente.

1.  **Búsqueda y Envío**:
    -   El usuario A abre el diálogo `InviteFriendDialog.tsx`.
    -   Busca al usuario B por su apodo. La búsqueda consulta la colección `users`.
    -   Al hacer clic en "Invitar", se ejecutan dos acciones en la base de datos:
        1.  Se crea un **nuevo documento de partida** en la colección `games` con el estado `waiting` y el usuario A como anfitrión.
        2.  Se crea un **nuevo documento de invitación** en la colección `invitations`, especificando `fromUid` (usuario A) y `toUid` (usuario B).
2.  **Recepción y Respuesta**:
    -   El componente `UserNav.tsx` del usuario B tiene un *listener* en tiempo real (`onSnapshot`) en la colección `invitations`.
    -   Cuando detecta una nueva invitación, muestra una notificación visual.
    -   Al aceptar, el `uid` del usuario B se añade al array `players` del documento de la partida, y el usuario es redirigido a la sala de espera. La invitación se elimina.
    -   Al rechazar, el documento de la invitación simplemente se elimina.

### 4.4. Generación de Preguntas con IA

-   **Ubicación**: `src/ai/flows/generate-question-flow.ts`.
-   **Activación**: Desde el panel de administración (`QuestionManagement.tsx`), un administrador introduce un tema de anime.
-   **Proceso**:
    1.  El cliente llama a la función `generateQuestion` con el tema.
    2.  Esta función invoca a un flujo de Genkit (`generateQuestionFlow`).
    3.  El flujo utiliza un *prompt* predefinido que instruye al modelo de lenguaje (LLM) para que actúe como un experto en trivia y genere una pregunta, cuatro opciones, la respuesta correcta y una dificultad, todo en formato JSON estructurado.
    4.  El resultado se devuelve al cliente y rellena automáticamente el formulario de creación de preguntas.

---

## 5. Esquema de la Base de Datos (Firestore)

### Colección `users`

Almacena la información del perfil de cada usuario registrado. El ID del documento es el `uid` de Firebase Auth.

-   `name` (string): Apodo único del usuario.
-   `email` (string): Correo electrónico.
-   `photoURL` (string, opcional): URL de la imagen de perfil.
-   `role` (string): Rol del usuario (`user` o `admin`).
-   `score` (number): Puntuación global total.
-   `score_easy` / `score_normal` / `score_hard` / `score_survival` (number): Puntuaciones por modo de juego.
-   `unlockedAchievements` (array<string>): IDs de los logros desbloqueados.

### Colección `questions`

Contiene todas las preguntas de trivia de la aplicación.

-   `question` (string): El texto de la pregunta.
-   `options` (array<string>): Array con las 4 opciones de respuesta.
-   `answer` (string): La respuesta correcta (debe coincidir con una de las opciones).
-   `difficulty` (string): `Fácil`, `Normal` o `Difícil`.
-   `image` (string, opcional): URL de una imagen relacionada con la pregunta.

### Colección `games`

Almacena el estado de las partidas privadas (1vs1) en tiempo real.

-   `hostId` (string): `uid` del jugador que creó la partida.
-   `players` (array<map>): Lista de jugadores en la partida.
    -   `uid` (string)
    -   `name` (string)
    -   `photoURL` (string)
    -   `score` (number)
-   `status` (string): `waiting`, `in-progress` o `finished`.
-   `questions` (array<map>, opcional): La lista de preguntas para esta partida.
-   `currentQuestionIndex` (number, opcional): Índice de la pregunta actual.
-   `scores` (map, opcional): Puntuaciones de los jugadores (`{ uid: score }`).
-   `createdAt` (timestamp): Fecha de creación de la partida.

### Colección `invitations`

Gestiona las invitaciones a duelos en tiempo real.

-   `fromUid` (string): `uid` del remitente.
-   `fromName` (string): Apodo del remitente.
-   `toUid` (string): `uid` del destinatario.
-   `gameId` (string): ID del documento de la partida en la colección `games`.
-   `status` (string): Siempre `pending`. El documento se elimina al ser aceptado o rechazado.
-   `createdAt` (timestamp): Fecha de envío de la invitación.

---

## 6. Configuración y Desarrollo Local

1.  **Clonar el Repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd animuizu
    ```
2.  **Instalar Dependencias**:
    ```bash
    npm install
    ```
3.  **Configurar Firebase**:
    -   Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    -   Activa **Authentication** (con proveedores de Email/Contraseña y Google) y **Firestore**.
    -   Obtén la configuración de tu aplicación web de Firebase y pégala en `src/lib/firebase.ts`.
    -   Pega el contenido de tus reglas de seguridad (`firestore.rules`) en la pestaña de Reglas de Firestore en la consola.
4.  **Ejecutar la Aplicación**:
    -   Para la aplicación Next.js:
        ```bash
        npm run dev
        ```
    -   Para el servidor de desarrollo de Genkit (en otra terminal):
        ```bash
        npm run genkit:dev
        ```
    -   Abre `http://localhost:9002` en tu navegador.

## 7. Despliegue

La aplicación está configurada para desplegarse fácilmente en **Firebase App Hosting**. El archivo `apphosting.yaml` contiene la configuración básica para el despliegue. Sigue la guía oficial de Firebase para conectar tu repositorio de GitHub y configurar el despliegue automático.
