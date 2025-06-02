const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Check if email configuration exists
            if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                // Gmail/SMTP configuration
                this.transporter = nodemailer.createTransporter({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT) || 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
                this.isConfigured = true;
                console.log('📧 Email service configured with SMTP');
            } else if (process.env.SENDGRID_API_KEY) {
                // SendGrid configuration
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                this.sendgrid = sgMail;
                this.isConfigured = true;
                console.log('📧 Email service configured with SendGrid');
            } else {
                console.log('📧 Email service not configured - campaigns will be logged only');
            }
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            this.isConfigured = false;
        }
    }

    async sendEmail(to, subject, htmlContent, textContent = null) {
        if (!this.isConfigured) {
            // Log email instead of sending
            console.log('📧 Email would be sent:');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${textContent || htmlContent}`);
            return {
                success: true,
                message: 'Email logged (no email service configured)',
                messageId: `mock-${Date.now()}`
            };
        }

        try {
            if (this.transporter) {
                // Send via SMTP (Gmail, etc.)
                const mailOptions = {
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    to: to,
                    subject: subject,
                    html: htmlContent,
                    text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text
                };

                const result = await this.transporter.sendMail(mailOptions);
                return {
                    success: true,
                    message: 'Email sent successfully',
                    messageId: result.messageId
                };
            } else if (this.sendgrid) {
                // Send via SendGrid
                const msg = {
                    to: to,
                    from: process.env.EMAIL_FROM,
                    subject: subject,
                    html: htmlContent,
                    text: textContent || htmlContent.replace(/<[^>]*>/g, '')
                };

                const result = await this.sendgrid.send(msg);
                return {
                    success: true,
                    message: 'Email sent successfully via SendGrid',
                    messageId: result[0].headers['x-message-id']
                };
            }
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            return {
                success: false,
                message: 'Failed to send email',
                error: error.message
            };
        }
    }

    async sendCampaignEmail(customer, campaign, personalizedMessage) {
        const subject = campaign.subject || `${campaign.name}`;
        
        // Create HTML email template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Mini CRM</h1>
                    </div>
                    <div class="content">
                        ${personalizedMessage.replace(/\n/g, '<br>')}
                    </div>
                    <div class="footer">
                        <p>This email was sent from Mini CRM Platform</p>
                        <p>If you no longer wish to receive these emails, please contact us.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail(customer.email, subject, htmlContent, personalizedMessage);
    }

    // Test email configuration
    async testConfiguration() {
        if (!this.isConfigured) {
            return {
                success: false,
                message: 'Email service not configured'
            };
        }

        try {
            const testEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
            const result = await this.sendEmail(
                testEmail,
                'Mini CRM Email Test',
                '<h1>Email Configuration Test</h1><p>If you receive this email, your email configuration is working correctly!</p>',
                'Email Configuration Test - If you receive this email, your email configuration is working correctly!'
            );

            return result;
        } catch (error) {
            return {
                success: false,
                message: 'Email test failed',
                error: error.message
            };
        }
    }

    // Get email service status
    getStatus() {
        return {
            configured: this.isConfigured,
            service: this.transporter ? 'SMTP' : this.sendgrid ? 'SendGrid' : 'None',
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'Not configured'
        };
    }
}

// Export singleton instance
module.exports = new EmailService();
