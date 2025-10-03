import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import midtransClient from "midtrans-client";
import { createClient } from "@supabase/supabase-js"; // ← TAMBAHKAN INI
import adminRoutes from './routes/admin.js'; // ← TAMBAHKAN INI

// Load environment variables first
dotenv.config();

console.log('🔧 Environment Check:');
console.log('MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY ? 'SET' : 'NOT SET');
console.log('MIDTRANS_CLIENT_KEY:', process.env.MIDTRANS_CLIENT_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET'); // ← TAMBAHKAN
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET'); // ← TAMBAHKAN

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ==================== MOUNT ROUTES ====================
console.log('\n🔄 Mounting routes...');
app.use('/api/admin', adminRoutes); // ← TAMBAHKAN INI
console.log('✅ Admin routes mounted');

// Midtrans Configuration dengan error handling
let snap;
try {
  console.log('\n🔧 Initializing Midtrans...');
  snap = new midtransClient.Snap({
    isProduction: false, // MUST be false for sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY?.trim(),
    clientKey: process.env.MIDTRANS_CLIENT_KEY?.trim()
  });
  
  console.log('✅ Midtrans initialized successfully');
  console.log('   Environment: Sandbox');
  console.log('   Server Key:', process.env.MIDTRANS_SERVER_KEY?.substring(0, 15) + '...');
  
} catch (error) {
  console.error('❌ Midtrans initialization failed:', error.message);
  process.exit(1);
}

// ==================== ROUTES ====================

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is running",
    midtrans_configured: !!snap,
    environment: "sandbox",
    routes: {
      admin: "/api/admin/*",
      health: "/api/health", 
      test_midtrans: "/api/test-midtrans",
      checkout: "/api/checkout"
    }
  });
});

// Test Midtrans Connection
app.get("/api/test-midtrans", async (req, res) => {
  console.log('\n🧪 Testing Midtrans connection...');
  
  if (!snap) {
    return res.status(500).json({
      success: false,
      error: "Midtrans not configured"
    });
  }

  try {
    const testOrderId = 'test-order-' + Date.now();
    const testData = {
      transaction_details: {
        order_id: testOrderId,
        gross_amount: 10000
      },
      customer_details: {
        first_name: 'Test',
        last_name: 'Customer',
        email: 'test@example.com',
        phone: '08123456789'
      },
      item_details: [
        {
          id: 'item1',
          price: 10000,
          quantity: 1,
          name: 'Test Item'
        }
      ]
    };

    console.log('Test transaction data:', JSON.stringify(testData, null, 2));
    
    console.log('🚀 Calling Midtrans API...');
    const transaction = await snap.createTransaction(testData);
    
    console.log('✅ Midtrans response received');
    console.log('Response keys:', Object.keys(transaction));
    console.log('Has redirect_url:', !!transaction.redirect_url);
    console.log('Has token:', !!transaction.token);
    
    res.json({
      success: true,
      message: "Midtrans connection successful!",
      test_order_id: testOrderId,
      has_redirect_url: !!transaction.redirect_url,
      redirect_url: transaction.redirect_url,
      token: transaction.token,
      full_response: transaction
    });
    
  } catch (error) {
    console.error('❌ Midtrans test failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.httpStatusCode);
    
    if (error.ApiResponse) {
      console.error('Midtrans API Response:', error.ApiResponse);
    }
    
    res.status(500).json({
      success: false,
      error: "Midtrans connection failed",
      message: error.message,
      http_status: error.httpStatusCode,
      api_response: error.ApiResponse
    });
  }
});

// Main Checkout Endpoint
app.post("/api/checkout", async (req, res) => {
  console.log('\n💰 CHECKOUT PROCESS STARTED');
  
  if (!snap) {
    return res.status(500).json({
      success: false,
      error: "Payment gateway not configured"
    });
  }

  try {
    const { orderId, total, customer, paymentMethod } = req.body;

    console.log('📦 Order details:', {
      orderId,
      total,
      paymentMethod,
      customerName: customer?.nama
    });

    // Validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required"
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid total amount is required"
      });
    }

    // Prepare transaction data
    const transactionData = {
      transaction_details: {
        order_id: orderId.toString().trim(),
        gross_amount: parseInt(total)
      },
      customer_details: {
        first_name: (customer?.nama?.split(' ')[0] || 'Customer').substring(0, 255),
        last_name: (customer?.nama?.split(' ').slice(1).join(' ') || '').substring(0, 255),
        email: (customer?.email || 'customer@example.com').substring(0, 255),
        phone: customer?.telepon || '08123456789'
      },
      item_details: [
        {
          id: 'order-' + orderId,
          price: parseInt(total),
          quantity: 1,
          name: 'Order Payment'
        }
      ],
      enabled_payments: ['qris', 'gopay', 'bank_transfer', 'credit_card', 'cstore'],
      expiry: {
        unit: 'hours',
        duration: 24
      },
      callbacks: {
        finish: "http://localhost:3000/order-success",
        error: "http://localhost:3000/order-failed",
        pending: "http://localhost:3000/order-pending"
      }
    };

    console.log('🔄 Transaction data:', JSON.stringify(transactionData, null, 2));

    // Create transaction
    console.log('🚀 Sending to Midtrans API...');
    const transaction = await snap.createTransaction(transactionData);
    
    console.log('✅ Midtrans API Response:');
    console.log('   - Status: Success');
    console.log('   - Redirect URL:', transaction.redirect_url ? 'YES' : 'NO');
    console.log('   - Token:', transaction.token ? 'YES' : 'NO');
    console.log('   - Full response keys:', Object.keys(transaction));

    if (!transaction.redirect_url) {
      console.error('❌ No redirect_url in response');
      return res.status(500).json({
        success: false,
        error: "Payment gateway did not return redirect URL",
        midtrans_response: transaction
      });
    }

    // Success
    console.log('🎉 Checkout successful!');
    res.json({
      success: true,
      redirect_url: transaction.redirect_url,
      token: transaction.token,
      orderId: orderId
    });

  } catch (error) {
    console.error('❌ CHECKOUT ERROR:');
    console.error('   Error:', error.message);
    console.error('   HTTP Status:', error.httpStatusCode);
    
    if (error.ApiResponse) {
      console.error('   Midtrans API Response:', JSON.stringify(error.ApiResponse, null, 2));
    }
    
    let errorMessage = "Payment processing failed";
    
    if (error.httpStatusCode === 401) {
      errorMessage = "Invalid Midtrans server key. Please check your credentials.";
    } else if (error.httpStatusCode === 400) {
      errorMessage = "Invalid request data sent to payment gateway";
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      message: error.message,
      http_status: error.httpStatusCode,
      api_response: error.ApiResponse
    });
  }
});

// 404 Handler untuk route yang tidak ada
app.use("*", (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 BACKEND SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('\n📋 AVAILABLE ENDPOINTS:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/test-midtrans`);
  console.log(`   POST http://localhost:${PORT}/api/checkout`);
  console.log(`   POST http://localhost:${PORT}/api/admin/login`); // ← TAMBAHKAN
  console.log('\n🔧 MIDTRANS STATUS:');
  console.log(`   Environment: Sandbox`);
  console.log(`   Configured: ${!!snap ? '✅' : '❌'}`);
  console.log('='.repeat(50) + '\n');
});