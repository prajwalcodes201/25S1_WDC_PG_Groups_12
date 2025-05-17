var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
var mysql = require('mysql');
var bcrypt = require('bcrypt');

var dbConnectionPool = mysql.createPool({
  host: 'localhost',
  password: '1111',
  user: 'root',
  database: 'battle_of_wits',
  dateStrings: true
});

// ✅ Test connection
dbConnectionPool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ MySQL connection successful!');
    connection.release();
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO Users (username, password_hash) VALUES (?, ?)';
  return dbConnectionPool.query(query, [username, password_hash], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send('username exists');
      }
      return res.status(500).send('register failed');
    }
    return res.send('register success'); //
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM Users WHERE username = ?';
  dbConnectionPool.query(query, [username], async (err, results) => {
    if (err) {
      res.status(500).send('database error');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('username not found');
      return;
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      req.session.user = {
        user_id: user.user_id,
        username: user.username
      };
      res.send('login success');
    } else {
      res.status(401).send('password incorrect');
    }
  });
});

app.get('/check-login', (req, res) => {
  if (req.session.user) {
    res.send(`login user:${req.session.user.username}`);
  } else {
    res.status(401).send('not logged in');
  }
});

app.use(function (req, res, next) {
  req.pool = dbConnectionPool;
  next();
});

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
