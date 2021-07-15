const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    privilege: {
        type: String,
        enum: ['Alumni', 'Guest'],
        required: true,
        default: 'Guest'
    },
    alumni: {
        type: Schema.Types.ObjectId,
        ref: 'Alumni',
        default: null
    },
},
{
    timestamps: {
        createdAt: 'created_at'
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);