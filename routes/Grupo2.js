/*
	Descrição	: Componente de um input que usuário pode digitar o Grupo ou selecionar de um combo
	Autor		: CYI
	Data		: 29/07/2025
*/
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/grupoapi2', async (req, res) => {
	const id = req.query.id;
	try {
		const pool = await getPool();
		let query = 'SELECT Id, chatId FROM Grupo';
		let params = [];
		if (id) {query += ' WHERE Id = ?'; params.push(id); };
		query += ' order by 2';
		const [results] = await pool.query(query, params);
		if (results.length === 0) {
			return res.status(404).json({ message: 'Grupo não encontrado' });
		}
		const jsonResults = results.map(row => ({
			id: row.Id,
			chatid: row.chatId,
		}));
		res.json(jsonResults);
	} catch (err) {
		console.error('Erro GET /grupoapi2', err);
		res.status(500).json({ error: err.message });
	}
	});


const validateGrupo2Input = [
	body('chatid').notEmpty().withMessage('chatId é obrigatória.'),
	
];
router.post('/grupoapi2', validateGrupo2Input, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	  console.log('Validation errors:', errors.array());
	  return res.status(400).json({
		success: false,
		message: 'Dados de entrada inválidos',
		errors: errors.array(),
	  });
	}
	const {  chatid } = req.body;
	try {
		const pool = await getPool();
		let query;
		let queryParams = [];
		let insertedId;
		query = `INSERT INTO Grupo (`;
		
		queryParams.push(chatid);
		query = query +`chatId) select  ? where not exists( select 1 from Grupo where   chatId = ?);`;
		
		queryParams.push(chatid);
		[resins] = await pool.query(query, queryParams);
		if (resins.affectedRows > 0) {
			const [lastInsertIdResults] = await pool.query('SELECT LAST_INSERT_ID() as Id');
			res.status(200).json({
				success: true,
				message: 'Atualizado com sucesso!',
				data: { id: lastInsertIdResults[0].Id },
			});
		} else {
			console.log(`grupoapi2 registro existente com ${chatid} (Grupo)!`);
			res.status(501).json({
				success: false,
				message: `Já existe Grupo com o valor ${chatid}!`,
				data: { id: null },
			});
		}
	} catch (err) {
		console.error('Erro ao atualizar:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

module.exports = router;

