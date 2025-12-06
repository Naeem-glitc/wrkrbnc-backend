import Worker_schema from "../models/Worker_schema.js";


const addService = async (req, resp)=>{
     const { title, price} = req.body;
     const {id} = req.params;

     try {
            if(!title || !price){
                return resp.status(400).json({message:"Please provide both title and price", success:false});
            }

             const worker = await Worker_schema.findById(id);
            if(!worker){
                return resp.status(404).json({message:"Worker not found", success:false});
            }

            worker.services.push({title, price});
            await worker.save();
            return resp.status(200).json({
                message: "Service added successfully",
                success: true,
                data: worker,
            })
     } catch (error) {
         return resp.status(500).json({message:"Internal Server Error", success:false});
     }
};

export default addService;