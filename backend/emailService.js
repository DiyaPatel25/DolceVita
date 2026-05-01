import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Dolce Vita Desserts" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to Dolce Vita! 🍰',
            html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="background-color: #d63384; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; letter-spacing: 2px;">DOLCE VITA</h1>
                    </div>
                    
                    <div style="padding: 30px; line-height: 1.6; color: #444;">
                        <h2 style="color: #333;">Hello, ${userName}!</h2>
                        <p>We are absolutely thrilled to welcome you to the <strong>Dolce Vita</strong> family.</p>
                        
                        <p>At Dolce Vita, we believe that life is too short for average desserts. Whether you are craving our signature <strong>Biscoff Cheesecake</strong>, our creamy <strong>Tiramisu</strong>, or our specialty <strong>Donuts</strong>, we have something to make your day a little sweeter.</p>
                        
                        <div style="background-color: #fff4f8; padding: 20px; border-radius: 8px; border: 1px dashed #d63384; text-align: center; margin: 20px 0;">
                            <p style="margin: 0; font-weight: bold; color: #d63384;">YOUR EXCLUSIVE WELCOME GIFT</p>
                            <h3 style="margin: 10px 0; font-size: 24px;">10% OFF</h3>
                            <p style="margin: 0; font-size: 14px;">Use code: <strong>SWEETSTART</strong> on your first order!</p>
                        </div>

                        <p>Check out our menu on the website and stay tuned for our upcoming flavors and roadside stall locations.</p>
                        
                        <p>Happy Eating,<br><strong>The Dolce Vita Team</strong></p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                        <p>This is a student project for University Demo purposes.<br>
                        Dolce Vita Roadside Stall | Handcrafted with Love</p>
                    </div>
                </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Success! Email sent.');
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
};

export default sendWelcomeEmail;
