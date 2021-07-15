const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerifyCodeSchema = new Schema({
    codes: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('VerifyCode', VerifyCodeSchema);