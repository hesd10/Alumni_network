const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    contents: {
        type: String,
        required: true
    },
    photos: {
        type: Schema.Types.ObjectId,
        ref: 'Photo',
    }
});

module.exports = mongoose.model('Tag', TagSchema);