import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.My_Email,
        pass: process.env.My_Password,
    }
});

export default transporter;
