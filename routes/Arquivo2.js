/*
	Descrição	: Componente de um input que usuário pode digitar o Arquivo ou selecionar de um combo
	Autor		: CYI
	Data		: 28/07/2025
*/
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/arquivoapi2', async (req, res) => {
	const id = req.query.id;
	try {
		const pool = await getPool();
		let query = 'SELECT Id, NomeArquivo FROM Arquivo';
		let params = [];
		if (id) {query += ' WHERE Id = ?'; params.push(id); };
		query += ' order by 2';
		const [results] = await pool.query(query, params);
		if (results.length === 0) {
			return res.status(404).json({ message: 'Arquivo não encontrado' });
		}
		const jsonResults = results.map(row => ({
			id: row.Id,
			nomearquivo: row.NomeArquivo,
		}));
		res.json(jsonResults);
	} catch (err) {
		console.error('Erro GET /arquivoapi2', err);
		res.status(500).json({ error: err.message });
	}
	});


const validateArquivo2Input = [
	body('nomearquivo').notEmpty().withMessage('NomeArquivo é obrigatória.'),
	
];
router.post('/arquivoapi2', validateArquivo2Input, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	  console.log('Validation errors:', errors.array());
	  return res.status(400).json({
		success: false,
		message: 'Dados de entrada inválidos',
		errors: errors.array(),
	  });
	}
	const {  nomearquivo } = req.body;
	try {
		const pool = await getPool();
		let query;
		let queryParams = [];
		let insertedId;
		query = `INSERT INTO Arquivo (`;
		
		queryParams.push(nomearquivo);
		query = query +`NomeArquivo) select  ? where not exists( select 1 from Arquivo where   NomeArquivo = ?);`;
		
		queryParams.push(nomearquivo);
		[resins] = await pool.query(query, queryParams);
		if (resins.affectedRows > 0) {
			const [lastInsertIdResults] = await pool.query('SELECT LAST_INSERT_ID() as Id');
			res.status(200).json({
				success: true,
				message: 'Atualizado com sucesso!',
				data: { id: lastInsertIdResults[0].Id },
			});
		} else {
			console.log(`arquivoapi2 registro existente com ${nomearquivo} (Arquivo)!`);
			res.status(501).json({
				success: false,
				message: `Já existe Arquivo com o valor ${nomearquivo}!`,
				data: { id: null },
			});
		}
	} catch (err) {
		console.error('Erro ao atualizar:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

module.exports = router;

