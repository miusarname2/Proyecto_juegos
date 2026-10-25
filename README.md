# 🎮 AI Hand-Tracking Cognitive Suite
### Evaluación Psicomotora y Cognitiva en Tiempo Real con Visión por Computadora

![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands_AI-ff6f00?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)
![Institution](https://img.shields.io/badge/UCC-Ingenier%C3%ADa_de_Sistemas-blue?style=for-the-badge)

Este repositorio contiene una suite interactiva unificada que integra dos minijuegos de evaluación cognitiva y psicomotora controlados mediante la yema del dedo índice, utilizando modelos de visión por computadora basados en redes neuronales de **Google MediaPipe Hands**.

La **versión original y conceptual de los juegos** fue desarrollada por **Royber José Zayas Herrera & Alexandra Parra Díaz** como proyecto para la asignatura **Aplicaciones de la Inteligencia Artificial** (6.º Semestre, Programa de Ingeniería de Sistemas) en la **Universidad Cooperativa de Colombia (UCC)**. Esta **nueva versión unificada y plataforma interactiva (SPA en React 19 + Vite)** es autoría 100% de **Oscar M. Alvarez G.** ([@miusarname2](https://github.com/miusarname2)), diseñada para posibilitar el despliegue productivo en la nube (Vercel/Netlify), navegación fluida mediante un menú centralizado y gestión robusta del ciclo de vida de la cámara web sin alterar las mecánicas originales.

---

## 🌟 Características Principales

- **🏛️ Plataforma Unificada (SPA):** Menú inicial interactivo con selector de juegos, panel de diagnóstico de cámara web en vivo, resumen de récords y navegación fluida sin recargas ni cambios manuales de archivo.
- **👁️ Visión por Computadora con IA (MediaPipe Hands):** Detección y rastreo esquelético de los puntos clave de la mano (*landmarks*) a 30-60 FPS sin necesidad de mandos, teclados ni hardware especializado.
- **⚡ 100% Fidelidad a los Juegos:** Mantiene intactas las físicas, fórmulas de aceleración, sistemas de colisiones, HUD, retroalimentación psicológica y reglas originales.
- **🏆 Persistencia de Récords Locales:** Almacenamiento automático y seguro en el navegador mediante `localStorage` para guardar tablas de líderes (*Top 8*) y mejores puntuaciones históricas.
- **🌐 Despliegue Inmediato:** Preparado para desplegarse con un solo clic en plataformas modernas en la nube como **Vercel**, **Netlify** o **GitHub Pages**, así como en servidores locales mediante Vite.

---

## 🕹️ Descripción de los Juegos

El proyecto evalúa diferentes dimensiones del procesamiento sensorio-motor:

### 1. 🏎️ Finger Racer (Carrera de Reflejos y Supervivencia)
Un juego de conducción y supervivencia a alta velocidad donde el vehículo sigue con precisión la posición horizontal y vertical del dedo índice.

* **Mecánica:** Esquivar obstáculos (conos y rocas) y recolectar monedas estelares (`+50 pts`).
* **Fórmula de Aceleración Dinámica:** La velocidad base incrementa progresivamente con el tiempo de carrera:
  $$\text{Aceleración} = 4 + (\text{Tiempo Transcurrido} \times 0.5)$$
* **Dimensión Cognitiva Evaluada:** Coordinación viso-motora, tiempo de reacción bajo estrés y anticipación espacial ante estímulos rápidos.
* **Evaluación en Tiempo Real y Diagnóstico Final:**
  - Menos de 30s: *Poco Enfoque / Atención Dispersa*
  - Entre 30s y 44s: *Reflejos Promedio*
  - Entre 45s y 74s: *Gran Control Cognitivo*
  - 75s o más: *Por Encima de la Media*

---

### 2. 🎈 Balloon Pop (Discriminación y Control Inhibitorio)
Un desafío visual cronometrado de **90 segundos** enfocado en la precisión selectiva y el autocontrol.

* **Mecánica:** En pantalla aparece una misión de color activo (*Rojo, Azul, Verde, Amarillo o Morado*). El jugador debe reventar con su dedo índice únicamente los globos correspondientes al objetivo (`+10 pts`) y evitar tocar los colores trampa (`-3 pts`).
* **Dinámica Progresiva:** A medida que transcurren los segundos, los globos ascienden a mayor velocidad y emergen con mayor frecuencia.
* **Dimensión Cognitiva Evaluada:**
  - **Atención Selectiva:** Capacidad para focalizarse en un estímulo específico mientras se ignoran distractores concurrentes.
  - **Control Inhibitorio:** Capacidad de frenar la respuesta refleja automática de tocar cualquier estímulo en movimiento.
* **Informe Post-Partida:** Calcula la tasa de precisión global:
  $$\text{Precisión} = \frac{\text{Aciertos Correctos}}{\text{Total de Globos Tocados}} \times 100\%$$

> **Nota Ética y Metodológica:** Los indicadores y resúmenes emitidos corresponden al desempeño lúdico dentro del entorno experimental. No constituyen pruebas psicológicas clínicas ni herramientas diagnósticas formales.

---

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología |
| :--- | :--- |
| **Arquitectura Frontend** | React 19 + Vite 8 (SPA modular) |
| **Diseño y Estilos** | CSS3 Vanilla Glassmorphism (Gradientes oscuros, variables HSL, microinteracciones) |
| **Inteligencia Artificial** | Google MediaPipe Hands (`@mediapipe/hands` & `@mediapipe/camera_utils`) |
| **Renderizado Gráfico** | HTML5 Canvas 2D (Optimizado mediante `requestAnimationFrame`) |
| **Captura de Vídeo** | WebRTC Media Capture API (`getUserMedia`) |
| **Persistencia** | Web Storage API (`localStorage`) |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### Pasos
1. Clona el repositorio:
   ```bash
   git clone https://github.com/miusarname2/Proyecto_juegos.git
   cd Proyecto_juegos
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```

4. Abre en tu navegador la dirección indicada en la consola (usualmente `http://localhost:5173`).
5. **Permisos de Cámara:** Concede los permisos de acceso a la cámara cuando el navegador lo solicite.

---

## ☁️ Despliegue en Producción

El proyecto está listo para ser desplegado en servicios de alojamiento estático:

### Despliegue en Vercel
1. Instala el CLI de Vercel (`npm i -g vercel`) o vincula el repositorio en [vercel.com](https://vercel.com).
2. Configuración de Build predeterminada:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Despliegue en Netlify
1. Conecta el repositorio en [netlify.com](https://netlify.com).
2. Parámetros de publicación:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

> ⚠️ **Importante sobre WebRTC y Seguridad:** Los navegadores exigen un contexto seguro (**HTTPS** o `http://localhost`) para activar la cámara web con `navigator.mediaDevices.getUserMedia`. Al desplegar en Vercel o Netlify, el certificado SSL/HTTPS se genera automáticamente.

---

## 📁 Estructura del Repositorio

```text
Proyecto_juegos/
├── dist/                      # Compilación optimizada para producción
├── Original/                  # Archivos originales de respaldo (Carrito.html y Globitos.html)
│   ├── Carrito.html           # Versión original independiente de Finger Racer
│   └── Globitos.html          # Versión original independiente de Balloon Pop
├── public/                    # Recursos públicos y favicon
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Barra de navegación persistente con botón de retorno al menú
│   │   ├── MainMenu.jsx       # Menú inicial, diagnóstico de cámara y tarjetas de juego
│   │   ├── FingerRacer.jsx    # Componente y motor de Finger Racer (100% fiel al original)
│   │   └── BalloonPop.jsx     # Componente y motor de Balloon Pop (100% fiel al original)
│   ├── App.jsx                # Enrutador y gestor de estado principal
│   ├── index.css              # Sistema de diseño global y temas
│   └── main.jsx               # Punto de entrada de React
├── index.html                 # Plantilla HTML con CDN de MediaPipe Hands
├── package.json               # Dependencias y scripts de Vite
└── README.md                  # Documentación del proyecto
```

---

## 🎓 Créditos y Autoría

* **Institución:** Universidad Cooperativa de Colombia (UCC)
* **Programa Académico:** Ingeniería de Sistemas · 6.º Semestre
* **Asignatura:** Aplicaciones de la Inteligencia Artificial
* **Docente Titular:** Jhon Freddy Linares

### 🚀 Nueva Versión Unificada (100% de Autoría):
- **Oscar M. Alvarez G.** ([@miusarname2](https://github.com/miusarname2))
  - Reingeniería completa y unificación en arquitectura SPA moderna con React 19 y Vite.
  - Diseño del portal principal interactivo, sistema de navegación persistente con retorno seguro al menú y diagnóstico en vivo de cámara web.
  - Gestión integral del ciclo de vida de streams WebRTC y MediaPipe Hands (prevención de fugas de memoria y control de cámara).
  - Optimización de despliegue para Vercel, Netlify y entornos en la nube.

### 🕹️ Autores de la Versión Original (Prototipos Base):
- **Royber José Zayas Herrera** — ID: `911670`
- **Alexandra Parra Díaz** — ID: `914953`
  - Desarrollo de las mecánicas base de colisión, temporizadores, evaluaciones psicológicas originales y prototipos independientes en archivos HTML individuales (`Original/Carrito.html` y `Original/Globitos.html`).

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

*Copyright (c) 2026 Oscar M. Alvarez G. (Nueva Versión Unificada).*  
*Agradecimientos y créditos de la versión conceptual base a Royber José Zayas Herrera & Alexandra Parra Díaz - Universidad Cooperativa de Colombia.*
