import {asyncHandler} from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";{} from
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) =>{
  try{
        const user= await User.findById(userId)
        const accessToken=  user.generateAccessTokens()
        const refreshToken= user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save({validateBeforreSave:false})
          
        return{accessToken,refreshToken}
  }catch(error){
    throw new  ApiError(500,"Something went wrong while refresh and generating token")

  }
}
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
const loginUser = asyncHandler (async (req,res) =>{
  //req body => data
  //username or email
  //find the usr
  //password check
  //access and refresh token
  //send cookie
  const {email,usrname,username,password} = req.body
  if(!username || !email){
    throw new ApiError(400,"username or password required")

  }
    const user= await User.findOne({
    $or:[{username},{email}]
   })

   if(!user){
    throw new ApiError(400,"user does not exist")
   }
       const isPasswordCorrect= await user.isPasswordCorrect(password)
       if(!isPasswordCorrect){
        throw new ApiError(400, "invalid ")
       }
      const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
         

     const loggedInUser= User.findById(user._id).select("-password -refreshToken")

     const options = {
      httpOnly:true,
      secure:true
     }
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshtoken",refreshToken,options)
     .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
      )
     )


    })

    const logoutUser  = asyncHandler(async(req,res) =>{
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $set:{
              refreshToken:undefined
            }
          },
          {
            new:true
          }
         )
         const options ={
          httpOnly:true,
          secure:true
         }
         return res
         .status(200)
         .clearCookie("AccessToken")
         .clearCookie("refreshToken")
         .json(new ApiResponse(200, {} ,"User logged out"))
    })


const refreshAccessToken = asyncHandler(async(req,res) =>{
       const incomingRefreshtoken= req.cookie.refreshToken 
       || req.body.refreshToken


       if(!incomingRefreshtoken){
        throw new ApiError(401,"unauthrozised request")
       }

        try{
          const  decodedToken= jwt.verify(
            incomingRefreshtoken,
            process.env.REFRESH.TOKEN.SECRET
  
          )
           const user =await User.findById(decodedToken?._id)
  
           if(!user){
            throw new ApiError(401, "Invalid refresh token")
  
           }
           if(incomingRefreshtoken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
  
           }
  
             const option = {
              httpOnly:true,
              secure:true
             }
            const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
  
             return res
             .status(200)
             .cookie("accessToken",accessToken,options)
             .cookie(refreshToken,options)
             .json(
                 new ApiResponse(
                  200,
                  {accessToken,refreshToken:newRefreshToken},
                  "Acess token refreshed"
                 )
             ) 
        }catch(error){
          throw new ApiError(401, error?.message || "invalid access token"
          )
        }
    
})    
export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
  
  }