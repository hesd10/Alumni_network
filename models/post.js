const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    poster: {
        type: Schema.Types.ObjectId,
        ref: 'Alumni',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    comment_list: [
        {
            type: Schema.Types.ObjectId,
            ref: 'PostComment',
        }
    ],
},
{
    timestamps: {
        createdAt: 'created_at'
    }
});

module.exports = mongoose.model('PostSchema', PostSchema);