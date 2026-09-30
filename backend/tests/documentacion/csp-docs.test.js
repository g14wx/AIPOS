import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const express = require('express');
const helmet = require('helmet');
const app = require('../../src/app.js');
const docs = require('../../src/routes/docs.js');

// 'default-src \'self\'; style-src ...' -> { 'default-src': ["'self'"], 'style-src': [...] }
function directivas(cabecera) {
  return Object.fromEntries(
    cabecera
      .split(';')
      .map((directiva) => directiva.trim())
      .filter(Boolean)
      .map((directiva) => {
        const [nombre, ...valores] = directiva.split(/\s+/);
        return [nombre, valores];
      }),
  );
}

async function politicaDe(laApp, ruta) {
  const respuesta = await request(laApp).get(ruta);
  return respuesta.headers['content-security-policy'];
}

// La política que helmet pone en toda la API cuando nadie la toca.
async function politicaDeHelmet() {
  const soloHelmet = express();
  soloHelmet.use(helmet());
  soloHelmet.get('/', (req, res) => res.end());
  return politicaDe(soloHelmet, '/');
}

describe('la política de contenido de /api/docs/', () => {
  it('permite estilos en línea y no lleva upgrade-insecure-requests', async () => {
    const politica = await politicaDe(app, '/api/docs/');
    expect(politica).toBeTruthy();
    expect(directivas(politica)['style-src']).toEqual(["'self'", "'unsafe-inline'"]);
    expect(politica).not.toContain('upgrade-insecure-requests');
  });

  it('no relaja nada más: es la de helmet con solo esos dos cambios', async () => {
    const esperada = directivas(await politicaDeHelmet());
    delete esperada['upgrade-insecure-requests'];
    esperada['style-src'] = ["'self'", "'unsafe-inline'"];
    expect(directivas(await politicaDe(app, '/api/docs/'))).toEqual(esperada);
  });

  it('script-src y default-src siguen siendo solo self, sin connect-src ni unsafe-eval', async () => {
    const politica = directivas(await politicaDe(app, '/api/docs/'));
    expect(politica['script-src']).toEqual(["'self'"]);
    expect(politica['default-src']).toEqual(["'self'"]);
    expect(politica).not.toHaveProperty('connect-src');
    expect(JSON.stringify(politica)).not.toMatch(/unsafe-eval|\*/);
  });

  it('también la llevan el JavaScript y el CSS de Swagger UI', async () => {
    for (const ruta of ['/api/docs/swagger-ui-init.js', '/api/docs/swagger-ui.css']) {
      const politica = await politicaDe(app, ruta);
      expect(directivas(politica)['style-src'], ruta).toContain("'unsafe-inline'");
      expect(politica, ruta).not.toContain('upgrade-insecure-requests');
    }
  });
});

describe('el resto de la API conserva la política de helmet completa', () => {
  it('GET /api/salud lleva la de helmet, con upgrade-insecure-requests', async () => {
    const politica = await politicaDe(app, '/api/salud');
    expect(politica).toBe(await politicaDeHelmet());
    expect(politica).toContain('upgrade-insecure-requests');
  });

  it('una ruta que no existe lleva la de helmet', async () => {
    expect(await politicaDe(app, '/api/no-existe')).toBe(await politicaDeHelmet());
  });
});

describe('si la política general se endurece, /api/docs/ sigue funcionando', () => {
  it('el router pone la suya y el resto queda con la estricta', async () => {
    const estricta = express();
    estricta.use(
      helmet({
        contentSecurityPolicy: { useDefaults: true, directives: { 'style-src': ["'self'"] } },
      }),
    );
    estricta.use('/api/docs', docs);
    estricta.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

    expect(directivas(await politicaDe(estricta, '/api/docs/'))['style-src']).toEqual([
      "'self'",
      "'unsafe-inline'",
    ]);
    expect(directivas(await politicaDe(estricta, '/api/salud'))['style-src']).toEqual(["'self'"]);
  });
});
