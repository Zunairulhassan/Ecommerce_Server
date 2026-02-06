import nodemailer from "nodemailer";

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail SMTP
    port: 465, 
    secure: true, 
    auth: {
        user: process.env.USER_EMAIL, // your SMTP username (email)
        pass: process.env.EMAIL_PASS, // your App Password
    },
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({   // <-- sendMail correct
            from: process.env.USER_EMAIL,           // <-- match .env
            to, 
            subject, 
            text, 
            html,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}

export default sendEmail;
