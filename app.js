const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DBError: ${e.message}`);
    process.exit(1);
  }
};
initializationDBAndServer();

// Get movie API
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name
                           FROM movie
                           `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Add movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO
                           movie(director_id,movie_name,lead_actor)
                           VALUES (${directorId},
                                '${movieName}',
                                '${leadActor}')`;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//Get movieId API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieIdQuery = `SELECT *
                              FROM movie
                              WHERE movie_id = ${movieId}`;
  const movie = await db.get(getMovieIdQuery);
  response.send(movie);
});

//Update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie
                               SET director_id = ${directorId},
                                    movie_name = '${movieName}',
                                    lead_actor = '${leadActor}'
                              WHERE movie_id = ${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM
                              movie
                              WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Get directors API
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT *
                           FROM director
                           `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };
  const movieArray = await db.all(getDirectorQuery);
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//Get API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `SELECT movie_name
                           FROM movie
                           WHERE director_id = ${directorId}
                           `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      movieName: dbObject.movie_name,
    };
  };
  const movieArray = await db.all(getDirectorQuery);
  response.send(
    movieArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

module.exports = app;
