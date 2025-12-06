import otpStore from "../services/otpStore.js";
import Client_schema from "../models/client_schema.js";

const varify_OTP_client = async (req, resp)=>{
    const {Email, otp}= req.body;

    const data = otpStore.get(Email);
    if(!data){
      return resp.status(402).json({message: 'No OTP request found', success: false});
    }

    if(Date.now() > data.expires){
        otpStore.delete(Email);
        return resp.status(400).json({message: 'OTP expired', success: false});
    }

    if(data.otp!== otp){
        return resp.status(405).json({message: 'Invalid OTP' ,success: false});
    }
   
    const { Name, City, Address, Password } = data;

    const newClient = new Client_schema({
        Name,
        Email,
        City,
        Address,
        Password,
       isVerified: true,
    });

    try {
        await newClient.save();
        otpStore.delete(Email);
        resp.status(200).json({message: 'User Created Successfully', success: true});
    } catch (error) {
        resp.status(500).json({message: 'Internal server error', success: false});
    }
};

export default varify_OTP_client;
