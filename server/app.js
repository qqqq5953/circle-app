var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// 解決跨域問題
const cors = require('cors')
app.use(
  cors({
    origin: ['http://localhost:8080'],
    methods: ['GET', 'POST']
  })
)
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  next()
})

// module.exports = app;

var debug = require('debug')('my-application')
app.set('port', process.env.PORT || 3002)

// 啟動監聽
var server = app.listen(app.get('port'), function () {
  debug('Express server listening on port ' + server.address().port)
})
