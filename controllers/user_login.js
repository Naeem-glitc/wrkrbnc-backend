import jwt from 'jsonwebtoken';
import Client_schema from '../models/client_schema.js';
import Worker_schema from '../models/Worker_schema.js';
import bcrypt from "bcryptjs";


const userLogin = async (req, resp) => {
  console.log(req.body);
  const { Email, Password } = req.body;
  try {

    let user = await Client_schema.findOne({ Email: Email });
    let role = "client";
    if (!user) {
      user = await Worker_schema.findOne({ Email: Email });
      role = "worker";
    }
     
    if (!user){
      resp.status(404).json({ message: "User Not Found", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      resp.status(401).json({ message: "Invalid Credentials", success: false })
    }

    const token = jwt.sign({ id: user._id, Email: user.Email, role }, process.env.My_Secret_Key,{expiresIn: '7d'});
    resp.status(200).cookie("token", token).json({ message: "Login Successfully", success: true,role: role, id: user._id,token });


  } catch (error) {
    resp.status(500).json({ message: "Internal Server Error", success: false });
  }
}




const logout = (req, resp)=>{
  resp.clearCookie("token").status(200).json({message:"Logout Successfully", success:true});
}


export { userLogin, logout, };