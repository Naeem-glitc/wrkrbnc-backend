import mongoose from "mongoose";


const client_schema = new mongoose.Schema({
    Name:{
        type: String,
        require: true,
    },

    Email:{
        type: String,
        require: true,
        unique: true
    },
    City:{
        type: String,
        require: true
    },
    Address:{
         type: String,
        require: true 
    },

    Password:{
        type: String,
        require: true,
    },
    isVarified:{
        type: Boolean
    }

})

const Client_schema = mongoose.model('Clients_DB', client_schema);
export default Client_schema;