import { createApp } from './app.js';

const day = new Date().toISOString().slice(0, 10);
createApp(document, window.localStorage, day);
