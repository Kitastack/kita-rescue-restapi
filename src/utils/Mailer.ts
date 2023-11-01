import nodemailer from "nodemailer";

var mailOptions = {
  from: process.env.MAIL_USER as string,
  to: "target@gmail.com",
  subject: "Rahasia",
  text: "noreply",
  html: "",
};
// read this
// https://stackoverflow.com/questions/19877246/nodemailer-with-gmail-and-nodejs#:~:text=I%20found%20the%20simplest%20method%2C%20described%20in%20this%20article%20mentioned%20in%20Greg%20T%27s%20answer%2C%20was%20to%20create%20an%20App%20Password%20which%20is%20available%20after%20turning%20on%202FA%20for%20the%20account.
export const nodeMailer = async (
  email: string,
  subject: string,
  message: string
): Promise<any> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    headers: {
      "x-priority": "1",
      "x-msmail-priority": "High",
      importance: "high",
    },
    auth: {
      user: process.env.MAIL_USER as string,
      pass: process.env.MAIL_PASS as string,
    },
  });
  if (email) {
    mailOptions.to = email;
    if (message) mailOptions.html = message;
    if (subject) mailOptions.subject = subject;
    return await new Promise((res, rej) => {
      transporter.sendMail(mailOptions, (err, info) => {
        console.log(info);
        if (err) {
          rej(err);
        }
        return res(info);
      });
    });
  }
  return null;
};
