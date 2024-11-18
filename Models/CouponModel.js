import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
    // unique: true
  },
  couponAmount: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  expiresAt: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'used'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Coupon = mongoose.models.coupons || mongoose.model('Coupon', couponSchema);
export default Coupon;
