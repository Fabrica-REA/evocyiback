/*
Descrição: API para a Página de cadastro da tabela MensagemArquivo
Autor    : CYI 28/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/mensagemarquivoapi', async (req, res) => {
	const mensagemid = req.query.mensagemid;
	const sequencia = req.query.sequencia;
	const arquivoid = req.query.arquivoid;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL MensagemarquivoS(?,?,?)', 
		[mensagemid, sequencia, arquivoid]);

      const json_results = results.map(row => ({
		mensagemid: row.MensagemId,
				sequencia: row.Sequencia,
				arquivoid: row.ArquivoId,
		keyidmensagem: row.keyIdMensagem,
				nomearquivoarquivo: row.NomeArquivoArquivo,
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /mensagemarquivoapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validateMensagemArquivoInput = [
	
	
	body('mensagemid').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código MensagemId deve ser um inteiro positivo se informado.'),
	body('sequencia').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Sequencia deve ser um inteiro positivo se informado.'),
	body('arquivoid').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código ArquivoId deve ser um inteiro positivo se informado.'),
];
router.post('/mensagemarquivoapi', validateMensagemArquivoInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { mensagemid, sequencia, arquivoid } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      query = `INSERT INTO MensagemArquivo (MensagemId, Sequencia, ArquivoId) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE 
		
		;`;

      queryParams = [mensagemid, sequencia, arquivoid];

      await pool.query(query, queryParams);

      res.status(200).json({
        success: true,
        message: 'Atualizado com sucesso!',
        data: { mensagemid : mensagemid,sequencia : sequencia,arquivoid : arquivoid },
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
router.delete('/mensagemarquivoapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/mensagemarquivoapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsMensagemArquivoapid = [
  param('mensagemid').isInt().withMessage('MensagemId must be an bigint unsigned'),param('sequencia').isInt().withMessage('Sequencia must be an int unsigned'),param('arquivoid').isInt().withMessage('ArquivoId must be an bigint unsigned'),
];
router.delete('/mensagemarquivoapid/:mensagemid/ :sequencia/ :arquivoid', validateParamsMensagemArquivoapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover MensagemArquivo", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const mensagemid = parseInt(req.params.mensagemid, 10);const sequencia = parseInt(req.params.sequencia, 10);const arquivoid = parseInt(req.params.arquivoid, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM MensagemArquivo WHERE MensagemId=? and Sequencia=? and ArquivoId=?', [mensagemid, sequencia, arquivoid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar MensagemArquivo:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

