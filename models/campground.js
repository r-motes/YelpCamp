const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');


const imageSchema = new Schema({
    url: String,
    filename: String,
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ imageSchema ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
    geometry: {
        type: {
            String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

// campgroundに結び付いているレビューを削除するためのミドルウェア
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
