import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id;

    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                as: {$push: "$$ROOT"}
            }
        },
        {
            $addFields: {
                count: { $size:"$as"}
            }
        }
    ]);

    if(subscription.count===0){
        await Subscription.create({
            subscriber: new mongoose.Types.ObjectId(userId),
            channel: new mongoose.Types.ObjectId(channelId)
        })
    } else {
        await Subscription.findByIdAndDelete({_id: subscription[0]._id});
    }
    res
    .status(200)
    .json(new ApiResponse(200, {}, "Subscription toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        }
    ])
    res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers of the channel"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        }
    ]);

    res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "Subscribed channels"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}