const express = require('express');
const router = express.Router();
const { getAllTransactions, addTransaction, deleteTransaction } = require('../controllers/transactionController');

router
  .route('/')
  .get(getAllTransactions)
  .post(addTransaction);

router
  .route('/:id')
  .delete(deleteTransaction);

module.exports = router;