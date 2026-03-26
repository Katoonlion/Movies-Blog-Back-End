const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const verifyToken = require('../middleware/verify-token');


// GET /movies --> show all movies
router.get('/', async(req, res) => {
  try {
      const movies = await Movie.find({}).populate('owner');
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// GET /movies/:movieId --> show one movie
router.get('/:movieId', async(req, res) => {
    try {
      const movie = await Movie.findById(req.params.movieId).populate(['owner','comments.author']);
            
      if (!movie) {
          return res.status(404).json({ err: 'Movie not found' });
      };

      res.status(200).json(movie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// POST /moives --> Create new movie review
router.post('/', verifyToken, async(req, res) => {
    try {
      req.body.owner = req.user._id;
      const movie = await Movie.create(req.body);
      // movie._doc.owner = req.user;
      await movie.populate('owner');

      res.status(201).json(movie);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// PUT /movies/:movieId --> Update movie review by owner
router.put('/:movieId', verifyToken, async(req, res) => {
    try {
      console.log('req.body:', req.body);
      // Find movie id
      const movie = await Movie.findById(req.params.movieId);

      // If not Blog's owner
      if(!movie.owner.equals(req.user._id)) {
        return res.status(403).json({ error: "You're not allowed"});
      };

      // Update movie
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.movieId,
        req.body,
        { new: true }
      );

      // Append req.user to the author property:
      updatedMovie._doc.owner = req.user;

      res.status(200).json(updatedMovie);
    } catch (error) {
      res.status(500).json({ error: error.message });        
    }
});

// DELETE /movies/:movieId --> Delete movie review by owner
router.delete('/:movieId', verifyToken, async(req, res) => {
    try {
      // Find movie id
      const movie = await Movie.findById(req.params.movieId);

      // If not Blog's owner
      if(!movie.owner.equals(req.user._id)) {
        return res.status(403).json({ error: "You're not allowed"});
      };

      const deletedMovie = await Movie.findByIdAndDelete(req.params.movieId);

      res.status(200).json(deletedMovie);    
    } catch (error) {
      res.status(500).json({ error: error.message });        
    }
});

// CREATE comment
router.post('/:movieId/comments', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    req.body.author = req.user._id;
    movie.comments.push(req.body);

    await movie.save();

    const updatedMovie = await Movie.findById(req.params.movieId).populate([
      'owner',
      'comments.author',
    ]);

    res.status(201).json(updatedMovie);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// UPDATE comment
router.put('/:movieId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    const comment = movie.comments.id(req.params.commentId);

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'Not authorized' });
    }

    comment.text = req.body.text;

    await movie.save();

    const updatedMovie = await Movie.findById(req.params.movieId).populate([
      'owner',
      'comments.author',
    ]);

    res.status(200).json(updatedMovie);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// DELETE comment
router.delete('/:movieId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    const comment = movie.comments.id(req.params.commentId);

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ err: 'Not authorized' });
    }

    comment.deleteOne();
    await movie.save();

    const updatedMovie = await Movie.findById(req.params.movieId).populate([
      'owner',
      'comments.author',
    ]);

    res.status(200).json(updatedMovie);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Like function

router.put('/:movieId/like', verifyToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ err: 'Movie not found' });
    }

    const userId = req.user._id;
    const alreadyLiked = movie.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (alreadyLiked) {
      movie.likes.pull(userId);
    } else {
      movie.likes.push(userId);
    }

    await movie.save();

    const updatedMovie = await Movie.findById(req.params.movieId)
      .populate('owner')
      .populate('comments.author');

    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;

