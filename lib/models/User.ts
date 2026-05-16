import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'non-binary', 'other'] },
  name: { type: String },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
