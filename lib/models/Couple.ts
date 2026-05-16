import mongoose from 'mongoose';

const coupleSchema = new mongoose.Schema({
  partner1Name: { type: String, required: true },
  partner2Name: { type: String, required: true },
  startDate: { type: Date, required: true },
  relationshipPoints: { type: Number, default: 0 },
}, { timestamps: true });

export const Couple = mongoose.models.Couple || mongoose.model('Couple', coupleSchema);
