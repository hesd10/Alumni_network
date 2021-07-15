const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageSchema = require('./imageSchema');

const SchemaOption = {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true 
    }
}

const PlaceSchema = new Schema({
    country: {type: String},
    state: {type: String},
    city: {type: String},
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {type: [Number]}
}, SchemaOption);

PlaceSchema.virtual('location').get(function() {
    return this.city + ', ' + this.state + ', ' + this.country;
});

const AlumniSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    date_of_birth: {
        year: {type: Number},
        month: {type: Number},
        day: {type: Number}
    },
    image: ImageSchema,
    hometown: PlaceSchema,
    present_location: PlaceSchema,
    present_job: {
        company: {type: String},
        position: {type: String},
    },
    is_married: {type: Boolean},
    phone: {type: String},
}, SchemaOption);

AlumniSchema.virtual('dobISO').get(function () {
    if(!this.date_of_birth) {
        return ''
    } else {
        return `${this.date_of_birth.year}`.padStart(4, '0') 
            + '-' + `${this.date_of_birth.month}`.padStart(2, '0')
            + '-' + `${this.date_of_birth.day}`.padStart(2, '0');
    }
}) 

AlumniSchema.virtual('popUpMarkup').get(function () {
    if(this.image && this.image.thumbnail) {
        return `<img src='${this.image.thumbnail}'><h5>${this.last_name}, ${this.first_name}</h5>`
    } else {
        return `<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/200px-No_image_available.svg.png'><h5>${this.last_name}, ${this.first_name}</h5>`
    }
}) 

module.exports = mongoose.model('Alumni', AlumniSchema);