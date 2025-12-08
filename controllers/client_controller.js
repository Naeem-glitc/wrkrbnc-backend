import Client_schema from "../models/client_schema.js";
import bcrypt from "bcryptjs";
import otpStore from "../services/otpStore.js";
import crypto from 'crypto';
import { Resend } from 'resend';


// API function to create a new client

const createclient = async (req, resp) => {

    const body = { ...req.body };
    console.log('Received client signup request:', body);
    const { Name, Email, City, Address, Password } = body;
    if (!Name || !Email || !City || !Address || !Password) {
        return resp.status(400).json({ message: 'All fields are required', success: false });
    }

    try {
        const existingClient = await Client_schema.findOne({ Email });
        if (existingClient) {
            return resp.status(400).json({ message: 'Client already exists', success: false });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(Password, 10);
        otpStore.set(Email, {
            Name,
            Email,
            City,
            Address,
            otp,
            Password: hashedPassword,
            expires: Date.now() + 5 * 60 * 1000
        })

        const resend = new Resend(process.env.Resend_API);

        await resend.emails.send({
            from:'WorkerBNC <onboarding@resend.dev>',
            to: Email,
            subject: 'Verify your email',
            html: `<p>Your OTP is ${otp}</p>`
        });


        resp.status(200).json({ message: 'Signup successful! Please check your email for the OTP.', success: true });




    } catch (error) {
        resp.status(500).json({ message: 'Internal server error', success: false });
    }

}


export default createclient;
