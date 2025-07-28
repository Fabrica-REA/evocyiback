/*
Descrição: API para a Página de cadastro da tabela TipoMensagem
Autor    : CYI 28/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/tipomensagemapi', async (req, res) => {
	const id = req.query.id;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL TipomensagemS(?)', [id]);

      const json_results = results.map(row => ({
		id: row.Id,
				descricao: row.Descricao,
		
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /tipomensagemapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validateTipoMensagemInput = [
	
	body('descricao').notEmpty().withMessage('Descricao é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/tipomensagemapi', validateTipoMensagemInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { id, descricao } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      query = `INSERT INTO TipoMensagem (Id, Descricao) VALUES (?, ?) ON DUPLICATE KEY UPDATE 
		Descricao = VALUES(Descricao)
		;`;

      queryParams = [id, descricao];

      await pool.query(query, queryParams);

      res.status(200).json({
        success: true,
        message: 'Atualizado com sucesso!',
        data: { id : id },
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
router.delete('/tipomensagemapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/tipomensagemapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsTipoMensagemapid = [
  param('id').isInt().withMessage('Id must be an tinyint unsigned'),
];
router.delete('/tipomensagemapid/:id', validateParamsTipoMensagemapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover TipoMensagem", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const id = parseInt(req.params.id, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM TipoMensagem WHERE Id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar TipoMensagem:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

