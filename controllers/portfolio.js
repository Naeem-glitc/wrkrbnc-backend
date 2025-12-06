import Worker_schema from "../models/Worker_schema.js";
import cloudinary from "cloudinary";
import fs from "fs";

const addportfolio = async (req, res) => {
    const { title} = req.body;
    const {id} = req.params;
      const imagePath = req.file;
    try {
        
        if(!title || !imagePath) {
            return res.status(400).json({ message: "Title and Image are required" });
        }

        const worker = await Worker_schema.findById(id);
        if(!worker) {
            return res.status(404).json({ message: "Worker not found", success:false });
        }

         const uploadResult = await cloudinary.v2.uploader.upload_stream(
      { folder: "workers/portfolio" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed", success: false });
        }

      const newPortfolioItem = {
          title,
          image: result.secure_url,
          image_public_id: result.public_id,
        };

  worker.portfolio.push(newPortfolioItem);
        await worker.save();

      return res.status(201).json({
          message: "Portfolio item added successfully",
          success: true,
          portfolio: worker.portfolio,
        });
      }
    );
    uploadResult.end(imagePath.buffer);

    } catch (error) {
        res.status(500).json({ message: "Server error", success:false  });
    }

};

 export default addportfolio;