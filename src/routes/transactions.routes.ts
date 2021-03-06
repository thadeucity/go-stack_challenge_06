import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (req, res) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionsRepository.getBalance();
  const transactions = await transactionsRepository.find();

  const response = {
    transactions,
    balance,
  };

  return res.json(response);
});

transactionsRouter.post('/', async (req, res) => {
  const { title, value, type, category } = req.body;

  if (type === 'outcome') {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (balance.total < value)
      throw new AppError(
        'You cannot move more money than you currently have in your account!',
      );
  }

  const createTransaction = new CreateTransactionService();
  const createCategory = new CreateCategoryService();

  const newCategory = await createCategory.execute({ title: category });

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category: newCategory.id,
  });

  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return res.json({ message: 'deleted' });
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const importTransactions = new ImportTransactionsService();

  const createTransaction = new CreateTransactionService();
  const createCategory = new CreateCategoryService();

  const transactions = await importTransactions.execute({
    csvPath: req.file.path,
  });

  const transactionsPromises = transactions.reduce(
    async (
      transactionsList: Promise<Transaction[]>,
      transaction: Transaction,
    ): Promise<Transaction[]> => {
      const { category_name, title, value, type } = transaction;

      const acc = await Promise.resolve(transactionsList);

      const newCategory = await createCategory.execute({
        title: category_name,
      });

      const newTransaction = await createTransaction.execute({
        title,
        value,
        type,
        category: newCategory.id,
      });

      acc.push(newTransaction);

      return Promise.resolve(acc);
    },
    Promise.resolve([]),
  );

  const createdTransactions = await Promise.resolve(transactionsPromises);

  return res.json(createdTransactions);
});

export default transactionsRouter;
