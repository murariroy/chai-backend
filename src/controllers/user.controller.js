import {asyncHandler} from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse.js";{} from
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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

 const changeCurrentPassword = asyncHandler(async(req,res)=>{
      const {oldPassword,newPassword} = req.body
      
      const user = await User.findById(req.user?.id)
       const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

       if(!isPasswordCorrect){
          throw new ApiError(400,"Invalid password")

       }

         user.password = newPassword
         await user.save({validateBeforreSave:false4})

         return res
         .status(200)
         .json(new ApiResponse(200, {} ,
          "Password changed successfully"
         ))
 })


 const getCurrentUser = asyncHandler(async(req,res) =>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfully")
 })
   const updateAccountDetails = asyncHandler(async(req,res) =>{
    const {fullName,email} = req.body

    if(!fullName || !email){
      throw new ApiError(400,"all fiels are required")

    }
    const user=    User.findByIdAndUpdate(req.user?._id,
          {
           $set:{
            fullName,
            email:email
           } 
           
          },
          {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Accoutn details update successfully"))


   })

   const updateUserAvatar = asyncHandler(async(req,res) =>{
          const avatarLocalthPath = req.file?.path 

          if(!avatarLocalthPath){
            throw new  ApiError(400,"Avatar local path are missing")

            const avatar= await uploadOnCloudinary(avatarLocalthPath)

            if(!avatar.url){
              throw new ApiError(400,"Error while uploading on avatar")

            }
            await User.findByIdAndUpdate(
              req.user?._id,
              {
                $set:{
                  avatar:avatar.url
                }
              },
              {new:true}
            ).select(-password)
          }
          return res
          .status(200)
          .json(
            new ApiResponse(200,user,"Avatar image uploading successfully")
          )
        
   })

   const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalthPath = req.file?.path 

    if(!coverImageLocalthPath){
      throw new  ApiError(400,"cover Image file  are missing")

      const coverImage= await uploadOnCloudinary(avatarLocalthPath)

      if(!coverImage.url){
        throw new ApiError(400,"Error while uploading cover image ")

      }
        const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            coverImage:coverImage.url
          }
        },
        {new:true}
      ).select(-password)

      return res
      .status(200)
      .json(
        new ApiResponse(200,user,"cover image uploading successfully")
      )
    }
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
            const {username} = req.params

            if(!username?.trim()){

              throw new ApiError(400,"username is missing")

            }
            const channel=  User.aggregate([
              {
                $match:{
                  username:username?.toLoerCase()
                }
              },
              {
                $lookup:{
                  from:"Subscription",
                  localField:"_id",
                  foreignField:"channel",
                  as:"subcribers"

                },
                
              },
              {
                $lookup:{
                  from:"Subscription",
                  localField:"_id",
                  foreignField:"subscriber",
                  as:"subcribersTo"
                }
              },
              {
                $addFields:{
                  subscribersCount:{
                    $size:"$subscribers"

                  },
                  channelSubscriberdTocount:{
                    $size:"$subscribedTo"
                  },
                  isSubscribed:{
                    $cond:{
                      if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                      then:true,
                      else:false
                    }
                  }
                }
              },{
                $project:{
                  fullName:1,
                  username:1,
                  subscribersCount:1,
                  channelSubscriberdTocount:1,
                  isSubscribed:1,
                  avatar:1,
                  coverImage:1,
                  email:1

                }
              }
            ])

            if(!channel?.length){
              throw new ApiError(404,"channel does not exist")

            }
            return res
            .status(200)
            .json(
              new ApiResponse(200,channel[0],"User channel featch successfully")
            )
})

const getWatchhistory = asyncHandler(async(req,res)=>{
        const user = await User.aggregate([
          {
            $match:{
              _id:new mongoose.Types.ObjectId(req.user._id)

            }
          },
          {
            $lookup:{
              from:"videos",
              localField:"watchHistory",
              foreignField:"_id",
              as:"watchHistory",
              pipeline:[
                {
                  $lookup:{
                    from:"User",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                      {
                        $project:{
                          fullName:1,
                          username:1,
                          avatar:1
                        }
                      }
                    ]
                  }
                },
                {
                  $addFields:{
                    owner:{
                      $first: "$owner"
                    }
                  }
                }
              ]
            }
          }
         ])

         return res
         .status(200)
         .json(
          new ApiResponse(
            200,
            user[0].watchhistory,
            "watched history featched sucessfully"
          )
         )
})
export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   getUserChannelProfile,
   updateUserCoverImage,
   getWatchhistory
  
  }