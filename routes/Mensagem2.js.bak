/*
	Descrição	: Componente de um input que usuário pode digitar o Mensagem ou selecionar de um combo
	Autor		: CYI
	Data		: 28/07/2025
*/
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/mensagemapi2', async (req, res) => {
	const id = req.query.id;
	try {
		const pool = await getPool();
		let query = 'SELECT Id, keyId FROM Mensagem';
		let params = [];
		if (id) {query += ' WHERE Id = ?'; params.push(id); };
		query += ' order by 2';
		const [results] = await pool.query(query, params);
		if (results.length === 0) {
			return res.status(404).json({ message: 'Mensagem não encontrado' });
		}
		const jsonResults = results.map(row => ({
			id: row.Id,
			keyid: row.keyId,
		}));
		res.json(jsonResults);
	} catch (err) {
		console.error('Erro GET /mensagemapi2', err);
		res.status(500).json({ error: err.message });
	}
	});


const validateMensagem2Input = [
	body('keyid').notEmpty().withMessage('keyId é obrigatória.'),
	
];
router.post('/mensagemapi2', validateMensagem2Input, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	  console.log('Validation errors:', errors.array());
	  return res.status(400).json({
		success: false,
		message: 'Dados de entrada inválidos',
		errors: errors.array(),
	  });
	}
	const {  keyid } = req.body;
	try {
		const pool = await getPool();
		let query;
		let queryParams = [];
		let insertedId;
		query = `INSERT INTO Mensagem (`;
		
		queryParams.push(keyid);
		query = query +`keyId) select  ? where not exists( select 1 from Mensagem where   keyId = ?);`;
		
		queryParams.push(keyid);
		[resins] = await pool.query(query, queryParams);
		if (resins.affectedRows > 0) {
			const [lastInsertIdResults] = await pool.query('SELECT LAST_INSERT_ID() as Id');
			res.status(200).json({
				success: true,
				message: 'Atualizado com sucesso!',
				data: { id: lastInsertIdResults[0].Id },
			});
		} else {
			console.log(`mensagemapi2 registro existente com ${keyid} (Mensagem)!`);
			res.status(501).json({
				success: false,
				message: `Já existe Mensagem com o valor ${keyid}!`,
				data: { id: null },
			});
		}
	} catch (err) {
		console.error('Erro ao atualizar:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

module.exports = router;

