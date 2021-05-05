var express = require('express');
const { dbconnection } = require('./dbconnection');
const cors = require('cors');
const routes = require('./Routes');

const app = express();


app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(routes);


var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});
