var express = require('express');
var TaskModel    = require('../libs/mongoose').TaskModel;
var DeviceModel    = require('../libs/mongoose').DeviceModel;
var PartsModel = require('../libs/mongoose').PartsModel;
var log         = require('../libs/log')(module);
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
   res.send('all tasks');
 //  return TaskModel.findOneAndUpdate({type:null},{type:'FBL'},function(err,data){
 //     return res.send({error:err,data:data});
 // })
   // return TaskModel.remove({title:req.query.title},function(err,data){
   //    if(err)res.send({error:err})
   //    else res.send({data:data})
   // });
});

router.get('/taskparts',function(req,res,next){
   return PartsModel.find({task_id:req.query.id_task},function(err,data){
      res.send(data);
  })
})

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
            if(err || !task){
               res.statusCode = 400;
               log.error('<TaskModel> (%d) find: %s',res.statusCode,JSON.stringify(err));
               return res.send({ error: err, device : device });
            }
            else {
               return res.send({task:task,device:device});
            }
         })
      }
   })
})

router.get('/dotask',function(req,res,next){
   var incom = req.query;

   return TaskModel.findOne({id:incom.id_task},function(err,task){
      if(err || !task)errorHandler(res,err,'There is no task');
      else {
         return getDoTaskData(incom,res,task);
      }
   })
})

function getDoTaskData(incom,res,task){
   return PartsModel.findOne({task_id:task.id,$or:[{device:null},{device:incom.device_id}]}).where('result').equals(null).exec(function(err,parts){//.where('device').equals(null).where('device').equals(incom.device_id)
      if(err || !parts)errorHandler(res,err,'There is no free parts for this task');
      else {
          // return res.send(parts)
         // return PartsModel.remove({task_id:parts.task_id},function(err,data){
         //    return res.send({error:err,data:data});
         // })
         return PartsModel.findOneAndUpdate({id:parts.id},{device:incom.device_id},function(err,parts){
            if(err || !parts)errorHandler(res,err,'There is no free parts for this task');
            else {
               return res.send({type:task.type,data:parts.data,part:parts.id,result:parts.result});
            }
         });
      }
   })
}

router.post('/dotask',function(req,res,next){
   var incom = req.body;

   return TaskModel.findOne({id:incom.id_task},function(err,task){
      if(err || !task)errorHandler(res,err,'There is no task');
      else {
         return postDoTaskData(incom,res,task,next);
      }
   })
})

function postDoTaskData(incom,res,task,next){
   return PartsModel.findOne({task_id:task.id,id:incom.part_id}).exec(function(err,parts){//.where('device').equals(incom.device_id)
      if(err || !parts)errorHandler(res,err,'There is no such parts for this device');
      else {
         return PartsModel.findOneAndUpdate({id:parts.id},{result : incom.result},function(err,parts){
            if(err || !parts)errorHandler(res,err,'There is such parts for this task or can`t save data');
            else {
               return res.send('ok');// && next(task.id);
            }
         });
      }
   })
}

router.get('/addtask',function(req,res,next){
   res.render('task', { title: 'Create new task' });
})

router.post('/addtask',function(req,res,next){
   var incom = req.body;

   return TaskModel.findOne({title:incom.title},function(err,task){
      if(err || task)errorHandler(res,err,'Error while saving. Task with this title already exists');
      else {
         var new_task = new TaskModel({title: incom.title,author:incom.author,description:incom.description,type : incom.type,data : incom.data});
         new_task.save(function(err){
            if(err)errorHandler(res,err,'Can`t save new task');
            else res.send('Sucess, your task has been added');
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
