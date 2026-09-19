import mongoose from 'mongoose';

const ContributorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the contributor name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a valid phone number'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'Please provide a WhatsApp number'],
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    place: {
      type: String,
      required: [true, 'Please specify city / place'],
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI'],
       required: [true, 'Select payment mode: Cash or UPI'],
    },
    shares: {
      type: Number,
      required: true,
      min: [1, 'Shares must be at least 1'],
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    refundStatus: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Contributor || mongoose.model('Contributor', ContributorSchema);