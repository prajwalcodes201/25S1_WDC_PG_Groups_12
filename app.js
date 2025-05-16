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
  secret: 'your-secret-key', // 换成你自己的随机字符串
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true 只在 HTTPS 下传输
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
    connection.release(); // return connection to pool
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO Users (username, password_hash) VALUES (?, ?)';
  return dbConnectionPool.query(query, [username, password_hash], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send('用户名已存在');
      }
      return res.status(500).send('注册失败');
    }
    return res.send('注册成功'); // ✅ 明确 return
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM Users WHERE username = ?';
  dbConnectionPool.query(query, [username], async (err, results) => {
    if (err) {
      res.status(500).send('数据库错误');
      return;
    }

    if (results.length === 0) {
      res.status(401).send('用户不存在');
      return;
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      req.session.user = {
        user_id: user.user_id,
        username: user.username
      };
      res.send('登录成功');
    } else {
      res.status(401).send('密码错误');
    }
  });
});

app.get('/check-login', (req, res) => {
  if (req.session.user) {
    res.send(`当前已登录用户：${req.session.user.username}`);
  } else {
    res.status(401).send('未登录');
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
