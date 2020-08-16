const express = require('express');
const morgan = require('morgan');
const errors = require('./middlewares/errors');
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/academia', require('./routers/academia.js'));
// app.use('/users',require('./routers/uses.js'))

app.get('/', (req, res) => {
    res.status(200).send('Okaeri');
})

app.use(errors.notFoundHandler);
app.use(errors.logErrors);
app.use(errors.genericErrorHandler);
module.exports = app;