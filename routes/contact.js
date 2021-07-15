const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const Alumni = require('../models/alumni');
const contact = require('../controllers/contact')
const { isAlumniWithProfile } = require('../middleware');

router.route('/')
    .get(isAlumniWithProfile, contact.renderContactTable);

module.exports = router;