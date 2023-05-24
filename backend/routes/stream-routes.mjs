import express from "express";
import { getMovieDetails }from('../controllers/stream-controller.js');

const router = express.Router();

// Stream routes

router.get('/:movieId', getMovieDetails);

module.exports = router;
