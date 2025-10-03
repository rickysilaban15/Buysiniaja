// routes/checkout.js - tambahkan endpoint ini
app.post('/api/create-payment', async (req, res) => {
  try {
    const { orderId, orderNumber, total, paymentMethod, customer } = req.body;

    console.log('Create payment request:', { orderId, paymentMethod, total });

    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: total
      },
      customer_details: {
        first_name: customer?.name?.split(' ')[0] || 'Customer',
        last_name: customer?.name?.split(' ').slice(1).join(' ') || '',
        email: customer?.email || 'customer@example.com',
        phone: customer?.phone || '08123456789'
      },
      expiry: {
        unit: 'hours',
        duration: 24
      }
    };

    // Enable specific payment method
    switch (paymentMethod) {
      case 'qris':
        transactionData.enabled_payments = ['qris'];
        break;
      case 'gopay':
        transactionData.enabled_payments = ['gopay'];
        break;
      case 'bank_transfer':
        transactionData.enabled_payments = ['bank_transfer'];
        break;
      case 'cstore':
        transactionData.enabled_payments = ['cstore'];
        break;
      case 'credit_card':
        transactionData.enabled_payments = ['credit_card'];
        break;
      default:
        transactionData.enabled_payments = ['qris'];
    }

    const transaction = await snap.createTransaction(transactionData);
    
    console.log('Payment transaction created:', {
      orderId,
      paymentMethod,
      redirect_url: transaction.redirect_url
    });

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId: orderId,
      paymentMethod: paymentMethod
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: error.message });
  }
});