// const Koa = require('koa');
// const app = new Koa();
// const { koaBody } = require('koa-body');
// const router = require('./routes'); // Importa el router principal

// app.use(koaBody()); // Habilita el body parser para POST requests
// app.use(router.routes()); // Usa las rutas definidas en routes.js

// // Manejo de errores
// app.on('error', (err, ctx) => {
//   console.error('server error', err, ctx);
// });

// module.exports = app;



// app.js
const Koa = require('koa');
const { koaBody } = require('koa-body'); // ← Cambio aquí
const cors = require('@koa/cors');
const chatRoutes = require('./routes/chat.routes');
const info = require('./routes/personal_info');

const app = new Koa();

// Middlewares
app.use(cors());
app.use(koaBody()); // ← Cambio aquí
app.use(info.routes());

// Rutas
app.use(chatRoutes.routes());
app.use(chatRoutes.allowedMethods());

const PORT = 3001;
app.listen(PORT, () => {
      console.log(`Servidor Koa corriendo en puerto ${PORT}`);
});

module.exports = app;