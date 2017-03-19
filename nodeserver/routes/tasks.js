var express = require('express');
var TaskModel    = require('../libs/mongoose').TaskModel;
var DeviceModel    = require('../libs/mongoose').DeviceModel;
var log         = require('../libs/log')(module);
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('all tasks');
});

router.get('/all', function(req, res, next) {
   return TaskModel.find(function (err, tasks) {
        if (!err) {
            return res.send(tasks);
        } else {
            errorHandler(res,err,'Can`t find tasks');
        }
    });
});

router.post('/active',function(req,res,next){
   var incom = req.body;

   DeviceModel.find({uuid:incom.id_device},function (err, device) {
        if (err || !device.length ) {
           errorHandler(res,err, 'There are no Devices with this id');
        } else {

        return TaskModel.find({id:incom.id_task},function(err,task){
           if (err || !task.length ) {
              errorHandler(res,err,'There are no tasks with this id' );
           }else{

           return DeviceModel.findOneAndUpdate({uuid:incom.id_device},{status : 'working', working_task : incom.id_task},function(err){
             if(err)errorHandler(res,err,'Can`t save task to this device');
             else
               return res.send('Ok');
          })
         }
        })
     }
    })
})

router.get('/active',function(req,res,next){
   var incom = req.query;

   return DeviceModel.findOne({uuid:incom.id_device},function(err,device){
      if(err || !device)errorHandler(res,err,'Can`t find device')
      else {
         return TaskModel.findOne({id: device.working_task},function(err,task){
            if(err || !task)errorHandler(res,err,'Can`t find working task');
            else return res.send(task);
         })
      }
   })
})

function errorHandler(res,err,message){
   res.statusCode = 400;
   log.error('<TaskModel> (%d) find: %s',res.statusCode,JSON.stringify(err));
   return res.send({ error: message });
}

module.exports = router;
