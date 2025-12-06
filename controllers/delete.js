import { cache } from "react";
import Worker_schema from "../models/Worker_schema.js";
import Client_schema from "../models/client_schema.js";
import cloudinary from "../utalities/cloudnary.js";

const deleteService = async (req, resp) => {
    const { slug, serviceId } = req.params;
    try {
        const worker = await Worker_schema.findById(slug);
        if (!worker) {
            return resp.status(404).json({ message: 'worker not found', success: false });
        }

        worker.services = worker.services.filter(service => service._id.toString() !== serviceId);
        await worker.save();
        resp.status(200).json({ message: 'Service deleted successfully', success: true, data: worker.services });
    } catch (error) {
        resp.status(500).json({ message: 'Internal server error', success: false });
    };
};

const deletePortfolio = async (req, resp) => {
    const { slug, portfolioId } = req.params;

    try {
        const worker = await Worker_schema.findById(slug);
        if (!worker) {
            return resp.status(404).json({ message: 'worker not found', success: false });
        };
        const portfolioItem = worker.portfolio.id(portfolioId);

        if (!portfolioItem) {
            return resp.status(404).json({ message: "Portfolio item not found", success: false });
        }

        if (portfolioItem.image_public_id) {
            try {
                await cloudinary.uploader.destroy(portfolioItem.image_public_id);
            } catch (cloudError) {
                console.error('Error deleting image from Cloudinary:', cloudError);
            }
        }

        worker.portfolio = worker.portfolio.filter(portfolio => portfolio._id.toString() !== portfolioId);
        await worker.save();
        resp.status(200).json({ message: 'Portfolio deleted successfully', success: true, data: worker.portfolio });
    } catch (error) {
        resp.status(500).json({ message: 'Internal server error', success: false });
    };

};

const deleteAccount = async (req, resp) => {
    const { id } = req.params;
    try {
        const worker = await Worker_schema.findById(id);
        if (!worker) {
            const client = await Client_schema.findById(id);
            if (!client) {
                return resp.status(404).json({ message: "User not found", success: false })
            } else {
                let deletedClient = await Client_schema.findByIdAndDelete(id);
                if (deletedClient) {
                    return resp.status(200).json({ message: "User deleted Successfuly", success: true })
                }
            }
        }
        if (worker.portfolio && worker.portfolio.length > 0) {
            for (const item of worker.portfolio) {
                if (item.image_public_id) {
                    try {
                        await cloudinary.uploader.destroy(item.image_public_id);
                    } catch (err) {
                        console.error("Cloudinary delete error:", err);
                    }
                    worker.portfolio = [];
                }
            }
        }
     
        // Delete image from Cloudinary
        if (worker.Profile_Pic_PublicId) {
            await cloudinary.uploader.destroy(worker.Profile_Pic_PublicId);
        }
        let deletedUser = await Worker_schema.findByIdAndDelete(id);
        if (deletedUser && deletedUser.Profile_Pic) {

        }

        if (!deletedUser) {
            deletedUser = await Client_schema.findByIdAndDelete(id);
            if (!deletedUser) {
                return resp.status(404).json({ message: "User not found", success: false })
            }
        }

        resp.status(200).json({ message: "User deleted Successfuly", success: true })


    } catch (error) {
        resp.status(500).json({ message: "Internal server error", success: false })
    }

}


export { deleteService, deletePortfolio, deleteAccount };