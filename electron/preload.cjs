/**
 * @file preload.cjs
 * @description Script de precarga seguro para el proceso renderer de Electron.
 * Se ejecuta en un contexto aislado con acceso controlado a APIs de Node/Electron,
 * exponiendo únicamente funcionalidades seguras mediante `contextBridge`.
 */

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});

