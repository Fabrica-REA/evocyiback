/*
Descrição: API para a Página de cadastro da tabela Mensagem
Autor    : CYI 30/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/mensagemapi', async (req, res) => {
	const id = req.query.id;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL MensagemS(?)', 
		[id]);

      const json_results = results.map(row => ({
		id: row.Id,
				keyid: row.keyId,
				fromme: row.fromMe,
				foneid: row.foneId,
				mensagemid: row.MensagemId,
				mensagem: row.Mensagem,
				tipomensagemid: row.TipoMensagemId,
				messagetimestamp: row.messageTimestamp,
				datahora: row.DataHora,
		keyidmensagem: row.keyIdMensagem,
				descricaotipomensagem: row.DescricaoTipoMensagem,
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /mensagemapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validateMensagemInput = [
	body('mensagemid').optional({ values: 'falsy' }).isInt().withMessage('Código MensagemId deve ser um inteiro se informado.'),
	body('tipomensagemid').optional({ values: 'falsy' }).isInt().withMessage('Código TipoMensagemId deve ser um inteiro se informado.'),
	body('keyid').notEmpty().withMessage('keyId é obrigatória.'),
	body('foneid').notEmpty().withMessage('foneId é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/mensagemapi', validateMensagemInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { id, keyid, fromme, foneid, mensagemid, mensagem, tipomensagemid, messagetimestamp, datahora } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      let insertedId;

      if (!id) {
        query = `INSERT INTO Mensagem (keyId, fromMe, foneId, MensagemId, Mensagem, TipoMensagemId, messageTimestamp, DataHora) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		keyId = VALUES(keyId), fromMe = VALUES(fromMe), foneId = VALUES(foneId), MensagemId = VALUES(MensagemId), Mensagem = VALUES(Mensagem), TipoMensagemId = VALUES(TipoMensagemId), messageTimestamp = VALUES(messageTimestamp), DataHora = VALUES(DataHora)
		;`;
        queryParams = [keyid, fromme, foneid, mensagemid, mensagem, tipomensagemid, messagetimestamp, datahora];
      } else {
        query = `INSERT INTO Mensagem (Id, keyId, fromMe, foneId, MensagemId, Mensagem, TipoMensagemId, messageTimestamp, DataHora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		keyId = VALUES(keyId), fromMe = VALUES(fromMe), foneId = VALUES(foneId), MensagemId = VALUES(MensagemId), Mensagem = VALUES(Mensagem), TipoMensagemId = VALUES(TipoMensagemId), messageTimestamp = VALUES(messageTimestamp), DataHora = VALUES(DataHora)
		;`;

        queryParams = [id, keyid, fromme, foneid, mensagemid, mensagem, tipomensagemid, messagetimestamp, datahora];
      }

      await pool.query(query, queryParams);

      if (!id) {
        const [lastInsertIdResults] = await pool.query('SELECT LAST_INSERT_ID() as Id');
		insertedId = lastInsertIdResults[0].Id;
      } else {
        insertedId = id;
      }

      res.status(200).json({
        success: true,
        message: 'Atualizado com sucesso!',
        data: { id: insertedId },
      });

    } catch (err) {
      console.error('Erro ao atualizar:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });

const validateMensagemInputIU = [
	body('keyid').notEmpty().withMessage('keyId é obrigatória.'),
	body('foneid').notEmpty().withMessage('foneId é obrigatória.'),
];
router.post('/mensagemiu', validateMensagemInputIU, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { keyid, fromme, groupid, foneid, nome,    destipomensagem, mensagem, messagetimestamp, keyidmensagem, foneidmensagem,    quotedmsg, nomearquivo, mimetype, fileSha256 } = req.body;
//  console.log( nomearquivo, mimetype, fileSha256);
    try {
      const pool = await getPool();
        const [results] = await pool.query(
            'CALL spIU_Mensagem( ?, ?, ?, ?, ?,    ?, ?, ?, ?, ?,    ?, ?, ?, ?, @Id)', 
			[keyid, fromme, groupid, foneid, nome, 
        destipomensagem, mensagem, messagetimestamp, keyidmensagem, foneidmensagem, 
        quotedmsg, nomearquivo, mimetype, fileSha256 ]
		);

		const [id] = await pool.query('SELECT @Id as id');

        res.json({
            success: true,
            message: id ? 'Mensagem atualizada com sucesso' : 'Mensagem criada com sucesso',
            Id : id[0].id
        });
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  });
/* exemplo: ********* pode excluir comentários
const validateParams = [
  param('id').isInt().withMessage('Id must be an integer'),
  param('sequencia').notEmpty().withMessage('Sequencia cannot be empty'),
];
router.delete('/mensagemapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/mensagemapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsMensagemapid = [
  param('id').isInt().withMessage('Id must be an bigint unsigned'),
];
router.delete('/mensagemapid/:id', validateParamsMensagemapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover Mensagem", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const id = parseInt(req.params.id, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM Mensagem WHERE Id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar Mensagem:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

