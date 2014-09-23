var express  = require('express'),
  mongoskin  = require('mongoskin'),
  bodyParser = require('body-parser'),
  logger     = require('morgan');

var app = express()

// Base middleware setup
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(logger())

// Database setup
var db = mongoskin.db('mongodb://@127.0.0.1:27017/test', {safe:true})
var id = mongoskin.helper.toObjectID

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

// Routes
app.get('/', function(req, res, next){
  res.send('Select a collection, e.g., /collections/messages')
})

app.get('/collections/:collectionName', function(req, res, next){
  req.collection.find({}, {
    limit:10, sort: [['_id', -1]]
  }).toArray(function(error, results){
    if (error) return next(error)
    res.send(results)
  })
})

app.post('/collections/:collectionName', function(req, res, next){
  req.collection.insert(req.body, {}, function(error, results){
    if (error) return next(error)
    res.send(results)
  })
})

app.get('/collections/:collectionName/:id', function(req, res, next){
  req.collection.findOne({
    _id: id(req.params.id)
  }, function(error, result){
    if (error) return next(error)
    res.send(result)
  })
})

app.put('/collections/:collectionName/:id', function(req, res, next){
  req.collection.update({
    _id: id(req.params.id)
  }, {$set: req.body}, {safe:true, multi:false},
  function(error, result){
    if (error) return next(error)
    res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
  })
})

app.del('/collections/:collectionName/:id', function(req, res, next){
  req.collection.remove({
    _id: id(req.params.id)
  }, function(error, result){
    if (error) return next(error)
    res.send((result === 1) ? {msg: 'success'} : {msg: 'error'})
  })
})

app.listen(3000, function(){
  console.log('Server is running')
})
