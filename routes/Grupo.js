/*
Descrição: API para a Página de cadastro da tabela Grupo
Autor    : CYI 29/07/2025
*/
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/grupoapi', async (req, res) => {
	const id = req.query.id;
    try {
      const pool = await getPool(); 
      const [[results]] = await pool.query('CALL GrupoS(?)', 
		[id]);

      const json_results = results.map(row => ({
		id: row.Id,
				chatid: row.chatId,
				dono: row.Dono,
				titulo: row.Titulo,
				descricao: row.Descricao,
		
      }));

      res.json(json_results);
    } catch (err) {
      console.error('Erro GET /grupoapi', err);
      res.status(500).json({ "error": err.message });
    }
  });

const validateGrupoInput = [
	
	body('chatid').notEmpty().withMessage('chatId é obrigatória.'),
	body('dono').notEmpty().withMessage('Dono é obrigatória.'),
	body('titulo').notEmpty().withMessage('Titulo é obrigatória.'),
	body('id').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('Código Id deve ser um inteiro positivo se informado.'),
];
router.post('/grupoapi', validateGrupoInput, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
  const descricao = req.body.descricao === null || req.body.descricao === undefined ? '' : req.body.descricao;
    const { id, chatid, dono, titulo } = req.body;

    try {
      const pool = await getPool();
      let query;
      let queryParams;

      let insertedId;

      if (!id) {
        query = `INSERT INTO Grupo (chatId, Dono, Titulo, Descricao) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		chatId = VALUES(chatId), Dono = VALUES(Dono), Titulo = VALUES(Titulo), Descricao = VALUES(Descricao)
		;`;
        queryParams = [chatid, dono, titulo, descricao];
      } else {
        query = `INSERT INTO Grupo (Id, chatId, Dono, Titulo, Descricao) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE 
		chatId = VALUES(chatId), Dono = VALUES(Dono), Titulo = VALUES(Titulo), Descricao = VALUES(Descricao)
		;`;

        queryParams = [id, chatid, dono, titulo, descricao];
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

const validateGrupoInputIU = [
	
	body('chatid').notEmpty().withMessage('chatId é obrigatória.'),
	body('dono').notEmpty().withMessage('Dono é obrigatória.'),
	body('titulo').notEmpty().withMessage('Titulo é obrigatória.'),
];
router.post('/grupoiu', validateGrupoInputIU, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.errors.map(error => error.msg);
		return res.status(400).json({ 
			success: false, 
			message: 'Dados de entrada inválidos: ' + errorMessages.join(''),
			errors: errors.array() 
		});
	}
  const descricao = req.body.descricao === null || req.body.descricao === undefined ? '' : req.body.descricao;
    const { id, chatid, dono, titulo } = req.body;

    try {
      const pool = await getPool();
        const [results] = await pool.query(
            'CALL spIU_Grupo( 	?,  ?, ?, ?, ?,	@pout_Id )', 
			[id,  chatid, dono, titulo, descricao ]
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
router.delete('/grupoapid/:id/:sequencia', validateParams, async (req, res) => {

antigo:
const validateIdParam = param('id')
  .isInt({ min: 1 })
  .withMessage('Id must be a positive integer.');
router.delete('/grupoapid/:id', validateIdParam, async (req, res) => {
**** fazer: isInt está fixo, deve mudar de acordo com o tipo
*/
const validateParamsGrupoapid = [
  param('id').isInt().withMessage('Id must be an bigint unsigned'),
];
router.delete('/grupoapid/:id', validateParamsGrupoapid, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Parâmetros inválidos para remover Grupo", errors: errors.array() });
  }

	// mudar o tipo se necessario ***
  const id = parseInt(req.params.id, 10);
  const pool = await getPool();

  try {
    const [result] = await pool.query('DELETE FROM Grupo WHERE Id=?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Registro não encontrado!' });
    }
    return res.json({ success: true, message: 'Registro apagado com sucesso!' });
  } catch (err) {
    console.error('Erro ao apagar Grupo:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;

