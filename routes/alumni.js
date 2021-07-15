const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Alumni = require('../models/alumni');
const alumni = require('../controllers/alumni')
const { isAlumni, isAlumniWithProfile, isAuthor, validateProfile } = require('../middleware');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/')
    .get(alumni.mainPage);

router.route('/:username')
    .get(isAlumniWithProfile, isAuthor, alumni.renderProfile);

router.route('/:username/createProfile')
    .get(isAlumni, isAuthor, alumni.renderCreateProfile)
    .post(isAlumni, isAuthor, upload.single('image'), validateProfile, catchAsync(alumni.createProfile));

router.route('/:username/updateProfile')
    .get(isAlumniWithProfile, isAuthor, alumni.renderUpdateProfile)
    .put(isAlumniWithProfile, isAuthor, upload.single('image'), validateProfile, catchAsync(alumni.updateProfile));

router.route('/:username/changePassword')
    .get(isAlumniWithProfile, isAuthor, alumni.renderChangePassword)
    .put(isAlumniWithProfile, isAuthor, catchAsync(alumni.changePassword))

module.exports = router;