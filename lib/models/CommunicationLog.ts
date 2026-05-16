import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  date: { type: Date, required: true },
  points: { type: Number, default: 0 },
  notes: { type: String },
  tags: [{ type: String }],
  type: { type: String, enum: ['daily', 'special', 'conflict_resolution', 'routine', 'surprise'], default: 'daily' }
}, { timestamps: true });

communicationLogSchema.index({ coupleId: 1, date: -1 });

export const CommunicationLog = mongoose.models.CommunicationLog || mongoose.model('CommunicationLog', communicationLogSchema);
