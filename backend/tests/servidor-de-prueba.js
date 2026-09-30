// Servidor de las pruebas que llaman a la API con supertest. No es un archivo de pruebas: Vitest solo corre *.test.js.
//
// Con request(app), supertest abre un servidor nuevo en todas las interfaces y le manda la petición a 127.0.0.1. Si
// otro programa de la máquina (el IDE, Docker, Postman) ya escucha solo en 127.0.0.1 en ese puerto, la petición cae en
// ese programa y la prueba recibe una respuesta que no es de la API (issue #58). Un servidor atado a 127.0.0.1 no puede
// compartir el puerto con otro que escuche en esa misma dirección.

// Abre la app en un puerto al azar de 127.0.0.1 y devuelve el servidor, para usarlo como request(servidor).
// Con un host, listen() se ata de forma asíncrona: hay que esperar 'listening'. Si no, supertest ve que el servidor
// todavía no tiene dirección y abre el suyo en todas las interfaces, y no se arregla nada.
export async function abrirServidorDePrueba(app) {
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise((resolver, rechazar) => {
    servidor.once('listening', resolver);
    servidor.once('error', rechazar);
  });
  return servidor;
}

// Cierra el servidor, también las conexiones que quedaron abiertas.
export function cerrarServidorDePrueba(servidor) {
  return new Promise((resolver) => {
    servidor.close(resolver);
    servidor.closeAllConnections();
  });
}
