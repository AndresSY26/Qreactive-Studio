/* ═══════════════════════════════════════════════════
   QREATIVE STUDIO — main.js
   Client-side QR generation, interactivity & UX
   ═══════════════════════════════════════════════════ */

'use strict';

/* ╔══════════════════════════════════════╗
   ║  STATE                               ║
   ╚══════════════════════════════════════╝ */
const state = {
  dataType: 'url',
  dotsStyle: 'square',
  cornersStyle: 'square',
  colorDots: '#914FFF',
  colorBg: '#1a161f',
  colorCorner: '#3B7BF4',
  correction: 'M',
  logoBase64: null,
  logoSize: 0.4,
  qrSize: 1024,
  qrInstance: null,
  generateTimer: null,
  isGenerating: false,

  // Gradient State
  gradientEnabled: false,
  gradientType: 'linear', // 'linear' | 'radial'
  gradientColorStart: '#914FFF',
  gradientColorEnd: '#3B7BF4',
  gradientAngle: 0
};

/* ╔══════════════════════════════════════╗
   ║  DOM REFERENCES                      ║
   ╚══════════════════════════════════════╝ */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
  // Inputs
  inputUrl:       $('input-url'),
  inputText:      $('input-text'),
  vcardName:      $('vcard-name'),
  vcardOrg:       $('vcard-org'),
  vcardPhone:     $('vcard-phone'),
  vcardEmail:     $('vcard-email'),
  vcardUrl:       $('vcard-url'),
  wifiSsid:       $('wifi-ssid'),
  wifiPass:       $('wifi-pass'),
  wifiEnc:        $('wifi-enc'),
  wifiHidden:     $('wifi-hidden'),

  // Colors
  colorDots:      $('color-dots'),
  colorDotsText:  $('color-dots-text'),
  colorBg:        $('color-bg'),
  colorBgText:    $('color-bg-text'),
  colorCorner:    $('color-corner'),
  colorCornerText:$('color-corner-text'),
  correction:     $('qr-correction'),

  // Gradient UI
  gradToggle:     $('gradient-enabled'),
  gradPanel:      $('gradient-panel'),
  gradBadge:      $('gradient-badge'),
  gradPreview:    $('gradient-preview'),
  gradStart:      $('grad-color-start'),
  gradStartText:  $('grad-color-start-text'),
  gradEnd:        $('grad-color-end'),
  gradEndText:    $('grad-color-end-text'),
  gradTypeBtns:   $$('[data-grad-type]'),
  gradAngleBtns:  $$('[data-angle]'),
  gradAngleWrap:  $('gradient-angle-wrap'),

  // Logo
  logoUploadZone:      $('logo-upload-zone'),
  logoFileInput:       $('logo-file-input'),
  logoPrevContainer:   $('logo-preview-container'),
  logoPrevImg:         $('logo-preview-img'),
  logoPlaceholder:     $('logo-placeholder'),
  logoRemoveBtn:       $('logo-remove-btn'),
  logoOptions:         $('logo-options'),
  logoSize:            $('logo-size'),
  logoSizeVal:         $('logo-size-val'),

  // Preview
  qrCanvas:       $('qr-canvas'),
  scanBarFill:    $('scan-bar-fill'),
  scanBarLabel:   $('scan-bar-label'),
  scanScore:      $('scan-score'),
  checkContent:   $('check-content'),
  checkContrast:  $('check-contrast'),
  checkSize:      $('check-size'),
  checkCorrection:$('check-correction'),

  // Downloads
  btnPng:    $('btn-png'),
  btnSvg:    $('btn-svg'),
  btnPdf:    $('btn-pdf'),

  // Layout
  header: $('header'),
  hamburger: $('hamburger'),
  mobileNav: $('mobile-nav'),
  toast: $('toast'),
};

/* ╔══════════════════════════════════════╗
   ║  QR GENERATION                       ║
   ╚══════════════════════════════════════╝ */

function getQRData() {
  switch (state.dataType) {
    case 'url':  return (DOM.inputUrl.value || '').trim() || 'https://qreative.studio';
    case 'text': return (DOM.inputText.value || '').trim() || 'Qreative Studio';
    case 'vcard': {
      const n = DOM.vcardName.value.trim();
      const o = DOM.vcardOrg.value.trim();
      const t = DOM.vcardPhone.value.trim();
      const e = DOM.vcardEmail.value.trim();
      const u = DOM.vcardUrl.value.trim();
      if (!n && !t && !e) return 'BEGIN:VCARD\nVERSION:3.0\nFN:Qreative Studio\nEND:VCARD';
      let v = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (n) v += `FN:${n}\n`;
      if (o) v += `ORG:${o}\n`;
      if (t) v += `TEL:${t}\n`;
      if (e) v += `EMAIL:${e}\n`;
      if (u) v += `URL:${u}\n`;
      v += 'END:VCARD';
      return v;
    }
    case 'wifi': {
      const ssid = DOM.wifiSsid.value.trim();
      const pass = DOM.wifiPass.value.trim();
      const enc  = DOM.wifiEnc.value;
      const hidden = DOM.wifiHidden.checked ? 'true' : 'false';
      if (!ssid) return 'WIFI:T:WPA;S:MiRedWiFi;P:password;;';
      return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
    }
    default: return 'https://qreative.studio';
  }
}

function buildQROptions() {
  const opts = {
    width: Math.min(state.qrSize, 320),
    height: Math.min(state.qrSize, 320),
    data: getQRData(),
    margin: 12,
    qrOptions: { errorCorrectionLevel: state.correction },
    dotsOptions: {
      type: state.dotsStyle,
    },
    backgroundOptions: { color: state.colorBg },
    cornersSquareOptions: { type: state.cornersStyle, color: state.colorCorner },
    cornersDotOptions:    { color: state.colorCorner },
  };

  // Aplicar Color o Gradiente a los puntos
  if (state.gradientEnabled) {
    opts.dotsOptions.gradient = {
      type: state.gradientType,
      colorStops: [
        { offset: 0, color: state.gradientColorStart },
        { offset: 1, color: state.gradientColorEnd }
      ],
      rotation: (state.gradientAngle * Math.PI) / 180
    };
  } else {
    opts.dotsOptions.color = state.colorDots;
  }

  if (state.logoBase64) {
    opts.image = state.logoBase64;
    opts.imageOptions = {
      crossOrigin: 'anonymous',
      margin: 4,
      imageSize: state.logoSize,
    };
  }
  return opts;
}

function generateQR(immediate = false) {
  clearTimeout(state.generateTimer);
  const delay = immediate ? 0 : 350;
  state.generateTimer = setTimeout(() => _doGenerate(), delay);
}

function _doGenerate() {
  if (state.isGenerating) return;
  state.isGenerating = true;

  // Show spinner
  DOM.qrCanvas.innerHTML = '<div class="generating-spinner"></div>';

  setTimeout(() => {
    try {
      const opts = buildQROptions();

      if (state.qrInstance) {
        state.qrInstance.update(opts);
      } else {
        state.qrInstance = new QRCodeStyling(opts);
        state.qrInstance.append(DOM.qrCanvas);
      }

      // Clear spinner once appended
      setTimeout(() => {
        const existing = DOM.qrCanvas.querySelector('.generating-spinner');
        if (existing) existing.remove();
        reinitFeatherIcons();
        runScanValidation();
        state.isGenerating = false;
      }, 100);

    } catch (err) {
      console.error('[QR Generation Error]', err);
      state.isGenerating = false;
      showToast('Error generando el QR. Verifica los datos.', 'error');
    }
  }, 80);
}

/* ╔══════════════════════════════════════╗
   ║  SCAN VALIDATION                     ║
   ╚══════════════════════════════════════╝ */

function runScanValidation() {
  // Reset
  DOM.scanBarFill.style.width = '0%';
  DOM.scanScore.textContent = '—';
  DOM.scanBarLabel.textContent = 'Analizando...';
  [DOM.checkContent, DOM.checkContrast, DOM.checkSize, DOM.checkCorrection].forEach(el => {
    el.className = 'scan-check';
    el.querySelector('svg').setAttribute('data-feather', 'circle');
  });
  feather.replace();

  const data = getQRData();
  const checks = {
    content:    data.length > 0,
    contrast:   isGoodContrast(state.colorDots, state.colorBg),
    size:       state.qrSize >= 512,
    correction: ['Q','H'].includes(state.correction),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score  = Math.round((passed / 4) * 100);

  // Animate
  const steps   = [
    { el: DOM.checkContent,    key: 'content',    label: 'Contenido válido' },
    { el: DOM.checkContrast,   key: 'contrast',   label: 'Contraste óptimo' },
    { el: DOM.checkSize,       key: 'size',       label: 'Tamaño adecuado' },
    { el: DOM.checkCorrection, key: 'correction', label: 'Corrección de error' },
  ];

  let delay = 300;
  steps.forEach(({ el, key, label }) => {
    setTimeout(() => {
      const ok = checks[key];
      el.className = `scan-check ${ok ? 'check--pass' : 'check--fail'}`;
      el.innerHTML = `${ok ? icons.check : icons.x} ${label}`;
    }, delay);
    delay += 250;
  });

  setTimeout(() => {
    DOM.scanBarFill.style.width = `${score}%`;
    DOM.scanScore.textContent = `${score}%`;
    DOM.scanScore.style.color = score >= 75 ? '#4ade80' : score >= 50 ? '#facc15' : '#f87171';
    DOM.scanBarFill.style.background = score >= 75
      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
      : score >= 50
      ? 'linear-gradient(90deg, #eab308, #facc15)'
      : 'linear-gradient(90deg, #ef4444, #f87171)';
    DOM.scanBarLabel.textContent = score >= 75 ? 'Excelente' : score >= 50 ? 'Aceptable' : 'Mejorar';
  }, delay + 100);
}

function isGoodContrast(hex1, hex2) {
  const lum = (hex) => {
    const c = parseInt(hex.replace('#',''), 16);
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;
    const toLinear = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio >= 3;
}

// Inline tiny SVG icons for check/error marks
const icons = {
  check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
};

/* ╔══════════════════════════════════════╗
   ║  DOWNLOADS                           ║
   ╚══════════════════════════════════════╝ */

/**
 * Crea una instancia QRCodeStyling en resolución completa para exportación.
 */
function buildFullResQR() {
  const opts = buildQROptions();
  opts.width  = state.qrSize;
  opts.height = state.qrSize;
  return new QRCodeStyling(opts);
}

/**
 * Deshabilita/habilita los botones de descarga para evitar clics dobles.
 */
function setDownloadBtns(disabled) {
  [DOM.btnPng, DOM.btnSvg, DOM.btnPdf].forEach(btn => {
    btn.disabled = disabled;
    btn.style.opacity = disabled ? '0.5' : '';
    btn.style.pointerEvents = disabled ? 'none' : '';
  });
}

/**
 * Convierte un Blob a base64 data URL.
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Descarga un Blob usando el método más confiable.
 * Prioridad:
 *  1. Formulario POST oculto al servidor (único método que Edge respeta 100%)
 *  2. showSaveFilePicker — diálogo nativo de Windows
 *  3. data: URI + <a download> — fallback de último recurso
 */
async function forceDownload(blob, filename) {
  const ext     = filename.split('.').pop().toLowerCase();
  const dataUrl = await blobToBase64(blob);

  // ── Método 1: Formulario HTML POST oculto
  // El navegador sigue la respuesta del servidor con Content-Disposition: attachment
  // y respeta el nombre de archivo en TODOS los navegadores, sin excepción.
  const form       = document.getElementById('dl-form');
  const fldData    = document.getElementById('dl-data');
  const fldExt     = document.getElementById('dl-ext');
  const fldFilename = document.getElementById('dl-filename');

  if (form && fldData && fldExt && fldFilename) {
    fldData.value     = dataUrl;
    fldExt.value      = ext;
    fldFilename.value = filename;
    form.submit(); // El navegador descarga y NO navega (Content-Disposition: attachment)
    return;
  }

  // ── Método 2: File System Access API (diálogo nativo de Windows)
  if (typeof window.showSaveFilePicker === 'function') {
    const mimeMap = { png: 'image/png', svg: 'image/svg+xml', pdf: 'application/pdf' };
    const mimeType = mimeMap[ext] || 'application/octet-stream';
    try {
      const handle   = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: ext.toUpperCase() + ' File', accept: { [mimeType]: ['.' + ext] } }],
      });
      const writable  = await handle.createWritable();
      const typedBlob = new Blob([blob], { type: mimeType });
      await writable.write(typedBlob);
      await writable.close();
      return;
    } catch (err) {
      if (err.name === 'AbortError') return; // Usuario canceló
      console.warn('[showSaveFilePicker]', err);
    }
  }

  // ── Método 3: data: URI + <a download> (fallback de último recurso)
  const a = document.createElement('a');
  a.href     = dataUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 500);
}


/* ── PNG ─────────────────────────────────────────────── */
async function downloadPNG() {
  setDownloadBtns(true);
  showToast('Generando PNG...', 'info');
  try {
    const qr   = buildFullResQR();
    const blob = await qr.getRawData('png');
    if (!blob || blob.size === 0) throw new Error('Blob vacío');
    await forceDownload(blob, `qreative-studio-${Date.now()}.png`);
    showToast('✓ PNG descargado correctamente', 'success');
  } catch (err) {
    console.error('[PNG]', err);
    // Último recurso: método nativo de la librería
    try {
      buildFullResQR().download({ name: `qreative-studio-${Date.now()}`, extension: 'png' });
      showToast('✓ PNG descargado correctamente', 'success');
    } catch (e2) {
      showToast('Error al generar el PNG.', 'error');
    }
  } finally {
    setDownloadBtns(false);
  }
}

/* ── SVG ─────────────────────────────────────────────── */
async function downloadSVG() {
  setDownloadBtns(true);
  showToast('Generando SVG...', 'info');
  try {
    // Estrategia 1: librería nativa
    const qr   = buildFullResQR();
    const blob = await qr.getRawData('svg');

    if (blob && blob.size > 0) {
      await forceDownload(blob, `qreative-studio-${Date.now()}.svg`);
      showToast('✓ SVG descargado correctamente', 'success');
      return;
    }
    throw new Error('SVG blob vacío');
  } catch (err) {
    console.error('[SVG primary]', err);
    try {
      await downloadSVGFromDOM();
    } catch (e2) {
      console.error('[SVG fallback]', e2);
      showToast('Error al generar el SVG.', 'error');
    }
  } finally {
    setDownloadBtns(false);
  }
}

async function downloadSVGFromDOM() {
  // Estrategia 2: serializar el SVG del DOM actual
  const svgEl = DOM.qrCanvas.querySelector('svg');
  if (svgEl) {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    const svgStr = new XMLSerializer().serializeToString(clone);
    const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    await forceDownload(blob, `qreative-studio-${Date.now()}.svg`);
    showToast('✓ SVG descargado correctamente', 'success');
    return;
  }

  // Estrategia 3: PNG embebido en SVG wrapper
  const qr   = buildFullResQR();
  const png  = await qr.getRawData('png');
  const b64  = await blobToBase64(png);
  const sz   = state.qrSize;
  const svgWrap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">`,
    `  <image href="${b64}" x="0" y="0" width="${sz}" height="${sz}"/>`,
    '</svg>'
  ].join('\n');
  const blob = new Blob([svgWrap], { type: 'image/svg+xml;charset=utf-8' });
  await forceDownload(blob, `qreative-studio-${Date.now()}.svg`);
  showToast('✓ SVG descargado correctamente', 'success');
}

/* ── PDF ─────────────────────────────────────────────── */
async function downloadPDF() {
  setDownloadBtns(true);
  showToast('Generando PDF...', 'info');
  try {
    const qr   = buildFullResQR();
    const blob = await qr.getRawData('png');
    if (!blob || blob.size === 0) throw new Error('Blob PNG vacío para PDF');
    const b64 = await blobToBase64(blob);

    let pdfBlob;
    if (window.jspdf && window.jspdf.jsPDF) {
      // Devuelve Blob real, NO llama doc.save() que usa blob URL internamente
      pdfBlob = buildJsPDFBlob(b64);
    } else {
      pdfBlob = await buildCanvasPDFBlob(b64);
    }

    await forceDownload(pdfBlob, `qreative-studio-${Date.now()}.pdf`);
    showToast('✓ PDF descargado correctamente', 'success');
  } catch (err) {
    console.error('[PDF]', err);
    showToast('Error al generar el PDF.', 'error');
  } finally {
    setDownloadBtns(false);
  }
}


/**
 * Construye el PDF con jsPDF y devuelve un Blob.
 * NO llama a doc.save() porque éste usa createObjectURL internamente (mismo bug de Edge).
 */
function buildJsPDFBlob(imgBase64) {
  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const qrMM   = pageW - margin * 2;

  /* ── Header oscuro */
  doc.setFillColor(26, 22, 31);
  doc.rect(0, 0, pageW, 40, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(250, 250, 250);
  doc.text('QreativeStudio', pageW / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(145, 79, 255);
  doc.text('INGENIERÍA QR PREMIUM', pageW / 2, 23, { align: 'center' });

  doc.setTextColor(160, 154, 176);
  doc.text('qreative.studio · ORMOQ Engineering', pageW / 2, 30, { align: 'center' });

  /* ── Separador */
  doc.setDrawColor(58, 52, 66);
  doc.setLineWidth(0.5);
  doc.line(margin, 43, pageW - margin, 43);

  /* ── QR image */
  const qrY = 48;
  doc.addImage(imgBase64, 'PNG', margin, qrY, qrMM, qrMM, undefined, 'FAST');

  /* ── Contenido del QR */
  const infoY = qrY + qrMM + 8;
  if (infoY < pageH - 25) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 120);
    doc.text('CONTENIDO DEL CÓDIGO QR:', margin, infoY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 180);
    const raw  = getQRData();
    const text = raw.length > 200 ? raw.slice(0, 200) + '…' : raw;
    const lines = doc.splitTextToSize(text, qrMM);
    doc.text(lines.slice(0, 4), margin, infoY + 5);
  }

  /* ── Footer */
  doc.setDrawColor(58, 52, 66);
  doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 120);
  const day = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generado el ${day} con Qreative Studio`, pageW / 2, pageH - 7, { align: 'center' });

  // ← Retorna Blob en vez de llamar doc.save()
  return doc.output('blob');
}


async function buildCanvasPDFBlob(imgBase64) {
  /* Fallback sin jsPDF: genera A4 @300dpi como PNG y devuelve Blob */
  const W = 2480, H = 3508;
  const cv  = document.createElement('canvas');
  cv.width  = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1a161f';
  ctx.fillRect(0, 0, W, 340);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 110px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QreativeStudio', W / 2, 180);

  ctx.fillStyle = '#914FFF';
  ctx.font = '54px Arial';
  ctx.fillText('Ingeniería QR Premium · ORMOQ Engineering', W / 2, 260);

  await new Promise(res => {
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 160, 400, W - 320, W - 320); res(); };
    img.src = imgBase64;
  });

  ctx.fillStyle = '#6b6478';
  ctx.font = '48px Arial';
  ctx.fillText(`Generado con Qreative Studio · ${new Date().toLocaleDateString('es-MX')}`, W / 2, H - 80);

  // Devuelve Blob (no descarga directamente)
  return new Promise(res => cv.toBlob(res, 'image/png', 1.0));
}


/* ── Dispatcher ──────────────────────────────────────── */
function downloadAs(format) {
  if (!state.qrInstance) {
    showToast('Primero genera un código QR.', 'error');
    return;
  }
  if (format === 'png') downloadPNG();
  else if (format === 'svg') downloadSVG();
  else if (format === 'pdf') downloadPDF();
}

/* ╔══════════════════════════════════════╗
   ║  LOGO HANDLING                       ║
   ╚══════════════════════════════════════╝ */

function handleLogoFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Por favor selecciona una imagen válida.', 'error');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('El logo no debe superar 2MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.logoBase64 = e.target.result;
    DOM.logoPrevImg.src = e.target.result;
    DOM.logoPrevContainer.style.display = 'flex';
    DOM.logoPlaceholder.style.display = 'none';
    DOM.logoOptions.style.display = 'block';
    feather.replace();
    generateQR();
    showToast('✓ Logo cargado. QR actualizado.', 'success');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logoBase64 = null;
  DOM.logoPrevImg.src = '';
  DOM.logoPrevContainer.style.display = 'none';
  DOM.logoPlaceholder.style.display = 'flex';
  DOM.logoOptions.style.display = 'none';
  DOM.logoFileInput.value = '';
  feather.replace();
  generateQR();
}

/* ╔══════════════════════════════════════╗
   ║  TAB SYSTEM                          ║
   ╚══════════════════════════════════════╝ */

function activateTab(tabId) {
  $$('.tab').forEach(t => {
    t.classList.remove('tab--active');
    t.setAttribute('aria-selected', 'false');
  });
  $$('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));

  const tab   = $(`tab-${tabId}`);
  const panel = $(`panel-${tabId}`);
  if (tab)   { tab.classList.add('tab--active'); tab.setAttribute('aria-selected', 'true'); }
  if (panel) { panel.classList.add('tab-panel--active'); }

  state.dataType = tabId;
  generateQR();
}

/* ╔══════════════════════════════════════╗
   ║  STYLE OPTION BUTTONS                ║
   ╚══════════════════════════════════════╝ */

function initStyleOptions() {
  $$('[data-type="dots"]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('[data-type="dots"]').forEach(b => b.classList.remove('style-opt--active'));
      btn.classList.add('style-opt--active');
      state.dotsStyle = btn.dataset.value;
      generateQR();
    });
  });

  $$('[data-type="corners"]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('[data-type="corners"]').forEach(b => b.classList.remove('style-opt--active'));
      btn.classList.add('style-opt--active');
      state.cornersStyle = btn.dataset.value;
      generateQR();
    });
  });

  $$('.size-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.size-opt').forEach(b => b.classList.remove('size-opt--active'));
      btn.classList.add('size-opt--active');
      state.qrSize = parseInt(btn.dataset.size);
      generateQR();
    });
  });
}

/* ╔══════════════════════════════════════╗
   ║  COLOR SYNC (picker ↔ text)          ║
   ╚══════════════════════════════════════╝ */

function syncColor(picker, textInput, stateKey) {
  picker.addEventListener('input', () => {
    textInput.value = picker.value;
    state[stateKey] = picker.value;
    generateQR();
  });
  textInput.addEventListener('input', () => {
    const val = textInput.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      picker.value = val;
      state[stateKey] = val;
      generateQR();
    }
  });
  textInput.addEventListener('blur', () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(textInput.value.trim())) {
      textInput.value = picker.value;
    }
  });
}

/* ╔══════════════════════════════════════╗
   ║  HEADER SCROLL & MOBILE             ║
   ╚══════════════════════════════════════╝ */

function initHeader() {
  window.addEventListener('scroll', () => {
    DOM.header.classList.toggle('header--scrolled', window.scrollY > 20);
  }, { passive: true });

  let mobileOpen = false;
  DOM.hamburger.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    DOM.mobileNav.classList.toggle('open', mobileOpen);
    DOM.mobileNav.setAttribute('aria-hidden', String(!mobileOpen));
  });

  // Close on link click
  $$('.nav__link--mobile').forEach(link => {
    link.addEventListener('click', () => {
      mobileOpen = false;
      DOM.mobileNav.classList.remove('open');
      DOM.mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ╔══════════════════════════════════════╗
   ║  FAQ ACCORDION                       ║
   ╚══════════════════════════════════════╝ */

function initFAQ() {
  $$('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      $$('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ╔══════════════════════════════════════╗
   ║  TOAST                               ║
   ╚══════════════════════════════════════╝ */

let toastTimer = null;
function showToast(message, type = 'info') {
  clearTimeout(toastTimer);
  DOM.toast.textContent = message;
  DOM.toast.className = `toast toast--${type} toast--show`;
  toastTimer = setTimeout(() => DOM.toast.classList.remove('toast--show'), 3500);
}

/* ╔══════════════════════════════════════╗
   ║  GRADIENT CONTROLS                   ║
   ╚══════════════════════════════════════╝ */

function initGradientControls() {
  if (!DOM.gradToggle) return;

  DOM.gradToggle.addEventListener('change', (e) => {
    state.gradientEnabled = e.target.checked;
    DOM.gradPanel.classList.toggle('gradient-panel--active', state.gradientEnabled);
    DOM.gradBadge.textContent = state.gradientEnabled ? 'ON' : 'OFF';
    DOM.gradBadge.className = `gradient-badge ${state.gradientEnabled ? 'gradient-badge--on' : ''}`;
    generateQR();
  });

  // Sync colors
  syncColor(DOM.gradStart, DOM.gradStartText, 'gradientColorStart', () => {
    updateGradientPreview();
    generateQR();
  });
  syncColor(DOM.gradEnd, DOM.gradEndText, 'gradientColorEnd', () => {
    updateGradientPreview();
    generateQR();
  });

  // Gradient Type
  DOM.gradTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.gradientType = btn.dataset.gradType;
      DOM.gradTypeBtns.forEach(b => b.classList.toggle('gradient-type-btn--active', b === btn));
      DOM.gradAngleWrap.style.display = state.gradientType === 'radial' ? 'none' : 'block';
      generateQR();
    });
  });

  // Gradient Angle
  DOM.gradAngleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.gradientAngle = parseInt(btn.dataset.angle);
      DOM.gradAngleBtns.forEach(b => b.classList.toggle('gradient-angle-btn--active', b === btn));
      generateQR();
    });
  });

  updateGradientPreview();
}

function updateGradientPreview() {
  if (!DOM.gradPreview) return;
  DOM.gradPreview.style.background = `linear-gradient(90deg, ${state.gradientColorStart}, ${state.gradientColorEnd})`;
}

/* ╔══════════════════════════════════════╗
   ║  SMOOTH SCROLL FOR ANCHOR LINKS     ║
   ╚══════════════════════════════════════╝ */

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ╔══════════════════════════════════════╗
   ║  INTERSECTION OBSERVER (animations)  ║
   ╚══════════════════════════════════════╝ */

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.feature-card, .faq-item, .formats-table tr').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    observer.observe(el);
  });
}

/* ╔══════════════════════════════════════╗
   ║  FEATHER ICONS RE-INIT HELPER       ║
   ╚══════════════════════════════════════╝ */

function reinitFeatherIcons() {
  if (typeof feather !== 'undefined') feather.replace();
}

/* ╔══════════════════════════════════════╗
   ║  INIT                                ║
   ╚══════════════════════════════════════╝ */

function init() {
  // Tabs
  $('data-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab[data-tab]');
    if (tab) activateTab(tab.dataset.tab);
  });

  // Data input listeners
  [DOM.inputUrl, DOM.inputText, DOM.vcardName, DOM.vcardOrg,
   DOM.vcardPhone, DOM.vcardEmail, DOM.vcardUrl,
   DOM.wifiSsid, DOM.wifiPass].forEach(input => {
    if (input) input.addEventListener('input', () => generateQR());
  });
  if (DOM.wifiEnc) DOM.wifiEnc.addEventListener('change', () => generateQR());
  if (DOM.wifiHidden) DOM.wifiHidden.addEventListener('change', () => generateQR());
  if (DOM.correction) DOM.correction.addEventListener('change', (e) => { state.correction = e.target.value; generateQR(); });

  // Style options
  initStyleOptions();

  // Colors
  syncColor(DOM.colorDots, DOM.colorDotsText, 'colorDots');
  syncColor(DOM.colorBg,   DOM.colorBgText,   'colorBg');
  syncColor(DOM.colorCorner, DOM.colorCornerText, 'colorCorner');

  // Logo
  DOM.logoUploadZone.addEventListener('click', (e) => {
    if (!e.target.closest('.logo-upload__remove')) DOM.logoFileInput.click();
  });
  DOM.logoFileInput.addEventListener('change', (e) => handleLogoFile(e.target.files[0]));
  DOM.logoRemoveBtn.addEventListener('click', (e) => { e.stopPropagation(); removeLogo(); });

  // Logo drag & drop
  DOM.logoUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    DOM.logoUploadZone.classList.add('logo-upload--dragover');
  });
  DOM.logoUploadZone.addEventListener('dragleave', () => DOM.logoUploadZone.classList.remove('logo-upload--dragover'));
  DOM.logoUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    DOM.logoUploadZone.classList.remove('logo-upload--dragover');
    handleLogoFile(e.dataTransfer.files[0]);
  });

  // Logo size
  DOM.logoSize.addEventListener('input', (e) => {
    const pct = parseInt(e.target.value);
    DOM.logoSizeVal.textContent = pct;
    state.logoSize = pct / 100;
    generateQR();
  });

  // Downloads
  DOM.btnPng.addEventListener('click', () => downloadAs('png'));
  DOM.btnSvg.addEventListener('click', () => downloadAs('svg'));
  DOM.btnPdf.addEventListener('click', () => downloadAs('pdf'));

  // Gradients
  initGradientControls();

  // Header, FAQ, nav
  initHeader();
  initFAQ();
  initSmoothScroll();

  // Scroll animations (delayed to allow paint)
  setTimeout(initScrollAnimations, 400);

  // Initial QR generation
  generateQR(true);

  console.log('[Qreative Studio] ✓ Initialized');
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
