import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});  

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            })
            fs.unlinkSync(localFilePath);
        return response;
    } catch(error){
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (pathId) => {
    console.log("asdasd")
    try {
        const response=await cloudinary.uploader.destroy(pathId,{invalidate:true,resource_type:"image"});
        return response;
    } catch (e) {
        console.log("Error in deleting.");
        return null;
    }
}

export {uploadOnCloudinary,deleteFromCloudinary};