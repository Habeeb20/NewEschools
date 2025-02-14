import Payment from "../models/payment.js";
import express from "express"
import axios from "axios"
import crypto from "crypto"


const paymentrouter = express.Router()


paymentrouter.post("/paystack/pay", async (req, res) => {
  const {email, amount } = req.body;
  
  const reference = crypto.randomBytes(12).toString('hex');
  const data = {
      email,
      amount: amount * 100, 
      reference,
  }

  try{
      const response = await axios.post('https://api.paystack.co/transaction/initialize', data, {
          headers:{
              Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
          }
      });

      const payment = new Payment({email, amount, reference, status:'pending'})
      await payment.save();

      res.status(200).json(response.data);
    

  }catch(error) {
      console.log(error)
      res.status(500).json({message: 'Payment initialization failed', error: error.message})
  }

});


paymentrouter.post("/paystack/verify", async (req, res) => {
  const {reference} = req.body;
  try {
  const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`,{
      headers: {
          Authorization: `Bearer ${process.env.paystack_Api}`,
      },
  })

  const payment = await Payment.findOne({referrence});
  if(response.data.data.status === 'success'){
      payment.status = 'success';
      await payment.save();
  }
  res.status(200).json(response.data)
  } catch (error) {
      res.status(500).json({message: "payment verification failed"})
  }
})


// paymentrouter.get("/payment-status", async(req, res) =>{
//     try {
//         const settings = await Settings.findOne();
//         res.json({ isPaymentActive: settings?.isPaymentActive || false });
//       } catch (error) {
//         res.status(500).json({ error: "Server Error" });
//       }
// })


// paymentrouter.put("/payment-status", async(req, res) => {
//     try {
//         const { isPaymentActive } = req.body;
//         let settings = await Settings.findOne();
    
//         if (!settings) {
//           settings = new Settings({ isPaymentActive });
//         } else {
//           settings.isPaymentActive = isPaymentActive;
//         }
    
//         await settings.save();
//         res.json({ message: "Payment status updated", isPaymentActive });
//       } catch (error) {
//         res.status(500).json({ error: "Server Error" });
//       }
// })

// paymentrouter.post("/verify-payment", async(req, res) => {
//     const { reference } = req.body;
  
//     try {
//       const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       });
  
//       if (response.data.status === true) {
//         res.json({ success: true, message: "Payment verified successfully", data: response.data });
//       } else {
//         res.status(400).json({ success: false, message: "Payment verification failed" });
//       }
//     } catch (error) {
//       res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
//   });
  

//   paymentrouter.post("/initialize-payment", async(req, res) => {
//     const { email, amount } = req.body; // Email and amount are sent from the frontend
  
//     try {
//       const response = await axios.post("https://api.paystack.co/transaction/initialize", {
//         email,
//         amount: amount * 100, // Amount should be in kobo (100 Kobo = ₦1)
//       }, {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//         },
//       });
  
//       if (response.data.status === true) {
//         res.json({ success: true, data: response.data.data });
//       } else {
//         res.status(400).json({ success: false, message: "Payment initialization failed" });
//       }
//     } catch (error) {
//       res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
//   });
  

export default paymentrouter