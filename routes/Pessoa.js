/*
Descrição: API para a Página de cadastro da tabela Pessoa
Autor    : CYI 30/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/pessoaapi', async (req, res) => {
	const id = req.query.id;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL PessoaS(?)', 
		[id]);

      const json_results = results.map(row => ({
		id: row.Id,
				foneid: row.foneId,
				negocio: row.Negocio,
				descricao: row.Descricao,
				website: row.website,
				nome: row.Nome,
		
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /pessoaapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validatePessoaInput = [
	body('negocio').optional({ values: 'falsy' }).isInt().withMessage('Código Negocio deve ser um inteiro se informado.'),
	body('foneid').notEmpty().withMessage('foneId é obrigatória.'),
	body('descricao').notEmpty().withMessage('Descricao é obrigatória.'),
	body('website').notEmpty().withMessage('website é obrigatória.'),
	body('nome').notEmpty().withMessage('Nome é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/pessoaapi', validatePessoaInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { id, foneid, negocio, descricao, website, nome } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      let insertedId;

      if (!id) {
        query = `INSERT INTO Pessoa (foneId, Negocio, Descricao, website, Nome) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		foneId = VALUES(foneId), Negocio = VALUES(Negocio), Descricao = VALUES(Descricao), website = VALUES(website), Nome = VALUES(Nome)
		;`;
        queryParams = [foneid, negocio, descricao, website, nome];
      } else {
        query = `INSERT INTO Pessoa (Id, foneId, Negocio, Descricao, website, Nome) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		foneId = VALUES(foneId), Negocio = VALUES(Negocio), Descricao = VALUES(Descricao), website = VALUES(website), Nome = VALUES(Nome)
		;`;

        queryParams = [id, foneid, negocio, descricao, website, nome];
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

const validatePessoaInputIU = [
	body('foneid').notEmpty().withMessage('foneId é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/pessoaiu', validatePessoaInputIU, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
    const { id, foneid, negocio, descricao, website, nome } = req.body;

    try {
      const pool = await getPool();
        const [results] = await pool.query(
            'CALL spIU_Pessoa( 	?,  ?, ?, ?, ?, ?,	@pout_Id )', 
			[id,  foneid, negocio, descricao, website, nome ]
		);
        const [idResult] = await pool.query('SELECT @pout_Id as id');
        const insertedId = idResult[0].id;

        res.json({
            success: true,
            message: id ? 'Mensagem atualizada com sucesso' : 'Mensagem criada com sucesso',
            id: insertedId
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
router.delete('/pessoaapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/pessoaapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsPessoaapid = [
  param('id').isInt().withMessage('Id must be an int unsigned'),
];
router.delete('/pessoaapid/:id', validateParamsPessoaapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover Pessoa", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const id = parseInt(req.params.id, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM Pessoa WHERE Id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar Pessoa:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

