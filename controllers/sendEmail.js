// //npm install nodemailer
// import sendEmail from './emailService.js';
// const sendEmailFun = async(toString, subject, text, html)=>{
//     const result = await sendEmail (toString, subject, text, html);
//     if(result.success) {
//         return true;
//         result.status(200).json({massege: "Email sent successfully", massegeId: result.massegeId, error: false, success: true});
//     }
//     else{
//         return false;
//         result.status(500).json({massege: "Email not sent", error: true, success: false});
//     }
// }

// export default sendEmailFun;
import sendEmail from "./emailService.js";

const sendEmailFun = async ({to, subject, text, html}) => {
  const result = await sendEmail(to, subject, text, html);
  
  if (result.success) {
    console.log("✅ Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } else {
    console.error("❌ Email not sent:", result.error);
    return { success: false, error: result.error };
  }
};

export default sendEmailFun;
