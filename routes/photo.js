const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Photo = require('../models/photo');
const photo = require('../controllers/photo')
const { isAlumniWithProfile, isPhotoAuthor, isPhotoCommentAuthor } = require('../middleware');
const { validatePhotoInfo, validatePhotoComment } = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/')
    // .get(isAlumniWithProfile, photo.renderIndex)
    .get(photo.renderIndex)
    .post(isAlumniWithProfile, upload.single('image'), validatePhotoInfo, catchAsync(photo.createPhoto))

router.route('/new')
    .get(isAlumniWithProfile, photo.renderNewForm)

router.route('/:photoID')
    // .get(isAlumniWithProfile, photo.showPhoto)
    .get(photo.showPhoto)
    .put(isAlumniWithProfile, isPhotoAuthor, validatePhotoInfo, catchAsync(photo.updatePhotoInfo))
    .delete(isAlumniWithProfile, isPhotoAuthor, catchAsync(photo.deletePhoto))

router.route('/:photoID/edit')
    .get(isAlumniWithProfile, isPhotoAuthor, catchAsync(photo.renderUpdatePhoto))

router.route('/:photoID/comment')
    .post(isAlumniWithProfile, validatePhotoComment, catchAsync(photo.createComment))

router.route('/:photoID/comment/:commentID')
    .delete(isAlumniWithProfile, isPhotoCommentAuthor, catchAsync(photo.deleteComment))

module.exports = router;