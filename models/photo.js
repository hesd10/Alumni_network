const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = require('./imageSchema');
const PhotoComment = require('./photoComment');

const PhotoSchema = new Schema({
    accessibility: {
        type: String,
        enum: ['Global', 'OnlyToAlumni'],
        required: true
    },
    image: {
        type: ImageSchema,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    uploader: {
        type: Schema.Types.ObjectId,
        ref: 'Alumni',
        required: true
    },
    people_on_photo: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Alumni',
        }
    ],
    comment_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'PhotoComment',
        }
    ],
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag',
        }
    ],
    created_time: {
        type: Date
    }
},
{
    timestamps: {
        createdAt: 'created_at'
    }
});

PhotoSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await PhotoComment.remove({
            _id: {$in: doc.comment_list}
        }) 
    }
});

module.exports = mongoose.model('Photo', PhotoSchema);