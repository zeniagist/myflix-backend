// initialize body parser
const bodyParser = require('body-parser');

// initialize express.js
const express = require('express'),
    morgan = require('morgan');
const  app = express();
app.use(bodyParser.json());

// initialize mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// initialize passport
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// GET requests
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Movie Database</h1>');
} );

// serves documentation.html
app.use(express.static('public'));

app.use(morgan('common'));

// 1. GET all movies
app.get('/movies', (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// 2. GET movie by title
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movies) => {
        res.json(movies);
        })
        .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
        });
});

// 3. GET genre by title
app.get('/movies/genres/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.status(201).json(movie.Genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 4. GET director by name
app.get('/movies/directors/:Name', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
    .then((director) => {
        res.status(201).json(director.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// 5. GET all users
app.get('/users', (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// 6. Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
        res.json(user);
        })
        .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
        });
});

// 7. POST register new users
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
                .create({
                    FirstName: req.body.FirstName,
                    LastName: req.body.LastName,
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birth: req.body.Birth
                })
                .then((user) =>{res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});


// 8. PUT updated user info
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

// 9. POST add movie to user's favorites list
app.post('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
       $push: { FavoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

// 10. DELETE movie from user's favorites list
app.delete('/users/:Username/Movies/:MovieID', (req, res) => {
    Users.findOneAndRemove({ FavoriteMovies: req.params.MovieID })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.MovieID + ' was not found');
        } else {
          res.status(200).send(req.params.MovieID + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// 11. DELETE a user from database by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
          res.status(200).send(req.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

// listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));