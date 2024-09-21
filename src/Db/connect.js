import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config({path:"./.env"})
export const connect=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.DB_URL}`)
        console.log(`Connected at ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("!!Failed to connect")
    }
}