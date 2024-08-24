import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10} = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.aggregate([
        {
            $match: {}
        },
        {
            $sort: {createdAt: -1}
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])
    res.status(200).json(new ApiResponse(200,videos,"successfully fetched all videos"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    console.log("req.bodydfssdf");
    console.log(req.files);
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoFileLocalPath = req.files?.videoFile[0].path;

    const thumbnailFileLocalPath = req.files?.thumbnail[0].path;
    if(!videoFileLocalPath) throw new ApiError(400, "VIDEO file is required");
    const uploadedVideo = await uploadOnCloudinary(videoFileLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailFileLocalPath);
    const video = await Video.create({
        videoFile: uploadedVideo?.url,
        thumbnail: uploadedThumbnail?.url,
        title,
        description,
        duration: uploadedVideo?.duration,
        owner: new mongoose.Types.ObjectId(req.user._id)
    });

    res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.query.videoId;
    //TODO: get video by id
    // console.log("videIddd "+videoId);
    // console.log(req.query);
    const video = await Video.findById({_id: new mongoose.Types.ObjectId(videoId)})
    if (!video) throw new ApiError(404, "Video not found")
    res.status(200).json(new ApiResponse(200, video, "Successfully fetched video"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    res.status(200).json(200,{},"Method not implemented")
})

const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.query.videoId;
    //TODO: delete video
    const video = await Video.findById({_id: new mongoose.Types.ObjectId(videoId)});
    if (!video) throw new ApiError(404, "Video not found");

    const oldCloudinaryVideoPathId = video?.videoFile;
    const sp = oldCloudinaryVideoPathId.split("/");
    const pathId = sp[sp.length - 1].split(".").shift();

    const oldCloudinaryThumbnailPathId = video?.thumbnail;
    const spThumb = oldCloudinaryThumbnailPathId.split("/");
    const pathIdThumb = spThumb[spThumb.length - 1].split(".").shift();

    try {
        console.log(pathId)
        console.log(pathIdThumb)
        const resp1 = await deleteFromCloudinary(pathId);
        const resp2 = await deleteFromCloudinary(pathIdThumb);
        if (resp1) {
            console.log(resp1);
            console.log("video is deleted.");
        }
        if (resp2) {
            console.log(resp2);
            console.log("video thumbnail is deleted.");
        }
    } catch (error) {
        throw new ApiError(401, "Error while remove old video.");
    }
    const response = await Video.findByIdAndDelete({_id: new mongoose.Types.ObjectId("66c20081330c5fef8909992b")});
    if (!response) {
        throw new ApiError(400, "Error while deteing video from db");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Video deleted succesfully.")
        );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    video.isPublished =!video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Published toggled succesfully."));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
