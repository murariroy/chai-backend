import {asyncHandler} from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";{} from
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError"
const registerUser = asyncHandler(async ( req,res) =>{
      //get user details from frontend
      //validation-not empty
      //cheack if user already exist; username ,email
      //check for images ,check for avatar
      //upload them to cloudinary
      //create user object-create entry in db
      //remove password and refresh token  field from response
      //check for user creation
      //return response

       const  {fullName,email,username,password}=req.body
       console.log("Email",email)

       if(
        [fullName,email,username,password].some(() =>
        File?.tim() === "")
       ){
           throw new ApiError(400,"All fiels are required")
       }
      const existedUser= User.findOne({
        $or:[{username} , { email }]
       })
       if(existedUser){
        throw new ApiError (409,"User with email or ussername already exists")
        
       }
       const avatarLocalthPath= req.files?.avatar [0]?.path;
       registerUser.files.coverImage[0]?.path;


       if(!avatarLocalthPath){
        throw new ApiError(400,"Avatar file is required")
       }
      const avatar= await uploadOnCloudinary (avatarLocalthPath)
             const coverImage=await uploadOnCloudinary
             (coverImageLocalPath)

          if(!avatar){
            throw new ApiError(400,"Avatar file is required")
       }
      const user= User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLoerCase()
       })

     const createdUser= await  User.findById(user._id).select(
        "-password -refreshToken"
     )

     if(!createdUser){
        throw new ApiError(500,"something went wrong")
     }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
          
})

export { registerUser}