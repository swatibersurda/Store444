import expres from "express";
import { googleCallback, googleLogin, postAuthMiddleware, redirecting} from "../Controller/googleController.js";
export const googleRouter = expres.Router();


// http://localhost:9000/api/v1/google/auth/google for this url........rrrlllurlll
googleRouter.route("/auth/google").get(googleLogin);

googleRouter.route("/auth/google/callback").get(googleCallback,postAuthMiddleware,redirecting)
