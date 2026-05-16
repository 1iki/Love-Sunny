import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  paidBy: { type: String, enum: ['partner1', 'partner2', 'joint'], required: true }
}, { timestamps: true });

transactionSchema.index({ coupleId: 1, date: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
