import express              from 'express';
import path                 from 'path';
import { fileURLToPath }    from 'url';

// __dirname no existe en ES Modules — se reconstruye con import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files — sin caché en dev para que los cambios se reflejen de inmediato
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'QREATIVERSTUDIO | Ingeniería QR Premium',
    description: 'Genera códigos QR de alta calidad con personalización avanzada, logos, colores y múltiples formatos de exportación.'
  });
});

/**
 * POST /api/download
 * Recibe: { data: "base64...", ext: "png|svg|pdf", filename: "nombre" }
 * Devuelve: archivo como descarga directa con Content-Disposition: attachment
 * Este es el método más confiable para forzar descargas con nombre correcto en Edge.
 */
app.post('/api/download', (req, res) => {
  try {
    const { data, ext, filename } = req.body;
    if (!data || !ext || !filename) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }

    const mimeMap = {
      png: 'image/png',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    // Eliminar encabezado data URL si existe ("data:image/png;base64,...")
    const base64 = data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const safeFilename = encodeURIComponent(filename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"; filename*=UTF-8''${safeFilename}`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
  } catch (err) {
    console.error('[/api/download]', err);
    res.status(500).json({ error: 'Error interno' });
  }
});


// 404
app.use((req, res) => {
  res.status(404).send('<h1>404 - Página no encontrada</h1>');
});

app.listen(PORT, () => {
  console.log('-'.repeat(49));
  console.log('🚀 QREATIVERSTUDIO iniciado correctamente');
  console.log(`📍 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🎨 Elevación de Agencia | ORMOQ ENGINEERING`);
  console.log('-'.repeat(49));
});
