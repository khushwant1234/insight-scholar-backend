// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import { User } from '../Models/userModel.js';

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // Create a new payment order
// export const createOrder = async (req, res) => {
//   try {
//     const { mentorId, userId, amount, currency } = req.body;

//     // Validate input
//     if (!mentorId || !userId || !amount) {
//       return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     // Create Razorpay order
//     const options = {
//       amount: amount * 100, // Razorpay takes amount in smallest currency unit (paise)
//       currency: currency || "INR",
//       receipt: `order_${Date.now()}_${userId}_${mentorId}`,
//       payment_capture: 1, // Auto capture payment
//     };

//     const order = await razorpay.orders.create(options);
    
//     res.json({
//       success: true,
//       order,
//       key_id: process.env.RAZORPAY_KEY_ID
//     });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ success: false, error: "Failed to create payment order" });
//   }
// };

// // Verify and process payment
// export const verifyPayment = async (req, res) => {
//   try {
//     const { 
//       paymentId, 
//       orderId, 
//       signature, 
//       mentorId, 
//       userId 
//     } = req.body;
    
//     // Verify signature
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(`${orderId}|${paymentId}`)
//       .digest('hex');
      
//     if (generatedSignature !== signature) {
//       return res.status(400).json({ success: false, error: "Invalid payment signature" });
//     }
    
//     // Update mentor and user statuses
//     const mentor = await User.findById(mentorId);
//     const student = await User.findById(userId);
    
//     if (!mentor || !student) {
//       return res.status(404).json({ success: false, error: "Mentor or user not found" });
//     }
    
//     // Update mentor's status
//     mentor.mentorDetails.isAssigned = true;
//     mentor.mentorDetails.assignedTo = userId;
//     mentor.mentorDetails.isPaid = true;
    
//     await mentor.save();
    
//     res.json({
//       success: true,
//       message: "Payment verified and mentor status updated"
//     });
//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     res.status(500).json({ success: false, error: "Payment verification failed" });
//   }
// };