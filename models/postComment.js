const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostCommentSchema = new Schema({
    commenter: {
        type: Schema.Types.ObjectId,
        ref: 'Alumni',
        required: true
    },
    content: {
        type: String,
        required: true
    },
},
{
    timestamps: {
        createdAt: 'created_at'
    }
});

module.exports = mongoose.model('PostComment', PostCommentSchema);