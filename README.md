# El Cofre que Aún No Abrimos

Una experiencia digital romántica, misteriosa y cinematográfica diseñada especialmente para **Dacia**.

## 🌟 Características
- **Sin dependencias externas**: Escrito únicamente en Vanilla HTML5, CSS3 y JavaScript.
- **Web Audio API**: Sonido ambiental sintetizado sin necesidad de archivos MP3 externos.
- **Mobile First (9:16)**: Optimizado para pantallas táctiles de teléfonos móviles y adaptado para escritorio.
- **Guardado de estado**: Conserva el progreso y las opciones del usuario con `localStorage`.

---

## 🚀 Cómo ejecutar localmente
1. Clona o descarga este repositorio.
2. Abre el archivo `index.html` directamente en cualquier navegador moderno (Chrome, Safari, Firefox, Edge).

---

## 🛠️ Guía de Personalización

### 1. Cambiar los Nombres
- **Nombre principal (Dacia)**:
  - Abre `index.html` y busca `Dacia...` o `Dacia & Yousef`.
- **Tu Nombre (Yousef)**:
  - Modifica la línea en `index.html` donde aparece `Dacia & Yousef`.

### 2. Editar los Mensajes o la Carta
- Abre `index.html` para modificar los párrafos dentro de `<div id="long-letter-container">`.
- Para cambiar la velocidad de escritura de la primera carta, abre `js/main.js` y ajusta los parámetros de tiempo de `window.sceneManager.typeWriter()`.

### 3. Modificar la Paleta de Colores
Abre `css/style.css` y cambia las variables en `:root`:
```css
:root {
  --bg-midnight: #080B16;
  --bg-deep-black: #03050B;
  --gold-warm: #D6B36A;
  --gold-champagne: #F3DFA5;
  --burgundy-touch: #5B2433;
}
