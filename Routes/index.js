const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const bcrypt = require('bcrypt');
const config = require('../config');
var jwt = require('jsonwebtoken');


routes.get('/', (req, res) => {
  res.send('<h1>is ready</h1>');
});


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

module.exports = routes;