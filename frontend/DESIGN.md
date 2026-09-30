---
name: AIPOS
description: La pantalla única de un punto de venta, en un solo tema claro y con el total siempre a la vista.
colors:
  tinta: '#292F36'
  turquesa: '#4ECDC4'
  menta: '#F7FFF7'
  coral: '#FF6B6B'
  amarillo: '#FFE66D'
  blanco: '#FFFFFF'
typography:
  cuerpo:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: '1.5rem'
  titulo:
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: '1.75rem'
  boton:
    fontSize: '1rem'
    fontWeight: 600
    letterSpacing: 'normal'
  ayuda:
    fontSize: '0.875rem'
    lineHeight: '1.25rem'
  total:
    fontSize: '2rem'
    fontWeight: 700
    lineHeight: '2.5rem'
    fontFeature: "'tnum'"
rounded:
  sm: '4px'
spacing:
  xs: '8px'
  sm: '16px'
  md: '24px'
components:
  boton-principal:
    backgroundColor: '{colors.turquesa}'
    textColor: '{colors.tinta}'
    typography: '{typography.boton}'
    rounded: '{rounded.sm}'
    height: '44px'
  barra-superior:
    backgroundColor: '{colors.tinta}'
    textColor: '{colors.turquesa}'
    height: '48px'
  campo-de-busqueda:
    backgroundColor: '{colors.blanco}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.sm}'
    height: '56px'
  franja-del-total:
    backgroundColor: '{colors.amarillo}'
    textColor: '{colors.tinta}'
    typography: '{typography.total}'
    padding: '16px 20px'
---

# Design System: AIPOS

> Lo escribió el agente con la skill `impeccable`, sin entrevista con la persona desarrolladora. La paleta y sus usos salen
> de `specs/arquitectura.spec.md`; lo demás se infirió de la pantalla construida y queda por confirmar.

## Overview

**Norte creativo: la caja que se lee de un vistazo.** Es una herramienta de trabajo para el cajero, que atiende de pie y con
prisa: familiar, tranquila y sin adornos. Solo llaman dos cosas, el campo de búsqueda y el total en amarillo. Todo lo
demás está quieto. Estrategia de color restringida: neutros más un acento. Un solo tema, el claro (luz de tienda).
Anti-referencia: el tablero de tarjetas iguales con ícono, título y texto.

## Colors

La paleta es de la persona desarrolladora. El quinto color, `amarillo`, es un supuesto (por confirmar).

- **Tinta** `#292F36`: todo el texto y la barra superior. Nunca hay texto blanco sobre turquesa.
- **Turquesa** `#4ECDC4`: acciones principales, foco y selección. Sobre fondo claro solo como relleno o borde, nunca como texto (1.90).
- **Menta** `#F7FFF7`: fondo de la pantalla. **Blanco** `#FFFFFF`: superficies (tarjetas y campos).
- **Coral** `#FF6B6B`: errores y acciones que borran, como relleno, borde o ícono. El mensaje va en tinta dentro de una franja.
- **Amarillo** `#FFE66D`: el total y lo recién agregado. Solo relleno.

Contraste del texto sobre su fondo: tinta sobre turquesa 6.98, sobre menta 13.26, sobre amarillo 10.80, sobre coral 4.87, y turquesa sobre tinta 6.98.
En el CSS los colores se leen de `var(--v-secondary-base)` y las demás variables del tema, no se repiten en hexadecimal.

## Typography

Una sola familia, la del sistema: es una herramienta y no lleva fuente propia. Escala fija en rem: 14, 16, 20 y 32 px, con
pesos 400, 600 y 700. Los importes usan cifras tabulares (`tabular-nums`) para que no bailen al cambiar. Los botones van en
frase normal ("Nuevo producto"), sin mayúsculas ni espaciado entre letras.

## Layout

Ancho máximo de 90 rem, centrado, con 16 px de margen (24 px desde 960 px). La marca de la barra y el contenido comparten
ese ancho y quedan alineados. Desde 960 px hay dos columnas (7 y 5 de 12; 8 y 4 desde 1264 px): a la izquierda «Nuevo
producto» y la búsqueda, a la derecha la venta actual. Debajo de 960 px es una sola columna en ese mismo orden, y el botón
ocupa todo el ancho en el móvil. El orden visual es el orden del teclado.

## Elevation & Depth

Plano. No hay sombras: las superficies blancas se separan del fondo menta con un filete de 1 px, la tinta al 16 %. El total
es un campo de color, no una sombra.

## Shapes

Radio de 4 px en botones, campos y tarjetas, el de Vuetify 2. El ícono del estado vacío va en un círculo. El borde de un campo
en reposo es la tinta al 55 % (3.4 de contraste sobre blanco) y en foco es de 2 px en tinta.

## Components

- **Botón principal:** relleno turquesa, texto tinta, 44 px de alto (`large`), un ícono `mdi` a la izquierda si ayuda.
- **Campo de búsqueda:** `outlined` con fondo blanco, etiqueta visible, ayuda fija de 14 px y botón de borrar con nombre en español. Toma el foco al abrir la pantalla.
- **Venta actual:** tarjeta con título h2, cuerpo (el estado vacío enseña qué hacer: «Busca un producto para empezar la venta») y franja del total pegada abajo.
- **AnimacionLottie:** decorativa (`aria-hidden`). Con menos movimiento muestra un cuadro fijo, el último por defecto.
- **Foco visible:** contorno de 3 px en tinta con 2 px de separación, y turquesa sobre la barra oscura.

## Do's and Don'ts

- Sí: texto siempre en tinta; colores del CSS desde las variables `--v-*-base`; revisar en `src/plugins/vuetify.css` el texto de cada componente nuevo de Vuetify.
- Sí: precios con 2 decimales y sin símbolo de moneda, en cifras tabulares.
- No: texto blanco sobre turquesa, ni coral o turquesa como texto sobre fondo claro.
- No: bordes de color de más de 1 px a un lado de una tarjeta o una alerta; sombras de adorno; mayúsculas en botones.
- No: apagar todas las animaciones con menos movimiento; los indicadores de carga siguen girando.
