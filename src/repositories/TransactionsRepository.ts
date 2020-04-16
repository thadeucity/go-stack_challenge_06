import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const reducer = (
      accumulator: Balance,
      transaction: Transaction,
    ): Balance => {
      accumulator[transaction.type] += +transaction.value;
      return accumulator;
    };

    const transactionRepository = getRepository(Transaction);

    const transactions = await transactionRepository.find();

    const balance = transactions.reduce(reducer, {
      income: 0,
      outcome: 0,
      total: 0,
    });

    balance.total = balance.income - balance.outcome;

    return balance;
  }
}

export default TransactionsRepository;
