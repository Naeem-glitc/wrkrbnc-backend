import Worker_schema from "../models/Worker_schema.js";

const getAllWorkers = async (req, resp)=>{
    try {
        
        const workers = await Worker_schema.find();
        if(workers.length === 0){
            return resp.status(200).json({message: 'No workers found', success:true, data: []});
        }

        resp.status(200).json({message: 'Workers retrieved successfully', success:true, data: workers});

       

    } catch (error) {
        resp.status(500).json({message: 'Internal server error', success:false} );
    }
}

export default getAllWorkers;
