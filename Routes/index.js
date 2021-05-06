const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const bcrypt = require('bcrypt');
const config = require('../config');
var jwt = require('jsonwebtoken');


routes.get('/', (req, res) => {
  res.send('<h1>is ready</h1>');
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (typeof token !== 'undefined') {
    // const bearer = header.split(' ');
    // const token = bearer[1];
    req.token = token;
    next();
  } else {
    //If header is undefined return Forbidden (403)
    res.sendStatus(403)
  }
}

routes.post('/api/signup', function (req, res) {
  let { username, password } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("grocerypickup").collection("users");
    collection.findOne({ "username": username }, function (err, user) {
      if (user) {
        bcrypt.compare(password, user.password).then(isEqual => {
          if (isEqual) {
            jwt.sign({ id: user['_id'].toString() }, config.secret, function (err, token) {
              if (err) console.log(err);
              console.log(token);
              console.log("came to create token")
              res.status(200).send({ token: token });
            });
          }
          else {
            res.status(422).send({ error: 'Password is incorrect' });
          }
        })
      }
      else {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(password, salt, function (err, hash) {
            // Store hash in your password DB.
            password = hash;
            var userObj = { username, password };
            collection.insertOne(userObj, function (err, result) {
              if (err) console.log(err);

              console.log(result.ops[0]['_id']);
              if (result) {
                jwt.sign({ id: result.ops[0]['_id'].toString() }, config.secret, function (err, token) {
                  if (err) console.log(err);
                  console.log(token);
                  console.log("came to create token")
                  res.status(200).send({ token: token });
                });

              }
            });
          });
        });
      }
    });
    // dbconnection.close();
  });
})

routes.post('/api/addstore', verifyToken, function (req, res) {
  const { storename, description, coordinates } = req.body;

  const token = req.token;
  jwt.verify(token, config.secret, function (err, decoded) {
    dbconnection.connect(err => {
      const collection = dbconnection.db("grocerypickup").collection("stores");
      let storeObj = { storename, description, coordinates: coordinates.split(", "), userid: decoded.id };
      collection.insertOne(storeObj, function (err, result) {
        if (err) console.log(err);
        res.status(200).send({ payload: result.ops[0] });
      })
    });

  });

});

module.exports = routes;