import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {userId} = req.user._id;
    //TODO: toggle like on video
    try {
    const like = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "allLikes"
            }
        },
        {
            $addFields: {
                $totalLikesBeforeDelete: {
                    $size: "$allLikes"
                }
            }
        }
    ])
    console.log("likes before deleteting "+like.totalLikesBeforeDelete);
    await Like.deleteOne({_id:like._id});
    const likesAfterDelete = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                count: 1
            }
        }
    ])
    console.log("likes after deleteting "+likesAfterDelete.count);
} catch (error) {
    throw new ApiError(
        500,
        error?.message || "Something went wrong in toggleVideoLike."
    );
}
return res
.status(200)
.json(
    new ApiResponse(
        200,
        { },
        "Liked removed Succesfully"
    )
);
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id;
    console.log(req.user)
    //TODO: toggle like on video
    try {
    const like = await Like.aggregate([
        {
            $match: {
                $and: [
                    {comment: new mongoose.Types.ObjectId(commentId)},
                    {likedBy: new mongoose.Types.ObjectId(userId)}
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "allLikes"
            }
        },
        {
            $addFields: {
                totalLikesBeforeDelete: {
                    $size: "$allLikes"
                }
            }
        }
    ])
    console.log("likessdasda");
    console.log(like);
    console.log("likes before deleteting ");
    console.log(like.totalLikesBeforeDelete);
    if(like.length > 0){
    await Like.deleteOne({_id:new mongoose.Types.ObjectId(like[0]._id)});
    const likesAfterDelete = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    console.log("likes after deleteting "+likesAfterDelete.length);
    } else {
        const newLike = await Like.create({
            comment: new mongoose.Types.ObjectId(commentId),
            likedBy: new mongoose.Types.ObjectId(userId)
        })
        const response = await newLike.save();
        console.log(response);
        console.log(userId)
        const likesAfterCreate = await Like.aggregate([
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    count: 1
                }
            }
        ])
        console.log("likes after creating ");
        console.log(likesAfterCreate);
    }
} catch (error) {
    throw new ApiError(
        500,
        error?.message || "Something went wrong in toggleVideoLike."
    );
}
return res
.status(200)
.json(
    new ApiResponse(
        200,
        { },
        "Liked toggled Succesfully"
    )
);

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {userId} = req.user._id;
    //TODO: toggle like on video
    try {
    const like = await Like.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId),
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "allLikes"
            }
        },
        {
            $addFields: {
                $totalLikesBeforeDelete: {
                    $size: "$allLikes"
                }
            }
        }
    ])
    console.log("likes before deleteting "+like.totalLikesBeforeDelete);
    await Like.deleteOne({_id:like._id});
    const likesAfterDelete = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                count: 1
            }
        }
    ])
    console.log("likes after deleteting "+likesAfterDelete.count);
} catch (error) {
    throw new ApiError(
        500,
        error?.message || "Something went wrong in toggleVideoLike."
    );
}
return res
.status(200)
.json(
    new ApiResponse(
        200,
        { },
        "Liked removed Succesfully"
    )
);
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "allVideos"
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, "Succesfully fetched liked videos")
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}