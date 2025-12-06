import Worker_schema from "../models/Worker_schema.js";
import jwt from "jsonwebtoken";


const check_worker = async(req, resp, next)=>{
    try {
        const {id} = req.params;
     const worker_confermation = await Worker_schema.findById(id);
     if(!worker_confermation){
        resp.status(404).json({message:"not found", success:false})
     }

     next();
        
    } catch (error) {
        resp.status(500).json({message:"Internal server error", success:false})
    }
     
};
// middleware/auth.js

const authenticate = (req, res, next) => {
  const token = req.cookies.token; // JWT stored in HttpOnly cookie
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.My_Secret_Key);
    req.user = decoded; // attach decoded info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

// Role-based authorization
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
    }
    next();
  };
};


export { check_worker, authenticate, authorize };

