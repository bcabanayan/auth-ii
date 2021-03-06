const express = require('express')
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json(), cors());

const secret = `terces`;

// method to generate token

function generateToken(user) {
    const payload = {
        username: user.username
    };
    const options = {
        expiresIn: '1h',
        jwtid: 'jwtid'
    };
    return jwt.sign(payload, secret, options);
};

// method to protect endpoint

function protected(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) {
                res
                    .status(401)
                    .json({message: 'You shall not pass!'});
            }
            else {
                next();
            }
        });
    }
    else {
        res
            .status(401)
            .json({message: 'No token provided.'});
    }
};

// method to register new user and return token

server.post('/api/register', (req, res) => {
    const creds = req.body;
    const hash = bcrypt.hashSync(creds.password, 12);
    creds.password = hash;
    if (req.body.username && req.body.password && req.body.department) {
        db('users_table')
        .insert(creds)
        .then(ids => {
            const id = ids[0];
            db('users_table')
                .where('id', id)
                .then(user => {
                    const token = generateToken(user);
                    res
                        .status(201)
                        .json({subject: id, token});
                })
                .catch(err => {
                    res
                        .status(500)
                        .json({message: 'The user could not be registered at this time.'})
                })
        })
        .catch(err => {
            res
                .status(500)
                .json({message: 'The user could not be registered at this time.'})
        });
    }
    else {
        res
            .status(400)
            .json({message: 'Please provide a username, password, and department to register.'})
    }
});

// method to login existing user and return token

server.post('/api/login', (req, res) => {
    const creds = req.body;
    if (req.body.username && req.body.password) {
        db('users_table')
            .where('username', creds.username)
            .then(user => {
                if (user.length && bcrypt.compareSync(creds.password, user[0].password)) {
                    const token = generateToken(user);
                    res
                        .json({subject: user[0].id, token});
                }
                else {
                    res
                        .status(401)
                        .json({message: 'You shall not pass!!!'});
                }
            })
            .catch(err => {
                res
                    .status(500)
                    .json({message: 'The user could not be logged in at this time.'})
            });
    }
    else {
        res
            .status(400)
            .json({message: 'Please provide a username and a password to log in.'})
    }
});

// method to get users using protected method to verify token

server.get('/api/users', protected, (req, res) => {
    db('users_table')
        .select('id', 'username')
        .then(users => {
            res
                .json(users)
        })
        .catch(err => {
            res
                .status(500)
                .json({message: `The users' information could not be retrieved at this time.`})
        })
})

const PORT = 4040;

server.listen(PORT, () => console.log(`Running on ${PORT}`));