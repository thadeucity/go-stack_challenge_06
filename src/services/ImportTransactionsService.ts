import fs from 'fs';
import neatCsv from 'neat-csv';

import AppError from '../errors/AppError';

interface Request {
  csvPath: string;
}

interface ImportedTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ csvPath }: Request): Promise<ImportedTransaction[]> {
    const content = fs.readFileSync(csvPath, 'utf8');

    const transactions: ImportedTransaction[] = await neatCsv(content, {
      headers: ['title', 'type', 'value', 'category'],
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
