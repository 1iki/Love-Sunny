import mongoose from 'mongoose';

const hormonalCycleSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  lastPeriodStart: { type: Date, required: true },
  cycleLength: { type: Number, default: 28 },
  periodLength: { type: Number, default: 5 },
  notes: { type: String }
}, { timestamps: true });

hormonalCycleSchema.index({ coupleId: 1, lastPeriodStart: -1 });

export const HormonalCycle = mongoose.models.HormonalCycle || mongoose.model('HormonalCycle', hormonalCycleSchema);
