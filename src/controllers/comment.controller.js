import {mongoose} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    let aggregatedComments;
    try {
    aggregatedComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            avatar: 1,
                            userName: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "owner",
                foreignField: "likedBy",
                as: "likes"
            }
        },
        {
            $addFields: {
                details: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $addFields: {
                likes: {$size: "$likes"}
            }
        },
        {
            $skip: (page-1)*limit
        },
        {
            $limit: parseInt(limit)
        }
    ]);
    } catch(error) {
        console.error(error);
        throw new ApiError(
            500,
            "Something went wrong while fetching Comments !!"
        );
    }
    console.log("sdfsdf")
    console.log(aggregatedComments);

    const result = await Comment.aggregatePaginate(aggregatedComments, { page, limit });

    if (result.docs.length == 0) {
        return res.status(200).json(new ApiResponse(200, [], "No Comments Found"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, result.docs, "Comments fetched Succesfully !")
        );

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    
    const video = await Video.findById({_id:videoId});

    if(!video) throw new ApiError(401, "Invalid videoID");
    const comment = await Comment.create(
        {
            content,
            video: new mongoose.Types.ObjectId(videoId),
            owner: new mongoose.Types.ObjectId(req.user._id)
        }
    );

    if(!comment) {
        throw new ApiError(400, "Something went wrong while adding comment.")
    }
   
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Succesfully added comment."
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    
    if(content?.trim() === "") {
        throw new ApiError(400, "Empty comment not allowed.")
    }

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentID")
    }

    const responce = await  Comment.findByIdAndUpdate(commentId,
        {
            content
        },
        {new: true}
    )

    if(!responce) {
        throw new ApiError(400, "Something went wrong while updating comment.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            responce,
            "Succesfully Updated comment."
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    const responce = await Comment.findByIdAndDelete(commentId);

    if(!responce) {
        throw new ApiError(400, "Something went wrong while Deleting comment.")
    }

    const likesForTheComment = await Like.aggregate([
        {
            $match: {
                content: new mongoose.Types.ObjectId(commentId)
            }
        }
    ]);

    likesForTheComment.forEach(async function(doc){
        await Like.delete({_id:new mongoose.Types.ObjectId(doc._id)},new ApiError(500,"Error deleting Comment"));
        console.log("Deleted Like with Id - "+doc._id);
    })

    res
    .status(200)
    .json(
        new ApiResponse(200,{},"Successfully deleted the comment")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
