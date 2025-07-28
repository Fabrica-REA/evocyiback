/*
	Descrição	: Componente de um input que usuário pode digitar o PessoaStatus ou selecionar de um combo
	Autor		: CYI
	Data		: 28/07/2025
*/
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { getPool } = require('../db');

router.get('/pessoastatusapi2', async (req, res) => {
	const pessoaid = req.query.pessoaid;const sequencia = req.query.sequencia;
	try {
		const pool = await getPool();
		let query = 'SELECT PessoaId, Sequencia, Estatus FROM PessoaStatus';
		let params = [];
		if (pessoaid) {query += ' WHERE PessoaId = ?'; params.push(pessoaid); };
		 if (Sequencia) {query += ' WHERE Sequencia = ?'; params.push('Sequencia'.toLowerCase()); }; 
		query += ' order by 2';
		const [results] = await pool.query(query, params);
		if (results.length === 0) {
			return res.status(404).json({ message: 'PessoaStatus não encontrado' });
		}
		const jsonResults = results.map(row => ({
			pessoaid: row.PessoaId,
			sequencia: row.Sequencia,
			estatus: row.Estatus,
		}));
		res.json(jsonResults);
	} catch (err) {
		console.error('Erro GET /pessoastatusapi2', err);
		res.status(500).json({ error: err.message });
	}
	});


const validatePessoaStatus2Input = [
	body('estatus').notEmpty().withMessage('Estatus é obrigatória.'),
	body('pessoaid').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Código PessoaId deve ser um inteiro se informado.'),
		body('sequencia').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Código Sequencia deve ser um inteiro se informado.'),
];
router.post('/pessoastatusapi2', validatePessoaStatus2Input, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
	  console.log('Validation errors:', errors.array());
	  return res.status(400).json({
		success: false,
		message: 'Dados de entrada inválidos',
		errors: errors.array(),
	  });
	}
	const { pessoaid,sequencia, estatus } = req.body;
	try {
		const pool = await getPool();
		let query;
		let queryParams = [];
		let inserted;
		query = `INSERT INTO PessoaStatus (`;
		if (!pessoaid) {query += 'PessoaId, '; queryParams = [pessoaid];}
		if (!sequencia) {query += 'Sequencia, '; queryParams = [sequencia];}
		queryParams.push(estatus);
		query = query +`Estatus) select ?, ?,  ? where not exists( select 1 from PessoaStatus where  PessoaId = ? and Sequencia = ? Estatus = ?);`;
		queryParams.push(pessoaid);
		queryParams.push(sequencia);
		queryParams.push(estatus);
		[resins] = await pool.query(query, queryParams);
		if (resins.affectedRows > 0) {
			const [lastInsertIdResults] = await pool.query('SELECT LAST_INSERT_ID() as Id');
			res.status(200).json({
				success: true,
				message: 'Atualizado com sucesso!',
				data: { id: lastInsertIdResults[0].Id },
			});
		} else {
			console.log(`pessoastatusapi2 registro existente com ${estatus} (PessoaStatus)!`);
			res.status(501).json({
				success: false,
				message: `Já existe PessoaStatus com o valor ${estatus}!`,
				data: { id: null },
			});
		}
	} catch (err) {
		console.error('Erro ao atualizar:', err);
		res.status(500).json({ success: false, message: 'Server error', error: err.message });
	}
});

module.exports = router;

