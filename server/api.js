
/**
 * SCHOOLUP API (BACKEND MOCK)
 * This file illustrates how the real Node.js/Express backend would be structured
 * to interact with Zambian Mobile Money APIs (MTN/Airtel).
 */

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios'); // For real API calls

const app = express();
app.use(express.json());
app.use(cors());

// Mock Payment Aggregator Config
const MOMO_API_URL = 'https://api.aggregator.zm/v1'; 
const MOMO_API_KEY = process.env.MOMO_AGGREGATOR_KEY;

// API ROUTES

/**
 * INITIATE COLLECTION
 * Triggered when parent clicks "Pay" on the portal.
 */
app.post('/api/v1/payments/initiate', async (req, res) => {
  const { studentId, amount, phoneNumber, network, merchantAccount } = req.body;
  
  try {
    /** 
     * REAL-WORLD LOGIC:
     * const response = await axios.post(`${MOMO_API_URL}/collect`, {
     *   amount,
     *   currency: 'ZMW',
     *   externalId: `SCH-${Date.now()}`,
     *   payer: { partyId: phoneNumber, partyIdType: 'MSISDN' },
     *   payeeNote: `School Fees - Student ${studentId}`,
     *   payerMessage: `Authorize payment to SchoolUp`
     * }, { headers: { 'Authorization': `Bearer ${MOMO_API_KEY}` } });
     */
    
    // Simulate successful initiation and USSD push
    const txnId = 'ZM-' + Date.now();
    
    // Store pending transaction in Firestore
    // await db.collection('transactions').doc(txnId).set({
    //    studentId, amount, status: 'PENDING', createdAt: new Date()
    // });

    res.status(202).json({ 
      success: true, 
      transactionId: txnId,
      message: 'USSD Push triggered successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate MoMo payment' });
  }
});

/**
 * CALLBACK / WEBHOOK
 * The payment aggregator calls this once the user enters their PIN on their handset.
 */
app.post('/api/v1/payments/webhook', async (req, res) => {
  const { transactionId, status, amount, externalRef } = req.body;

  if (status === 'SUCCESSFUL') {
    // 1. Update Payment Record in database
    // 2. Generate PDF Receipt
    // 3. Trigger SMS Notification to Parent using local gateway (e.g., Macrokiosk or Broadnet)
    console.log(`Payment confirmed for TXN: ${transactionId}`);
  }
  
  res.status(200).send('OK');
});

// Start Server
// app.listen(5000, () => console.log('SchoolUp Payment API running on port 5000'));
