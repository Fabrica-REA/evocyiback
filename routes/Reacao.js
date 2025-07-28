/*
Descrição: API para a Página de cadastro da tabela Reacao
Autor    : CYI 28/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/reacaoapi', async (req, res) => {
	const id = req.query.id;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL ReacaoS(?)', [id]);

      const json_results = results.map(row => ({
		id: row.Id,
		keyid: row.keyId,
		fromme: row.fromMe,
		foneid: row.foneId,
		mensagemid: row.MensagemId,
		text: row.Text,
		keyidmensagem: row.keyIdMensagem,
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /reacaoapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validateReacaoInput = [
	body('mensagemid').optional({ values: 'falsy' }).isInt().withMessage('Código MensagemId deve ser um inteiro se informado.'),
	body('keyid').notEmpty().withMessage('keyId é obrigatória.'),
	body('foneid').notEmpty().withMessage('foneId é obrigatória.'),
	body('text').notEmpty().withMessage('Text é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/reacaoapi', validateReacaoInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { id, keyid, fromme, foneid, mensagemid, text } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      let insertedId;

      if (!id) {
        query = `INSERT INTO Reacao (keyId, fromMe, foneId, MensagemId, Text) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		keyId = VALUES(keyId), fromMe = VALUES(fromMe), foneId = VALUES(foneId), MensagemId = VALUES(MensagemId), Text = VALUES(Text)
		;`;
        queryParams = [keyid, fromme, foneid, mensagemid, text];
      } else {
        query = `INSERT INTO Reacao (Id, keyId, fromMe, foneId, MensagemId, Text) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		keyId = VALUES(keyId), fromMe = VALUES(fromMe), foneId = VALUES(foneId), MensagemId = VALUES(MensagemId), Text = VALUES(Text)
		;`;

        queryParams = [id, keyid, fromme, foneid, mensagemid, text];
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

/* exemplo: ********* pode excluir comentários
const validateParams = [
  param('id').isInt().withMessage('Id must be an integer'),
  param('sequencia').notEmpty().withMessage('Sequencia cannot be empty'),
];
router.delete('/reacaoapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/reacaoapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsReacaoapid = [
  param('id').isInt().withMessage('Id must be an bigint unsigned'),
];
router.delete('/reacaoapid/:id', validateParamsReacaoapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover Reacao", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const id = parseInt(req.params.id, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM Reacao WHERE Id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar Reacao:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

