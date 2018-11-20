var mongoose    = require('mongoose');
var log         = require('./log')(module);
var uuid = require('node-uuid');

mongoose.connect('mongodb://computing_admin:qwerty123@ds115553.mlab.com:15553/distributed_computing', {useMongoClient: true}); // mongodb://localhost/test1
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
    type : { type: String, required: true },
    data : Schema.Types.Mixed,
    result : Schema.Types.Mixed,
    id : { type: String, required : false, default: uuid.v1 },
    created : { type: Date, default: Date.now },
    status : { type : String, default : 'New' },
    total: {type: Number,required:false, default:0}
});

var Device = new Schema({
   uuid : {type : String, required : true},
   model : {type : String, required : false},
   serial : {type : String, required : false},
   platform : {type : String, required : true},
   name: {type : String, required : true},
   status : { type : String, required : false, default : 'new'},
   working_task : {type : String, required : false}
})

var Part = new Schema({
   id : { type : String, required : false, default: uuid.v4 },
   task_id : { type: String, required : true },
   data : Schema.Types.Mixed,
   result : Schema.Types.Mixed,
   device : { type : String, required : false, default : null }
})

// validation
Task.path('title').validate(function (v) {
    return v.length > 1 && v.length < 70;
});

var TaskModel = mongoose.model('Task', Task);
var DeviceModel = mongoose.model('Device',Device);
var PartsModel = mongoose.model('Part',Part);

// var tasks = new TaskModel({title:'first',author:'admin',description:'Testing task'});
// tasks.save(function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('meow');
//   }
// });

// var part = new PartsModel({task_id:'44ec3e40-0cb0-11e7-931e-6dcf296d1c23',data:'lOrem iPSum'});
// part.save(function(err){
//    if(err)console.log('error part save',err)
//    else console.log('saved')
// })

module.exports.TaskModel = TaskModel;
module.exports.DeviceModel = DeviceModel;
module.exports.PartsModel = PartsModel;

module.exports.types = [
   {name:'FBL',description:'Find Big Letters'},
   {name:'FSL',description:'Find Small Letters'},
   {name:'CF',description:'Calc factorial'},
   {name:'E',description:'Elevate. example: \'6,3\' '}
]
