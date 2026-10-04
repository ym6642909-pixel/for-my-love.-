# El Cofre que Aún No Abrimos (الصندوق الذي لم نفتحه بعد)
### Una experiencia romántica, misteriosa y cinematográfica para Dacia.

---

## 🌹 Descripción del Proyecto
Este proyecto es una carta de amor interactiva digital concebida como una experiencia cinematográfica de alta fidelidad. Diseñada especialmente para **Dacia** (de Honduras) de parte de **Yousef** (desde Egipto), superando la distancia geográfica a través de un viaje íntimo y poético.

El proyecto está construido íntegramente con tecnologías web estándar (**HTML5, CSS3 moderno, Vanilla JavaScript, Web Audio API y SVG interactivo**), sin dependencias externas pesadas ni frameworks, listo para alojarse de inmediato en **GitHub Pages**.

---

## 📁 Estructura del Proyecto

```
dacia-love-box/
│
├── index.html              # El contenedor principal y orquestador de escenas
├── css/
│   └── style.css           # Estilos cinematográficos, paleta de colores, animaciones y tipografía
├── js/
│   ├── main.js             # Inicialización, cursor personalizado, controles de interfaz y partículas
│   ├── scenes.js           # Máquina de estados interactiva con las 17 fases de la historia
│   └── audio.js            # Sintetizador ambiental y armónico con Web Audio API (Piano/Ambient)
├── assets/
│   ├── images/             # Ilustraciones vectoriales SVG integradas
│   ├── audio/              # Espacio para archivos MP3 propios (opcional)
│   └── icons/              # Iconografía fina dorada
└── README.md               # Esta guía completa de personalización y despliegue
```

---

## 🎨 Paleta de Colores Cinematográfica
- **Midnight Navy:** `#080B16` (Fondo de noche profunda)
- **Deep Black Blue:** `#03050B` (Contraste y viñeta)
- **Warm Gold:** `#D6B36A` (Acento de lujo y destellos)
- **Soft Champagne:** `#F3DFA5` (Brillo estelar y orfebrería)
- **Text White:** `#F6F2E9` (Tipografía nítida y suave)
- **Secondary Text:** `#A9A6A0` (Detalles poéticos sutiles)
- **Burgundy Accent:** `#5B2433` (Toques crepusculares sutiles)

---

## 🚀 Despliegue en GitHub Pages

1. **Crear el Repositorio:**
   - Ve a [GitHub](https://github.com/) y crea un nuevo repositorio público o privado (por ejemplo: `el-cofre`).
2. **Subir los Archivos:**
   - Sube la estructura completa (`index.html`, `css/`, `js/`, `README.md`).
3. **Activar GitHub Pages:**
   - Entra en **Settings** > **Pages** en tu repositorio.
   - En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save**. En un par de minutos tendrás tu enlace listo para compartir (ej. `https://tu-usuario.github.io/el-cofre/`).

---

## ✍️ Cómo Personalizar el Contenido

### 1. Cambiar los Nombres
Abre `js/scenes.js` o `index.html`:
- Busca `"Dacia"` y sustitúyelo por el nombre que desees.
- Busca `"Yousef"` para cambiar el remitente.

### 2. Personalizar los Mensajes y Cartas
Todas las líneas narrativas se encuentran estructuradas en el archivo `js/scenes.js`:
- **Escena 6 (La Primera Carta):** Mensaje introductorio.
- **Escenas 8–12 (Las 5 Reliquias):** *Tiempo, Distancia, Voz, Recuerdo, Secreto*.
- **Escena 14 (La Declaración Principal):** Los párrafos poéticos sinceros.

### 3. Música y Efectos de Sonido
El proyecto cuenta con un **sintetizador armónico ambiental procedural** (`js/audio.js`) utilizando la Web Audio API que genera notas de piano suave, drones envolventes y campanillas doradas en tiempo real sin requerir archivos externos.
- Si prefieres usar una canción real (ejemplo en formato `.mp3`):
  1. Coloca tu archivo en `assets/audio/cancion.mp3`.
  2. En `js/audio.js`, descomenta la carga del elemento `<audio>` y asigna la fuente.

---

## 📱 Optimización y Accesibilidad
- **Mobile First (9:16):** Perfectamente encuadrado y probado para pantallas móviles de última generación, tablets y monitores ultrawide de escritorio.
- **Accesibilidad:** Soporta `prefers-reduced-motion` para personas sensibles a transiciones continuas.
- **Persistencia:** Guarda el estado del sonido y del progreso en `localStorage`.