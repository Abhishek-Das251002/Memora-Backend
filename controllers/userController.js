const {Album} = require("../models/album")
const {Image} = require("../models/image")
const express = require("express")
const { GallaryUser } = require("../models/user")
const multer = require("multer")
const cloudinary = require("cloudinary")
const bodyParser = require("body-parser")
const path = require('node:path');

const app = express()
 
app.use(express.json())

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.diskStorage({})
const upload = multer({storage})

const getUserDetails = async (req, res) => {
    try {
        const currUser = await GallaryUser.findOne({_id: req.user.userId})
        return res.status(200).json(currUser) 
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}

const allUsers = async (req, res) => {
    try {
        const getAllUsers = await GallaryUser.find()
        if(getAllUsers.length !== 0){
            res.status(200).json(getAllUsers)
        }else{
            res.status(404).json("users not found.")
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({message: error.message})
    }
} 

const createAlbum = async (req, res) => {
    try {
        const newAlbum = new Album(req.body)
        const savedAlbum = await newAlbum.save()

        return res.status(201).json('album created successfully.') 
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}

const updateAlbumDes = async (req, res) => {
    try {
        const {albumId} = req.params
        const albumToUpdate = await Album.findOneAndUpdate({_id: albumId, ownerId: req.user.userId}, {description: req.body.description}, {new: true})

        if(!albumToUpdate){
            return res.status(404).json("Album not found.")
        }else{
            return res.status(200).json(albumToUpdate)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({message: error.message})
    }
}

const addNewUserToAlbum = async (req, res) => {
    try {
        const {albumId} = req.params;
        const albumToShare = await Album.findByIdAndUpdate(albumId, { $addToSet: { sharedUsers: {$each: req.body.sharedUsers }} }, {new: true})
        
        if(!albumToShare){
            res.status(400).json("error occured while sharing album to users")
        }else{
            res.status(201).json("shared users added successfully", albumToShare)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}

const deleteAlbum = async (req, res) => {
    try {
        const {albumId} = req.params;
        const albumToDel = await Album.findOneAndDelete({_id: albumId, ownerId: req.user.userId})

        if(!albumToDel){
            res.status(404).json("Album not found.")
        }else{
            res.status(200).json("album deleted successfully.")
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({message: error.message})
    }
}

const getAllAlbums = async (req, res) => {
    try {
       const allAlbums = await Album.find()
       const albumBelongsToUser = allAlbums.filter(album => (album.ownerId.toString() === req.user.userId.toString() || album.sharedUsers.includes(req.user.email)))
       
       if(allAlbums.length !== 0){
            return res.status(201).json(albumBelongsToUser)
       }else{
            return res.status(404).json("albums not found.")
       }
    }catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}

const uploadImg = async (req, res) => {
    try {
        const {albumId} = req.params;
        const file = req.file

        // console.log(req.file)
        // console.log(req.body)
        // console.log(req.user)
        
        if(!file) return res.status(400).send("No file uploaded")

        const fileType = path.extname(file.originalname).toLowerCase()

        if(fileType !== ".jpg" && fileType !== ".jpeg" && fileType !== ".png" && fileType !== ".webp") return res.status(400).json("invalid file type.")
        if(file.size > 5242880) return res.status(400).json("file size exceeded 5MB")

        const selectedAlbum = await Album.findOne({_id: albumId})

        //console.log(selectedAlbum.ownerId)
        if(!selectedAlbum) return res.status(404).json("album not found.")

        if(selectedAlbum.ownerId.toString() !== req.user.userId.toString() && !selectedAlbum.sharedUsers.includes(req.user.email)) return res.status(403).json("unauthorized user.")

        
        //upload to cloudinary
        const result = await cloudinary.uploader.upload(file.path, {folder: `albums/${albumId}`})
        
        //console.log(result)
        //save to mongodb
        const newImage = new Image({
            albumId: albumId,
            imageUrl: result.secure_url,
            publicId: result.public_id,
            name: req.body.name,
            tags: JSON.parse(req.body.tags),
            person: JSON.parse(req.body.person),
            isFavorite: req.body.isFavorite === "true" ? [req.user.email] : [],
            size: file.size,
            uploadedBy: req.user.email
        })
        await newImage.save()

        res.status(200).json({message: "Image uploaded successfully."})
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Image upload failed", error: error})
    }
}


const changeFavoriteStatus = async (req, res) => {
    try {
        const {imageId, albumId} = req.params

        const selectedAlbum = await Album.findOne({_id: albumId})

        if(!selectedAlbum) return res.status(404).json("album not found.")

        if(selectedAlbum.ownerId.toString() !== req.user.userId.toString() && !selectedAlbum.sharedUsers.includes(req.user.email)) return res.status(403).json("unauthorized user.")

        const image = await Image.findOne({
            _id: imageId,
            albumId: albumId
        });

        if (!image) {
            return res.status(404).json("image not found.");
        }

        if (image.isFavorite.includes(req.user.email)) {
            image.isFavorite = image.isFavorite.filter(
                email => email !== req.user.email
            );
        } else {
            image.isFavorite.push(req.user.email);
        }

        await image.save();

        return res.status(200).json({
            message: "favorite status changed",
            updatedImg: image
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}


//handle empty comments on frontend.

const addComment = async (req, res) => {
    try {
        const {imageId, albumId} = req.params

        const selectedAlbum = await Album.findOne({_id: albumId})

        if(!selectedAlbum) return res.status(404).json("album not found.")

        if(selectedAlbum.ownerId.toString() !== req.user.userId.toString() && !selectedAlbum.sharedUsers.includes(req.user.email)) return res.status(403).json("unauthorized user.")

        const addNewComment = await Image.findOneAndUpdate({_id: imageId, albumId: albumId}, { $push: { comments: {user: req.user.userId, text: req.body.comment}}}, {new: true})

        if(!addNewComment){
            return res.status(404).json("image not found.")
        }else{
            return res.status(201).json({message: "comment added successfully",  updatedImg: addNewComment})
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}

const deleteImage = async (req, res) => {
    try {
        const {imageId, albumId} = req.params

        console.log(albumId, req.user.userId)
        const selectedAlbum = await Album.findOne({_id: albumId})

        if(!selectedAlbum) return res.status(404).json("album not found.")

        if(selectedAlbum.ownerId.toString() !== req.user.userId.toString()) {
            return res.status(403).json("unauthorized user.")
        }

        // first find image
        const imgToDel = await Image.findOne({_id: imageId, albumId: albumId})

        if(!imgToDel){
            return res.status(404).json("image not found.")
        }

        // delete from cloudinary
        await cloudinary.uploader.destroy(imgToDel.publicId)

        // delete from mongodb
        await Image.findByIdAndDelete(imageId)

        return res.status(200).json({
            message: "image deleted.",
            deletedImage: imgToDel
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}


const getAllImages = async (req, res) => {
    try {
        const {albumId} = req.params

        const selectedAlbum = await Album.findOne({_id: albumId})

        if(!selectedAlbum) return res.status(404).json("album not found.")

        if(selectedAlbum.ownerId.toString() !== req.user.userId.toString() && !selectedAlbum.sharedUsers.includes(req.user.email)) return res.status(403).json("unauthorized user.")

        const allImages = await Image.find({albumId: albumId})

        return res.status(200).json(allImages)
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: error.message})
    }
}


const getImagesFromAllAlbums = async (req, res) => {
    try {
        const userAlbum = await Album.find({$or: [{ ownerId: req.user.userId },{ sharedUsers: {$in: [req.user.email]}}]});

        const userAlbumIds = userAlbum.map(album => album._id)

        const userImages = await Image.find({albumId: {$in : userAlbumIds}})

        if(userImages.length !== 0){
            return res.status(200).json(userImages)
        }else{
            return res.status(404).json("images not found.")
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

module.exports = {getUserDetails, allUsers, createAlbum, updateAlbumDes, addNewUserToAlbum, deleteAlbum, getAllAlbums, uploadImg, changeFavoriteStatus, addComment, deleteImage, getAllImages, getImagesFromAllAlbums}