/**
 * @file main.cjs
 * @description Proceso principal de Electron para la aplicación Excel to Report Smart.
 * Gestiona el ciclo de vida de la aplicación de escritorio, la creación y configuración
 * de la ventana del navegador (`BrowserWindow`), la seguridad del proceso renderer y
 * la carga de los archivos empaquetados por Vite.
 */

const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

/**
 * Determina si la aplicación se ejecuta en modo de desarrollo.
 * @type {boolean}
 */
const isDev = !app.isPackaged && Boolean(process.env.VITE_DEV_SERVER_URL);

/**
 * Instancia global de la ventana principal.
 * @type {BrowserWindow|null}
 */
let mainWindow = null;

/**
 * Garantiza una única instancia activa de la aplicación en el sistema operativo.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Crea e inicializa la ventana principal de la aplicación.
 *
 * @returns {BrowserWindow} Ventana de la aplicación configurada.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    title: 'Excel to Report Smart',
    backgroundColor: '#ffffff',
    show: false, // Se muestra en 'ready-to-show' para evitar parpadeos
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, '../public/favicon.svg'),
  });

  // Mostrar suavemente la ventana cuando el contenido esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Interceptar apertura de enlaces externos para abrirlos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Cargar URL en desarrollo o archivo compilado en producción
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

// Inicialización de la aplicación
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Finalizar la aplicación cuando todas las ventanas se cierran (excepto macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

