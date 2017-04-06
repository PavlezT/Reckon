var PartsModel = require('../libs/mongoose').PartsModel;
var TaskModel    = require('../libs/mongoose').TaskModel;
var log         = require('../libs/log')(module);

module.exports.FBL={
   map :  function(task){
      var data = task.data;
      var step = 40;
      for(var i=0; i < data.length; i= i + step){
         var part_data = data.substring(i,i+step);
         var part = new PartsModel({task_id:task.id,data:part_data});
         part.save(function(err){
            if(err)errorHandler(err,'FBL map error',task);
            else console.log('saved: ',part.id)
         })
      }
   },
   reduce : function(task,incomdata){
      var data = incomdata || [];

      PartsModel.findOne({task_id:task.id},function(err,part){
         console.log('parts',part)
         if(err || !part){
            errorHandler(err,'FBL reduce error',task);
            if(incomdata){
               TaskModel.findOneAndUpdate({id:task.id},{result:data,status:'Done'},function(err){
                  if(err)errorHandler(err,'FBL reduce error result save task',task);
               })
            }
         }
         else if(!part.result)errorHandler({},'FBL there is part without result');
         else {
            data.push(part.result);
            console.log('data pushed',data);
            PartsModel.remove({id:part.id},function(err){
               console.log('removed');
               if(err)errorHandler(err,'FBL error removing part',task);
               else module.exports.FBL.reduce(task,data);
            })
         }
      })
   }
}

module.exports.FSL = {
   map : function(task){

   },
   reduce : function(task,incom){

   }
}

module.exports.CF = {
   map: function(task){
      console.log('CF')
   },
   reduce : function(task,incom){

   }
}

function errorHandler(err,message,task){
   log.error('<TaskDevider> (%d) find: %s',message,JSON.stringify(err));
   log.error('<TaskDevider> Task obj: %s',JSON.stringify(task));
}
