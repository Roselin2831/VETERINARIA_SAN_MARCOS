// Persistencia simple en un archivo JSON (backend/data/db.json).
// Suficiente para un proyecto académico; se puede reemplazar por MySQL/Postgres después.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { hashPassword } from './auth.js';

export const seedProducts = [
  { id: 'p1', name: 'Alimento perro adulto', category: 'Alimentos', price: 18990, stock: 16, offer: true, description: 'Nutrición completa para perros adultos.', emoji: '🐕' },
  { id: 'p2', name: 'Arena sanitaria premium', category: 'Higiene', price: 7990, stock: 22, offer: false, description: 'Control de olores y alta absorción.', emoji: '🐈' },
  { id: 'p3', name: 'Antiparasitario externo', category: 'Salud', price: 12490, stock: 9, offer: true, description: 'Protección mensual contra pulgas y garrapatas.', emoji: '🩺' },
  { id: 'p4', name: 'Snack dental', category: 'Alimentos', price: 4290, stock: 30, offer: false, description: 'Premio saludable para su cuidado oral.', emoji: '🦴' },
  { id: 'p5', name: 'Shampoo hipoalergénico', category: 'Higiene', price: 8990, stock: 12, offer: false, description: 'Limpieza suave para pieles sensibles.', emoji: '🫧' },
  { id: 'p6', name: 'Vitaminas multiespecie', category: 'Salud', price: 10990, stock: 14, offer: true, description: 'Apoyo diario para perros y gatos.', emoji: '💊' }
];

export const makeId = (prefix) => `${prefix}-${randomUUID().slice(0, 8)}`;

export function createDb(file) {
  let state;

  const persist = () => {
    mkdirSync(dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(state, null, 2));
    renameSync(tmp, file); // escritura atómica
  };

  if (file && existsSync(file)) {
    state = JSON.parse(readFileSync(file, 'utf8'));
  } else {
    state = {
      products: structuredClone(seedProducts),
      users: [{
        id: 'u1',
        name: 'Administración San Marcos',
        email: process.env.ADMIN_EMAIL || 'admin@sanmarcos.cl',
        passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'Admin123!'),
        role: 'admin'
      }],
      orders: []
    };
    if (file) persist();
  }

  return {
    get state() { return state; },
    save: () => { if (file) persist(); }
  };
}
