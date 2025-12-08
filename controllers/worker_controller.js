import Worker_schema from '../models/Worker_schema.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import otpStore from '../services/otpStore.js';
import cloudinary from "../utalities/cloudnary.js";
import streamifier from "streamifier";
import { Resend } from 'resend';

const createworker = async (req, resp) => {
  const { First_Name, Last_Name, Email, City, Address, Profession, Password } = req.body;

  if (!First_Name || !Last_Name || !Email || !City || !Address || !Profession || !Password) {
    return resp.status(400).json({ message: 'Missing some fields', success: false });
  }

  try {
    const existingUser = await Worker_schema.findOne({ Email });
    if (existingUser) {
      return resp.status(409).json({ message: 'Worker already exists', success: false });
    }

    // Generate OTP and hash password
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(Password, 10);

    let uploadedImageUrl = null;

    // --- Upload Image to Cloudinary ---
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "workerbnc/workers" },
        (error, result) => {
          if (error) {
            console.log("Cloudinary Error:", error);
          }
        }
      );

      // Convert buffer to readable stream
      await new Promise((resolve, reject) => {
        streamifier.createReadStream(req.file.buffer).pipe(
          cloudinary.uploader.upload_stream(
            { folder: "workerbnc/workers" },
            (error, result) => {
              if (error) return reject(error);
              uploadedImageUrl = result.secure_url;
              resolve(result);
            }
          )
        );
      });
    }

    // Store OTP + worker data temporarily
    otpStore.set(Email, {
      First_Name,
      Last_Name,
      Email,
      City,
      Address,
      otp,
      Profession,
      Password: hashedPassword,
      Profile_Pic: uploadedImageUrl,
      Profile_Pic_PublicId: req.file ? uploadedImageUrl.split('/').pop().split('.')[0] : null,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send OTP email
    const resend = new Resend(process.env.Resend_API);

    await resend.emails.send({
      from: process.env.My_Email,
      to: Email,
      subject: 'Verify your email',
      html: `<p>Click to verify: <a href="${otp}">Verify Email</a></p>`
    });

    resp.status(200).json({ message: 'Signup successful! Check email for OTP.', success: true });

  } catch (error) {
    resp.status(500).json({ message: "Server error", success: false });

  }
};

export default createworker;
