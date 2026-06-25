import nodemailer from 'nodemailer';
const escapeHtml = (unsafe) => {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        // 1. Connection to Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 2. The Professional Dolce Vita Template
        const mailOptions = {
            from: `"Dolce Vita Desserts" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to the Sweet Life! 🍰',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <div style="background-color: #d63384; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; letter-spacing: 3px; font-size: 28px;">DOLCE VITA</h1>
                    </div>
                    
                    <div style="padding: 40px; line-height: 1.8; color: #444;">
                        <h2 style="color: #333;">Hello, ${escapeHtml(userName)}!</h2>
                        <p>We are absolutely thrilled to welcome you to the <strong>Dolce Vita</strong> family.</p>
                        
                        <p>At Dolce Vita, we believe life is too short for average desserts. Whether you are craving our signature <strong>Lotus Biscoff Cheesecake</strong>, our creamy <strong>Tiramisu</strong>, or our specialty <strong>Donuts</strong>, we have something to make your day a little sweeter.</p>
                        
                        <div style="background-color: #fff4f8; padding: 25px; border-radius: 10px; border: 2px dashed #d63384; text-align: center; margin: 30px 0;">
                            <p style="margin: 0; font-weight: bold; color: #d63384; font-size: 14px;">YOUR EXCLUSIVE WELCOME GIFT</p>
                            <h3 style="margin: 10px 0; font-size: 32px; color: #333;">10% OFF</h3>
                            <p style="margin: 0; font-size: 15px;">Use code: <span style="background: #d63384; color: white; padding: 2px 8px; border-radius: 4px;">SWEETSTART</span> on your first order!</p>
                        </div>

                        <p>Check out our menu on the website and stay tuned for our upcoming flavors and roadside stall locations.</p>
                        
                        <p style="margin-top: 40px;">Happy Eating,<br><strong style="color: #d63384;">The Dolce Vita Team</strong></p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
                        <p>Handcrafted with Love | Dolce Vita Roadside Stall</p>
                        <p style="font-style: italic;">This is an automated message from our University Project Demo.</p>
                    </div>
                </div>
            `
        };

        // 3. Execution
        await transporter.sendMail(mailOptions);
        console.log(`✅ Professional email delivered to ${userEmail}`);
        return true;

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        return false;
    }
};

export default sendWelcomeEmail;