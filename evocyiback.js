// npm install express cors mysql2 dotenv multer
// npm install express express-validator helmet express-rate-limit
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getPool } = require('./db');
// ________________ import routes ____________________
//const editoraRoutes = require('./routes/editora');
const pessoaRoutes = require('./routes/Pessoa');
const pessoa2Routes = require('./routes/Pessoa2');
const arquivoRoutes = require('./routes/Arquivo');
const arquivo2Routes = require('./routes/Arquivo2');
const reacaoRoutes = require('./routes/Reacao');
const reacao2Routes = require('./routes/Reacao2');
const mensagemRoutes = require('./routes/Mensagem');
const mensagem2Routes = require('./routes/Mensagem2');
const tipomensagemRoutes = require('./routes/TipoMensagem');
const pessoastatusRoutes = require('./routes/PessoaStatus');
const pessoastatus2Routes = require('./routes/PessoaStatus2');
const pessoafotoRoutes = require('./routes/PessoaFoto');
const mensagemarquivoRoutes = require('./routes/MensagemArquivo');
const grupoRoutes = require('./routes/Grupo');
const grupo2Routes = require('./routes/Grupo2');
// ____________________ end import routes ____________________
const app = express();
const skipLocalhost = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
  return ip === '127.0.0.1' || ip === '::1';
};
const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  },
  api: {
    prefix: '/whatscyiapi',
  },
  server: {
    port: process.env.PORT || 5006,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 50000,
    skip: skipLocalhost,
  },
};
const limiter = rateLimit(config.rateLimit);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);

//app.use(config.api.prefix, editoraRoutes);
app.use(config.api.prefix, pessoaRoutes);
app.use(config.api.prefix, pessoa2Routes);
app.use(config.api.prefix, arquivoRoutes);
app.use(config.api.prefix, arquivo2Routes);
app.use(config.api.prefix, reacaoRoutes);
app.use(config.api.prefix, reacao2Routes);
app.use(config.api.prefix, mensagemRoutes);
app.use(config.api.prefix, mensagem2Routes);
app.use(config.api.prefix, tipomensagemRoutes);
app.use(config.api.prefix, pessoastatusRoutes);
app.use(config.api.prefix, pessoastatus2Routes);
app.use(config.api.prefix, pessoafotoRoutes);
app.use(config.api.prefix, mensagemarquivoRoutes);
app.use(config.api.prefix, grupoRoutes);
app.use(config.api.prefix, grupo2Routes);
// ____________________ use routes ____________________
app.use((req, res, next) => {
  console.log(`Requisição: ${req.url}`);
  next();
});

//app.use((err, req, res, next) => {
//  console.error(err.stack);
//  res.status(500).json({ success: false, message: 'Internal Server Error' });
//});
async function startServer() {
  try {
    await getPool(config.db, config.db.connectionLimit);
    app.listen(config.server.port, '0.0.0.0', () => {
      console.log(`Server listening on port ${config.server.port}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
  }
}

startServer();

// curl http://200.17.199.250:5006/whatscyiapi/tipomensagemapi
