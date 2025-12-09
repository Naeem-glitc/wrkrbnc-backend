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

    if (!user) {
      resp.status(404).json({ message: "User Not Found", success: false });
    }

    let isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      user = await Worker_schema.findOne({ Email: Email });
      role = "worker";
      isPasswordMatch = await bcrypt.compare(Password, user.Password);
    }

    const token = jwt.sign({ id: user._id, Email: user.Email, role }, process.env.My_Secret_Key, { expiresIn: '7d' });
    resp.status(200).cookie("token", token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    }).json({ message: "Login Successfully", success: true, role: role, id: user._id, token });


  } catch (error) {
    resp.status(500).json({ message: "Internal Server Error", success: false });
  }
}




const logout = (req, resp) => {
  try {

    // Clear the cookie with same options as login
    resp
      .clearCookie('token', {
        httpOnly: true,
        sameSite: 'strict',
        path: '/'
      })
      .status(200)
      .json({
        message: 'Logout Successful',
        success: true
      });

  } catch (error) {
    console.error('Logout error:', error);
    resp.status(500).json({
      message: 'Logout failed',
      success: false,
      error: error.message
    });
  }
}


export { userLogin, logout, };