import  {v2 as cloudinary} from "cloudniary"
import fs, { unlink, unlinkSync }  from "fs";

 
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async(localFilePAth) =>{
    try{
        if (!localFilePAth) return null
        //upload the file on cloudinary
          const response=await cloudinary.uploder.upload(localFilePAth,{
            resourse_type:"auto"
        })
        //file has been  uploaded successfully
        console.log("File is uploaded on cloudinary",
        response.url);
        return response
    }catch(error){
           fs.unlinkSync(localFilePAth)//remove the locally saved file as the upload opteration failed
           return null;
    }
}