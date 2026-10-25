# Proyecto_juegos
Hand-Tracking Games: Evaluación Cognitiva con IA
Este repositorio contiene dos minijuegos interactivos desarrollados con tecnologías web estándar y visión por computadora. El objetivo de este proyecto académico es evaluar métricas de desempeño psicológico (como el tiempo de reacción, la atención selectiva y el control inhibitorio) procesando los movimientos de las manos del jugador en tiempo real mediante la cámara web.

📖 Descripción de los Juegos
El proyecto se divide en dos módulos independientes, cada uno enfocado en una métrica cognitiva distinta:

1. 🏎️ Finger Racer
Un juego de supervivencia de alta velocidad donde el jugador controla un vehículo utilizando la yema del dedo índice.

Mecánica: Esquivar obstáculos (conos y rocas) y recolectar monedas mientras la velocidad aumenta progresivamente mediante un multiplicador dinámico.

Evaluación Psicológica: Mide la coordinación viso-motora y los reflejos bajo presión. El sistema clasifica el nivel de atención del jugador según el tiempo exacto de supervivencia antes de colisionar.

2. 🎈 Balloon Pop
Un juego de precisión y agilidad visual con un temporizador de 90 segundos.

Mecánica: El jugador recibe una "misión" de color y debe reventar únicamente los globos que coincidan con dicho objetivo usando el dedo índice, evitando los colores trampa.

Evaluación Psicológica: Mide la atención selectiva y el control inhibitorio (capacidad de suprimir impulsos). El sistema penaliza los errores y evalúa la capacidad del cerebro para discriminar estímulos visuales a alta velocidad.

✨ Características Principales
Visión por Computadora: Integración nativa con MediaPipe Hands de Google para el rastreo esquelético de las manos sin necesidad de hardware adicional.

Diagnóstico en Tiempo Real: Algoritmos que calculan y muestran retroalimentación psicológica instantánea en el HUD del jugador.

Persistencia de Datos: Sistema de Leaderboard (Top 8) que guarda automáticamente los récords localmente usando localStorage.

Protección de Autoría: Código fuente asegurado con un sistema de esteganografía que incrusta metadatos invisibles de propiedad intelectual (caracteres de ancho cero).

🛠️ Tecnologías Utilizadas
Frontend: HTML5 (Canvas), CSS3 (Variables, Grid/Flexbox, Animaciones), JavaScript (ES6+).

Inteligencia Artificial: MediaPipe Hands API & Camera Utils.

Protección legal: Script de ofuscación en Python 3 (encabezado.py).

🚀 Instalación y Uso
Debido a las restricciones de seguridad de los navegadores modernos para el uso de la cámara web (getUserMedia), los juegos no funcionarán si simplemente abres el archivo HTML con doble clic (file://).

Clona este repositorio:

Bash
git clone https://github.com/TU-USUARIO/TU-REPOSITORIO.git
Abre la carpeta del proyecto en tu editor de código (por ejemplo, Visual Studio Code).

Instala la extensión Live Server.

Haz clic derecho sobre car_race_mediapipe.html o balloon_pop_mediapipe.html y selecciona "Open with Live Server".

Concede los permisos de cámara en el navegador y comienza a jugar.

🎓 Créditos y Contexto Académico
Desarrollado como proyecto para la asignatura Aplicaciones de la Inteligencia Artificial (6.º Semestre, Programa de Ingeniería de Sistemas).

Desarrolladores:

Royber José Zayas Herrera (911670)

Alexandra Parra Díaz (914953)

Docente: Jhon Freddy Linares

Institución: Universidad Cooperativa de Colombia (UCC)

📄 Licencia y Legal
Copyright (c) 2026 Royber José Zayas Herrera - Universidad Cooperativa de Colombia.
Distribuido bajo la Licencia MIT. Este software contiene marcas de agua digitales integradas para verificar la propiedad intelectual del código fuente.
