import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  userEmail: {
    type: String,
    default: ''
  },
  userPhone: {
    type: String,
    default: ''
  },
  userAddress: {
    type: String,
    default: ''
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ userPhone: 1 });
orderSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

const Order = mongoose.model('Order', orderSchema);

export default Order;