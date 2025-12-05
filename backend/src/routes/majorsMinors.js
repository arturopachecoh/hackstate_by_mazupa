const Router = require('koa-router');
const router = new Router();
const data = require('../../mallas.json');

router.get('/majors-minors', async ctx => {
  const majors = data.getListadoMajor?.["{}"]?.map(m => ({
    codigo: m.CodMajor,
    nombre: m.Nombre,
    version: m.VersionMajor
  })) || [];

  const minors = data.getListadoMinor?.["{}"]?.map(min => ({
    codigo: min.CodMinor,
    nombre: min.Nombre,
    tipo: min.TipoMinor,
    version: min.VersionMinor
  })) || [];

  ctx.body = {
    majors,
    minors
  };
});

module.exports = router;

