import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    const transactionToRemove = await transactionsRepository.findOne(id);

    if (!transactionToRemove)
      throw new AppError('This transactions does not exist');

    await transactionsRepository.remove(transactionToRemove);
  }
}

export default DeleteTransactionService;
