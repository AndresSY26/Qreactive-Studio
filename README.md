# 🔮 Qreative Studio

![Qreative Studio Banner](https://img.shields.io/badge/Estado-Premium-914FFF?style=for-the-badge&logo=appveyor)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)

**Qreative Studio** es una plataforma de generación de códigos QR de nivel profesional diseñada con un enfoque en la estética, la personalización y la fiabilidad. Construida para empresas modernas y profesionales creativos que necesitan códigos QR de alta calidad que coincidan con su identidad de marca.

---

## ✨ Características Principales

### 🎨 Personalización Avanzada
- **Motor de Gradientes**: Aplica impresionantes gradientes lineales o radiales a tus códigos QR.
- **Micro-Estilizado**: Personaliza patrones de puntos (cuadrados, redondeados, puntos, elegantes) y estilos de esquinas.
- **Branding**: Integración fluida de logotipos con tamaño y transparencia ajustables.
- **Validación Visual**: Puntuación de escaneo en tiempo real y verificación de contraste para asegurar que tus códigos siempre funcionen.

### 📊 Soporte para Múltiples Tipos
- **URL**: Enlaces directos a sitios web o páginas de destino.
- **vCard**: Tarjetas de presentación digitales profesionales.
- **WiFi**: Conexión simplificada para invitados (SSID, Contraseña, Cifrado).
- **Texto Simple**: Integración de datos versátil.

### 📥 Exportaciones de Alta Fidelidad
- **PNG**: Imágenes rasterizadas de alta resolución para uso digital.
- **SVG**: Escalabilidad infinita para impresión profesional y edición vectorial.
- **PDF**: Documentos listos para imprimir con branding integrado.
- *Fiabilidad*: Utiliza una robusta arquitectura de proxy de servidor con `Content-Disposition` para garantizar que las descargas funcionen en todos los navegadores (incluyendo Edge/Chromium).

---

## 🛠️ Stack Tecnológico

- **Backend**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Motor de Plantillas**: [EJS](https://ejs.co/)
- **Estilos**: CSS3 Puro (Sistema de Diseño Personalizado, Variables CSS)
- **Lógica Frontend**: Módulos ES (Vanilla JS)
- **Núcleo QR**: [qr-code-styling](https://github.com/ko00ov/qr-code-styling)
- **Generación de PDF**: [jsPDF](https://github.com/parallax/jsPDF)

---

## 🚀 Comenzando

### Requisitos Previos
- Node.js (v18.0 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/qreative-studio.git
   cd qreative-studio
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**
   Abre tu navegador y dirígete a `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```text
Qreative Studio/
├── public/                 # Archivos estáticos
│   ├── css/                # Sistema de Diseño Personalizado (style.css)
│   ├── js/                 # Lógica del Frontend (main.js)
│   └── icons/              # Activos de marca y logotipos
├── views/                  # Plantillas EJS
│   └── index.ejs           # Interfaz principal de la aplicación
├── server.js               # Servidor Express y API de Proxy de Descarga
├── package.json            # Configuración y Dependencias
└── README.md               # Documentación
```

---

## ⚙️ Cómo funciona: Proxy de Descarga

La plataforma implementa una API de **Proxy de Descarga** única en `server.js` para evitar las limitaciones del navegador con respecto a las URLs `blob:` y `data:`.

Cuando un usuario hace clic en 'Descargar':
1. Los datos del QR se generan como una cadena Base64 en el cliente.
2. Se envían mediante `POST` a `/api/download`.
3. El servidor responde con los encabezados `Content-Type` y `Content-Disposition` adecuados.
4. El navegador lo trata como un archivo nativo del servidor, asegurando el nombre de archivo y la extensión correctos en todos los sistemas operativos.

---

## 🤝 Contribuir

Las contribuciones son lo que hacen que la comunidad de código abierto sea un lugar increíble para aprender, inspirar y crear. Cualquier contribución que hagas es **muy apreciada**.

1. Haz un Fork del proyecto
2. Crea tu rama para una característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Sube los cambios a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia y Créditos

Distribuido bajo la Licencia MIT. Desarrollado con ❤️ por **ORMOQ Engineering**.

*Lógica QR personalizada impulsada por `qr-code-styling`.*
