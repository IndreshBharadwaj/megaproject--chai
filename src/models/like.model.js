import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    comment: {
        type: mongoose.Types.ObjectId,
        ref: "Comment"
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