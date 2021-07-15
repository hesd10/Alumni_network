const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SchemaOption = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    }
}

const ImageSchema = new Schema({
    url: String,
    filename: String
}, SchemaOption);

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/c_thumb,g_face,h_200,w_200,z_0.7/r_max');
});

ImageSchema.virtual('thumbnailGeneral').get(function() {
    return this.url.replace('/upload', '/upload/c_thumb,h_200,z_0.7');
});

module.exports = ImageSchema;