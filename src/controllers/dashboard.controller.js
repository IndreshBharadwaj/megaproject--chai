import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {userId} = req.user._id;

    const response = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                avatar: 1
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "allVideos",
                pipeline: [
                    {
                        $group: {
                            _id:"",
                            views: {$sum: "$views"}
                        }
                    },
                    {
                        $project: {
                           _id: 0,
                           views: 1 
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                allVideos: {
                    $first: "$allVideos"
                }
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                numberOfSubscribers: {$size:"$subscribers"}
            }
        }
    ]);

    if (!response) {
        console.log("response 1: ", response);
        throw new ApiError(
            500,
            "Something went wrong while fetching dashboard data !"
        );
    }

    console.log("response: ", response);
    return res
        .status(200)
        .json(new ApiResponse(200, response, "Fetched user dashboard data !"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {userId} = req.user._id;
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes"
                }
            }
        }
    ])
    if (!videos) {
        throw new ApiError(
            "Something went wrong while getting videos in dashboard !"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Succesfullt fetched videos"
            )
        );
})

export {
    getChannelStats, 
    getChannelVideos
    }