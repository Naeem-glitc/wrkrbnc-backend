import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: [2, "Service title must be at least 2 characters"],
        maxlength: [40, "Service title cannot exceed 40 characters"],
       
    },
    price: {
        type: Number,
    }
});

const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: [3, "Portfolio title must be at least 3 characters"],
    },
    image: {
        type: String,
    },
    image_public_id:{
        type: String,
        
    }
})

const User_Schema = new mongoose.Schema({
    First_Name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name cannot exceed 50 characters"],
    },
    Last_Name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    Email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    City: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    Profession: {
        type: String,
        required: true
    },

    Password: {
        type: String,
        required: true
    },
    
    Profile_Pic: {
        type: String,
        required: true,
        path: String
        
    },
    Profile_Pic_PublicId: 
    { type: String, 
      required: true 
    },
    isVarified:{
        type: Boolean,
        default: false
   },

    services: [serviceSchema],
    portfolio: [portfolioSchema],
    



})

const Worker_schema = mongoose.model('Workers_DB', User_Schema);
export default Worker_schema;