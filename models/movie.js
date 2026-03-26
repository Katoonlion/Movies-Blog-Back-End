const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        image: {
            type: String,
            default: '',
            trim: true,
        },
        reviewContent: {
            type: String,
            required: true,
            trim: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        comments: [commentSchema],
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {timestamps: true}
);



const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;

