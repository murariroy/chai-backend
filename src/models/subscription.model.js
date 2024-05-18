import mongoose, {Schema} from "mongoose";

const subsciptionSchema = new Schema({
    subscription :{
         type:Schema.Types.ObjectId,
         ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})




export const Subsciption = momgoose.model("Subsciption",subsciptionSchema)