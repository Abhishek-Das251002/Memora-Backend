const express = require("express")
const {verifyJWT} = require("../middleware/verifyJWT")
const multer = require("multer")

const {getUserDetails, allUsers, createAlbum, updateAlbumDes, addNewUserToAlbum, deleteAlbum, getAllAlbums, uploadImg, changeFavoriteStatus, addComment, deleteImage, getAllImages, getImagesFromAllAlbums} = require("../controllers/userController")

const router = express.Router()

const storage = multer.diskStorage({})
const upload = multer({storage})

// router.use(verifyJWT)

router.get("/details",verifyJWT, getUserDetails)
router.get("/googleLogins",verifyJWT, allUsers)
router.post("/albums", verifyJWT, createAlbum)
router.post("/albums/:albumId", verifyJWT, updateAlbumDes)
router.post("/albums/:albumId/share", verifyJWT, addNewUserToAlbum)
router.delete("/albums/:albumId", verifyJWT, deleteAlbum)
router.get("/albums", verifyJWT, getAllAlbums)
router.post("/albums/:albumId/images", verifyJWT, upload.single("image"), uploadImg)
router.post("/albums/:albumId/images/:imageId/favorite", verifyJWT, changeFavoriteStatus)
router.post("/albums/:albumId/images/:imageId/comments", verifyJWT, addComment)
router.delete("/albums/:albumId/images/:imageId", verifyJWT, deleteImage)
router.get("/albums/:albumId/images", verifyJWT, getAllImages)
router.get("/albums/images", verifyJWT, getImagesFromAllAlbums)

module.exports = router