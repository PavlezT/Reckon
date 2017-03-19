var mongoose    = require('mongoose');
var log         = require('./log')(module);
var uuid = require('node-uuid');

mongoose.connect('mongodb://localhost/test1');
var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

var Schema = mongoose.Schema;

// Schemas
var Task = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: false },
    id : {type: String, required : false, default: uuid.v1 },
    created : { type: Date, default: Date.now }
});

var Device = new Schema({
   uuid : {type : String, required : true},
   model : {type : String, required : false},
   serial : {type : String, required : false},
   platform : {type : String, required : true},
   name: {type : String, required : true},
   status : { type : String, required : false, default : 'online'},
   working_task : {type : String, required : false}
})

// validation
Task.path('title').validate(function (v) {
    return v.length > 1 && v.length < 70;
});

var TaskModel = mongoose.model('Task', Task);
var DeviceModel = mongoose.model('Device',Device);

// var tasks = new TaskModel({title:'first',author:'admin',description:'Testing task'});
// tasks.save(function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('meow');
//   }
// });

module.exports.TaskModel = TaskModel;
module.exports.DeviceModel = DeviceModel;
