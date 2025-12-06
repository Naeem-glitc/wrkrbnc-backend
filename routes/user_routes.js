import express from "express";
import upload from "../auth/upload.js";
import cloudinary from "../utalities/cloudnary.js";
import createworker from "../controllers/worker_controller.js";
import createclient from "../controllers/client_controller.js";
import varify_OTP from "../controllers/varify_OTP.js";
import varify_OTP_client from "../controllers/varify_OTP_Client.js";
import getAllWorkers from "../controllers/dashboard.js";
import {userLogin, logout} from "../controllers/user_login.js";
import {get_workerInfo, get_ClientInfo, get_query} from "../controllers/getuser_details.js";
import addService from "../controllers/services.js";
import addportfolio from "../controllers/portfolio.js";
import {deleteService, deleteAccount, deletePortfolio} from "../controllers/delete.js";
import { check_worker } from "../auth/middleware.js";



const router = express.Router();
router.post('/sign-up/worker',upload.single('profile_photo'), createworker);
router.post('/sign-up/client',createclient)
router.post('/create-worker/varify-OTP', varify_OTP)
router.post('/create-client/varify-OTP', varify_OTP_client)
router.get('/get-all-workers', getAllWorkers);
router.post('/userLogin', userLogin);
router.get('/getUserDetails/:id',check_worker, get_workerInfo);
router.get('/getworkerdata/:id',get_workerInfo);
router.post('/addService/:id', addService)
router.post('/addportfolio/:id', upload.single('image'), addportfolio)
router.get('/logout', logout);
router.delete("/deleteUser/:id", deleteAccount)
router.delete("/deleteService/:slug/:serviceId", deleteService)
router.delete("/deletePortfolio/:slug/:portfolioId", deletePortfolio)
router.get("/searchworker/search", get_query)
router.get('/getClientDetails/:id', get_ClientInfo);
export default router;