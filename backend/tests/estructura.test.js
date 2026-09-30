import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const raiz = path.resolve(import.meta.dirname, '../..');
const backend = path.join(raiz, 'backend');
const src = path.join(backend, 'src');
const paquete = JSON.parse(fs.readFileSync(path.join(backend, 'package.json'), 'utf8'));

function archivosJs(carpeta) {
  if (!fs.existsSync(carpeta)) return [];
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) return archivosJs(ruta);
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

// Lo que cada archivo carga con require('...'), sin mirar los comentarios.
function requeridos(ruta) {
  const codigo = fs.readFileSync(ruta, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  return [...codigo.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
}

function carpetaDe(ruta) {
  return path.relative(src, ruta).split(path.sep)[0];
}

describe('monorepo', () => {
  it('.nvmrc dice 24 y el backend pide Node 24 o más', () => {
    expect(fs.readFileSync(path.join(raiz, '.nvmrc'), 'utf8').trim()).toBe('24');
    expect(paquete.engines).toEqual({ node: '>=24' });
  });

  it('no hay package.json en la raíz', () => {
    expect(fs.existsSync(path.join(raiz, 'package.json'))).toBe(false);
  });

  it('el backend sube su package-lock.json', () => {
    expect(fs.existsSync(path.join(backend, 'package-lock.json'))).toBe(true);
  });

  it('.gitignore deja fuera .env, node_modules/, frontend/dist/ y coverage/', () => {
    const lineas = fs.readFileSync(path.join(raiz, '.gitignore'), 'utf8').split('\n');
    for (const patron of ['.env', 'node_modules/', 'frontend/dist/', 'coverage/']) {
      expect(lineas, patron).toContain(patron);
    }
  });
});

describe('versiones', () => {
  const todas = { ...paquete.dependencies, ...paquete.devDependencies };

  it('todas van fijas, sin ^ ni ~ ni latest', () => {
    for (const [nombre, version] of Object.entries(todas)) {
      expect(version, nombre).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('son las versiones de la tabla de la spec', () => {
    expect(paquete.dependencies).toEqual({
      cors: '2.8.6',
      dotenv: '18.0.4',
      express: '5.2.1',
      helmet: '8.3.0',
      mysql2: '3.24.5',
      sequelize: '6.37.8',
      'sequelize-cli': '6.6.5',
    });
    expect(paquete.devDependencies).toMatchObject({
      vitest: '5.0.2',
      supertest: '7.3.0',
      eslint: '10.11.0',
      '@eslint/js': '10.0.1',
      globals: '17.12.0',
      'eslint-config-prettier': '10.1.8',
      prettier: '3.9.9',
    });
  });

  it('sequelize-cli va en dependencies y no en devDependencies', () => {
    expect(paquete.dependencies).toHaveProperty('sequelize-cli');
    expect(paquete.devDependencies).not.toHaveProperty('sequelize-cli');
  });

  it('no entran los paquetes que la spec descarta', () => {
    const prohibidos = [
      'mysql',
      'express-validator',
      'joi',
      'zod',
      'morgan',
      'winston',
      'pinia',
      'vuex',
    ];
    for (const nombre of Object.keys(todas)) {
      expect(prohibidos, nombre).not.toContain(nombre);
      expect(nombre.startsWith('@sequelize/'), nombre).toBe(false);
    }
  });

  it('el backend es CommonJS: no declara "type"', () => {
    expect(paquete).not.toHaveProperty('type');
  });
});

describe('scripts', () => {
  it('son los de la tabla de la spec', () => {
    expect(paquete.scripts).toMatchObject({
      dev: 'node --watch src/servidor.js',
      start: 'node src/servidor.js',
      test: 'vitest run',
      'test:vigilar': 'vitest',
      migrar: 'sequelize-cli db:migrate',
      deshacer: 'sequelize-cli db:migrate:undo',
      rehacer: 'sequelize-cli db:migrate:undo:all && sequelize-cli db:migrate',
      'migrar:prueba': 'sequelize-cli db:migrate --env test',
      'deshacer:prueba': 'sequelize-cli db:migrate:undo --env test',
      'rehacer:prueba':
        'sequelize-cli db:migrate:undo:all --env test && sequelize-cli db:migrate --env test',
      'preparar-prueba': 'node scripts/crear-base-de-prueba.js',
      lint: 'eslint .',
      format: 'prettier --write .',
      'format:check': 'prettier --check .',
    });
  });
});

describe('carpetas y capas', () => {
  it('existen las carpetas de las capas y las de errores y middlewares', () => {
    for (const carpeta of [
      'routes',
      'controllers',
      'services',
      'models',
      'errors',
      'middlewares',
    ]) {
      expect(fs.statSync(path.join(src, carpeta)).isDirectory(), carpeta).toBe(true);
    }
  });

  it('existen app.js, servidor.js, config.js y database.js', () => {
    for (const archivo of ['app.js', 'servidor.js', 'config.js', 'database.js']) {
      expect(fs.existsSync(path.join(src, archivo)), archivo).toBe(true);
    }
  });

  it('.sequelizerc apunta a db/config.js, db/migrations y src/models', () => {
    const texto = fs.readFileSync(path.join(backend, '.sequelizerc'), 'utf8');
    expect(texto).toContain("'db', 'config.js'");
    expect(texto).toContain("'db', 'migrations'");
    expect(texto).toContain("'src', 'models'");
  });

  it('cada archivo del backend es CommonJS y empieza con use strict', () => {
    const archivos = archivosJs(src);
    expect(archivos.length).toBeGreaterThan(0);
    for (const ruta of archivos) {
      const codigo = fs.readFileSync(ruta, 'utf8');
      expect(codigo.startsWith("'use strict';"), ruta).toBe(true);
      expect(codigo, ruta).not.toMatch(/^(import|export)\s/m);
    }
  });

  it('las rutas no tocan modelos, Sequelize ni SQL', () => {
    for (const ruta of archivosJs(path.join(src, 'routes'))) {
      for (const carga of requeridos(ruta)) {
        expect(carga, ruta).not.toMatch(/models|sequelize|database|services/);
      }
    }
  });

  it('los controladores no tocan modelos, Sequelize ni la base de datos', () => {
    for (const ruta of archivosJs(path.join(src, 'controllers'))) {
      for (const carga of requeridos(ruta)) {
        expect(carga, ruta).not.toMatch(/models|sequelize|database/);
      }
    }
  });

  it('los servicios no conocen req, res ni Express', () => {
    for (const ruta of archivosJs(path.join(src, 'services'))) {
      const codigo = fs.readFileSync(ruta, 'utf8');
      expect(codigo, ruta).not.toMatch(/\b(req|res)\b/);
      for (const carga of requeridos(ruta)) expect(carga, ruta).not.toMatch(/^express$/);
    }
  });

  it('los modelos no llaman a servicios, controladores ni rutas', () => {
    for (const ruta of archivosJs(path.join(src, 'models'))) {
      for (const carga of requeridos(ruta)) {
        expect(carga, ruta).not.toMatch(/services|controllers|routes/);
      }
    }
  });

  it('cada capa solo carga la de abajo (nunca sube)', () => {
    const orden = ['routes', 'controllers', 'services', 'models'];
    for (const ruta of archivosJs(src)) {
      const capa = orden.indexOf(carpetaDe(ruta));
      if (capa === -1) continue;
      for (const carga of requeridos(ruta).filter((c) => c.startsWith('.'))) {
        const destino = path
          .relative(src, path.resolve(path.dirname(ruta), carga))
          .split(path.sep)[0];
        const capaDestino = orden.indexOf(destino);
        if (capaDestino !== -1)
          expect(capaDestino, `${ruta} -> ${carga}`).toBeGreaterThanOrEqual(capa);
      }
    }
  });

  it('solo servidor.js escucha un puerto: app.js no llama a listen', () => {
    expect(fs.readFileSync(path.join(src, 'app.js'), 'utf8')).not.toMatch(/\.listen\(/);
    expect(fs.readFileSync(path.join(src, 'servidor.js'), 'utf8')).toMatch(/\.listen\(/);
  });

  it('app.js pone los middlewares en el orden de la spec', () => {
    const codigo = fs.readFileSync(path.join(src, 'app.js'), 'utf8');
    const posiciones = [
      'helmet(',
      'cors(',
      'express.json(',
      "'/api'",
      'noEncontrado',
      'errorHandler',
    ].map((marca) => codigo.indexOf(marca, codigo.indexOf('function crearApp')));
    posiciones.forEach((p, i) => expect(p, `marca ${i}`).toBeGreaterThan(-1));
    expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
  });

  it('routes/index.js exporta la lista montajes con la ruta /salud', () => {
    const { montajes } = require_('../src/routes/index.js');
    expect(montajes.map((m) => m.ruta)).toContain('/salud');
  });
});
