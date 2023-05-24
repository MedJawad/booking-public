import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Admin from "../models/Admin.mjs";
import Movie from "../models/Movie.mjs";

export const addMovie = async (req, res, next) => {
  const extractedToken = req.headers.authorization.split(" ")[1];
  if (!extractedToken || extractedToken.trim() === "") {
    return res.status(404).json({ message: "Token Not Found" });
  }

  let adminId;

  // verify token
  jwt.verify(extractedToken, process.env.SECRET_KEY, (err, decrypted) => {
    if (err) {
      return res.status(400).json({ message: `${err.message}` });
    } else {
      adminId = decrypted.id;
      return;
    }
  });

  // create new movie
  const { title, description, releaseDate, posterUrl, featured, actors, trailerUrl } =
    req.body;
  if (
    !title ||
    title.trim() === "" ||
    !description ||
    description.trim() === "" ||
    !posterUrl ||
    posterUrl.trim() === "" ||
    !trailerUrl ||
    trailerUrl.trim() === ""
  ) {
    return res.status(422).json({ message: "Invalid Inputs" });
  }

  let movie;
  try {
    movie = new Movie({
      description,
      releaseDate: new Date(`${releaseDate}`),
      featured,
      actors,
      admin: adminId,
      posterUrl,
      title,
      trailerUrl,
    });

    const session = await mongoose.startSession();
    session.startTransaction();

    await movie.save({ session });

    const adminUser = await Admin.findById(adminId);
    adminUser.addedMovies.push(movie);
    await adminUser.save({ session });

    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Request Failed" });
  }

  if (!movie) {
    return res.status(500).json({ message: "Request Failed" });
  }

  return res.status(201).json({ movie });
};

export const getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find();
    return res.status(200).json({ movies });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Request Failed" });
  }
};

export const getMovieById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Invalid Movie ID" });
    }
    return res.status(200).json({ movie });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Request Failed" });
  }
};

export const deleteMovieById = async (req, res, next) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    await movie.deleteOne();
    console.log("Movie deleted successfully.");

    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};