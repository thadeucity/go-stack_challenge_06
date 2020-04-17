import fs from 'fs';
import neatCsv from 'neat-csv';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  csvPath: string;
}

class ImportTransactionsService {
  async execute({ csvPath }: Request): Promise<Transaction[]> {
    const content = fs.readFileSync(csvPath, 'utf8');

    const transactions: Transaction[] = await neatCsv(content, {
      headers: ['title', 'type', 'value', 'category_name'],
      mapValues: ({ header, value }) =>
        header === 'value' ? Number(value) : value.trim(),
      strict: true,
      skipLines: 1,
    });

    if (!transactions) {
      throw new AppError('There is something wrong with your CSV file');
    }

    return transactions;
  }
}

export default ImportTransactionsService;
