import Worker_schema from '../models/Worker_schema.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import otpStore from '../services/otpStore.js';
import cloudinary from "../utalities/cloudnary.js";
import streamifier from "streamifier";
import sgMail from '@sendgrid/mail';

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
     // 4. DEBUG: Check environment variable
        console.log('Checking API_KEY Key...');
        console.log('API_KEY exists:', !!process.env.API_KEY);
        console.log('API_KEY exists:', !!process.env.API_KEY);
        console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('Sendgrid') || k.includes('Sendgrid')));

        // 5. Send verification email
        sgMail.setApiKey(process.env.API_KEY); // Try both

        console.log('Attempting to send email to:', Email);

        const { data, error } = await sgMail.send({
            to: Email,
            from: 'workerbnc@gmail.com',
            subject: 'Verify Your Email - WorkerBNC',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4F46E5; padding: 20px; border-radius: 8px 8px 0 0; color: white;">
                        <h1 style="margin: 0;">WorkerBNC</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Email Verification</p>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #111827; margin-top: 0;">Hello ${First_Name},</h2>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Thank you for signing up with WorkerBNC! Please use the OTP below to verify your email address:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: white; border: 2px dashed #4F46E5; 
                                        padding: 20px; border-radius: 8px; display: inline-block;">
                                <div style="font-size: 32px; font-weight: bold; color: #4F46E5; 
                                            letter-spacing: 5px;">
                                    ${otp}
                                </div>
                            </div>
                        </div>
                        
                        <p style="color: #6B7280; font-size: 14px;">
                            This OTP will expire in 5 minutes. If you didn't request this, please ignore this email.
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px;">
                                Need help? Contact us at support@workerbnc.com
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        // 6. Check if email was sent successfully
        if (error) {
            console.error('sgMail API Error:', error);
            return resp.status(500).json({
                message: 'Failed to send verification email',
                success: false,
                error: error.message
            });
        }

        console.log('Email sent successfully! Email ID:', data?.id);

        // 7. Return success response
        resp.status(200).json({
            message: 'Signup successful! Please check your email for the OTP.',
            success: true,
            emailSent: true
        });

  } catch (error) {
    resp.status(500).json({ message: "Server error", success: false });

  }
};

export default createworker;
