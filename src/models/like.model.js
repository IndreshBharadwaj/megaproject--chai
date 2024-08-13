import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    tweet: {
        type: mongoose.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
})

export const Like = mongoose.model("Like",likeSchema);