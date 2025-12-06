import Worker_schema from "../models/Worker_schema.js";
import Client_schema from "../models/client_schema.js";

const get_workerInfo = async (req, resp) => {
    try {
        const { id } = req.params;
        const user = await Worker_schema.findOne({ _id: id });
        if (!user) {
            resp.status(404).json({ message: "User not found", success: false });
        }

        if (user) {
            resp.status(200).json({ message: "User found", success: true, data: user });
        }
    } catch (error) {
        resp.status(500).json({ message: "some thing went wrong", error, success: false })
    }



};


const get_ClientInfo = async (req, resp) => {
    try {
        const { id } = req.params;
        const client = await Client_schema.findById({ _id: id });
        if (!client) {
            resp.status(404).json({ message: "User not Found", success: false })
        }
        resp.status(200).json({ message: "User found", success: true, data: client })
    } catch (error) {
        resp.status(500).json({ message: "some thing went wrong", error, success: false })
    }


}

// api to get all worker by user query

const get_query = async (req, resp) => {
  try {

    const { query } = req.query; 
    if (!query || !query.trim()) {
      return resp.status(400).json({ message: "Type to search", success: false });
    }

   
    const searchedWords = query.trim().split(/\s+/);


    const conditions = searchedWords.map(word => ({
      $or: [
        { Profession: { $regex: word, $options: "i" } },
        { City: { $regex: word, $options: "i" } },
        { "services.title": { $regex: word, $options: "i" } }
      ]
    }));

 
    const response = await Worker_schema.find({ $or: conditions });

    if (!response || response.length === 0) {
      return resp.status(200).json({ message: "No worker found", success: false });
    }

    resp.status(200).json({
      message: "Worker(s) found",
      success: true,
      data: response
    });
  } catch (error) {
    resp.status(500).json({ message: "Something went wrong", success: false, error });
  }
};


export { get_workerInfo, get_ClientInfo, get_query };