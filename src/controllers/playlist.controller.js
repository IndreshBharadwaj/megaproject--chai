import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    console.log(req.body)
    //TODO: create playlist
    const user = req.user;
    
    const playlist = await Playlist.create({
        name,
        description,
        videos: [],
        owner: new mongoose.Types.ObjectId(user._id)
    })

    if (!playlist) throw new ApiError(500, "Something went wrong while creating playlist");

    res.status(200).json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    //TODO: get user playlists
    const userPlaylists1 = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ]);
    // console.log(userPlaylists1)
    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        // {
        //     $unwind: "$videos"
        // },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
    ])
    
    res.status(200).json(new ApiResponse(200, userPlaylists, "Playlists fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        // {
        //     $unwind: "$videos"
        // },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
    ])
    
    res.status(200).json(new ApiResponse(200, userPlaylists, "Playlists fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.videos.push(new mongoose.Types.ObjectId(videoId));

    const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId, 
        {
            $set: {
                videos: playlist.videos
            }
        },
        {new: true}
    );
    res
    .status(200)
    .json(new ApiResponse(200, updatedPlayList, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.videos = playlist.videos.filter(video=>video._id!==videoId);

    const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId, 
        {
            $set: {
                videos: playlist.videos
            }
        },
        {new: true}
    );
    res
    .status(200)
    .json(new ApiResponse(200, updatedPlayList, "Video deleted from playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "Cannout find playlist")
    }

    const responce = await Playlist.findByIdAndDelete(playlistId);
    if(!responce) {
        throw new ApiError(500, "Something went wrong while deleting playlist.")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, responce, "Playlist deleted succesfully.")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.name = name;
    playlist.description = description;

    const updatedPlayList = await Playlist.findByIdAndUpdate(playlistId, 
        {
            $set: {
                name: playlist.name,
                description: playlist.description
            }
        },
        {new: true}
    );
    res
    .status(200)
    .json(new ApiResponse(200, updatedPlayList, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
