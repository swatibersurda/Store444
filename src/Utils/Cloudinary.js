import {v2 as cloudiary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({path:"./.env"})
// here config setting will come
cloudiary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

// basially first we wil store the file,image,pdf on cloud first and then will create a link 
// when link created then will delete it from the server or public assests 
// folder.
const uploadCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        // upload file on cloudinary.
        const response=await cloudiary.uploader.upload(localFilePath,{
            // means we can upload anything like 
            // pdf,image,avatar any file--->auto.
            resource_type:"auto"
        })
        console.log(response,"i am responsee..");
        // file has been uploaded sucessfully so need to delete it from server
        fs.unlinkSync(localFilePath)
        return response;

    }catch(err){
        // / remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        return null;
 
    }
}

export {uploadCloudinary}