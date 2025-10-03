// services/emailService.ts
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendPinRecoveryEmail(email: string, orders: any[]) {
    const subject = 'PIN Tracking Pesanan Anda';
    
    const html = this.generateRecoveryEmailHTML(orders);
    const text = this.generateRecoveryEmailText(orders);

    try {
      // Method 1: Using Supabase Edge Functions (Recommended)
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to: email, subject, html, text }
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Fallback: Log untuk sementara (dalam production, gunakan service email yang reliable)
      console.log('Email yang akan dikirim:', { to: email, subject, html });
      
      return { success: false, error };
    }
  }

  private static generateRecoveryEmailHTML(orders: any[]): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .order-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .pin { font-size: 18px; font-weight: bold; color: #2563eb; font-family: monospace; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PIN Tracking Pesanan Anda</h1>
        </div>
        
        <p>Halo,</p>
        <p>Berikut adalah PIN tracking untuk pesanan Anda:</p>
        
        ${orders.map(order => `
        <div class="order-card">
            <h3>Pesanan #${order.order_number}</h3>
            <p><strong>PIN Tracking:</strong> <span class="pin">${order.tracking_pin}</span></p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Tanggal Pesanan:</strong> ${new Date(order.created_at).toLocaleDateString('id-ID')}</p>
        </div>
        `).join('')}
        
        <p>Gunakan PIN di atas untuk melacak status pesanan Anda di website kami.</p>
        
        <div class="footer">
            <p>Jika Anda tidak meminta email ini, silakan abaikan.</p>
            <p>Terima kasih,<br>Tim Layanan Pelanggan</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private static generateRecoveryEmailText(orders: any[]): string {
    return `PIN Tracking Pesanan Anda

Berikut adalah PIN tracking untuk pesanan Anda:

${orders.map(order => `
Pesanan #${order.order_number}
PIN Tracking: ${order.tracking_pin}
Status: ${order.status}
Tanggal Pesanan: ${new Date(order.created_at).toLocaleDateString('id-ID')}
`).join('\n')}

Gunakan PIN di atas untuk melacak status pesanan Anda di website kami.

Jika Anda tidak meminta email ini, silakan abaikan.

Terima kasih,
Tim Layanan Pelanggan
    `;
  }
}