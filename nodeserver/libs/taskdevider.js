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
         if(err || !part){
            err && errorHandler(err,'FBL reduce error',task);
            if(!err && incomdata){
               TaskModel.findOneAndUpdate({id:task.id},{result:data,status:'Done'},function(err){
                  if(err)errorHandler(err,'FBL reduce error result save task',task);
               })
            }
         }
         else if(!part.result)errorHandler({},'FBL there is part without result',part);
         else {
            data.push(part.result);
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
      var data = task.data;
      var step = 40;
      for(var i=0; i < data.length; i= i + step){
         var part_data = data.substring(i,i+step);
         var part = new PartsModel({task_id:task.id,data:part_data});
         part.save(function(err){
            if(err)errorHandler(err,'FSL map error',task);
            else console.log('saved: ',part.id)
         })
      }
   },
   reduce : function(task,incomdata){
      var data = incomdata || [];

      PartsModel.findOne({task_id:task.id},function(err,part){
         if(err || !part){
            err && errorHandler(err,'FSL reduce error',task);
            if(!err && incomdata){
               TaskModel.findOneAndUpdate({id:task.id},{result:data,status:'Done'},function(err){
                  if(err)errorHandler(err,'FSL reduce error result save task',task);
               })
            }
         }
         else if(!part.result)errorHandler({},'FSL there is part without result',part);
         else {
            data.push(part.result);
            PartsModel.remove({id:part.id},function(err){
               console.log('removed');
               if(err)errorHandler(err,'FSL error removing part',task);
               else module.exports.FBL.reduce(task,data);
            })
         }
      })
   }
}

module.exports.CF = {
   map: function(task){
        var data = task.data;

        for(var i=0;  data-i > 1; i=i+2){
            var part_data = [data-i,data-i-1];
            var part = new PartsModel({task_id:task.id,data:part_data});
            part.save(function(err){
                if(err)errorHandler(err,'CF map error',task);
                else console.log('saved: ',{id:part.id,part_data:part_data})
            })
        }
   },
   reduce : function(task,incom){
        var data = incom || 1;
        PartsModel.findOne({task_id:task.id},function(err,part){
            if(err)errorHandler(err,'CF error reduce',task);
            else if(!part && incom){
                TaskModel.findOneAndUpdate({id:task.id},{result:data,status:'Done'},function(err){
                  if(err)errorHandler(err,'CF reduce error result save task',task);
               })
            } else {
                data = data * part.result;
                PartsModel.remove({id:part.id},function(err){
                    console.log('removed:',part.id);
                    if(err)errorHandler(err,'CF error removing part',task);
                    module.exports.CF.reduce(task,data);
                })
            }
        })
      }
}

module.exports.E = {
    map: function(task){
        var number = task.data.substring(0,task.data.indexOf(','));
        var power = task.data.substring(task.data.indexOf(',')+1,task.data.length);

        for(var i = 0; power - i > 0;i=i+1){
            var part_data = [number,power-i];
            var part = new PartsModel({task_id:task.id,data:part_data});
            part.save(function(err) {
                if(err)errorHandler(err,'E map error',task);
                else console.log('saved: ',{id:part.id,part_data:part_data})
            })
        }
    },
    reduce: function(task,incom){
        var data = incom || 1;
        PartsModel.findOne({task_id:task.id},function(err,part){
            if(err)errorHandler(err,'E error reduce',task);
            else if((!part && incom )){
                TaskModel.findOneAndUpdate({id:task.id},{result:data,status:'Done'},function(err){
                  if(err)errorHandler(err,'E reduce error result save task',task);
               })
            } else if(part) {
                data = data * part.result;
                PartsModel.remove({id:part.id},function(err){
                    console.log('removed:',part.id);
                    if(err)errorHandler(err,'E error removing part',task);
                    module.exports.E.reduce(task,data);
                })
            }
        })
      }
}

module.exports.ballance = function(task,incom,res,sendPartError,sendPart){//sendPartError(err,res,incom) || sendPart(part,incom,res)
    return PartsModel.findOne({task_id:task.id}).where('result').equals(null).exec(function(err,part){
        if(err)return sendPartError(err,res,incom);
        else if(!part){
            sendPartError({error:'There is no parts'},res,incom);
            TaskModel.findOneAndUpdate({id:task.id},{status:'Reducing'},function(err,data){if(err)errorHandler(err,'Ballance error updating status',task)})
            module.exports[task.type].reduce(task);
        } else {
            sendPart(task,part,incom,res);
            return PartsModel.findOneAndUpdate({id:part.id},{device:incom.device_id},function(err){if(err)errorHandler(err,'updating device id in part error',part)});
        }
    })
}

module.exports.reCalcTotal = function(task){
    PartsModel.count({task_id:task.id},function(err,countAll){
        if(err)errorHandler(err,'Counts all parts error',task);
        else PartsModel.count({task_id:task.id}).where('result').ne(null).exec(function(err,count){
            if(err)errorHandler(err,'Counts result parts error',task);
            else {
                var total = countAll > 0 ? (count * 100)/countAll : 0;
                TaskModel.findOneAndUpdate({id:task.id},{total:total.toFixed(2)},function(err,data){
                    if(err)errorHandler(err,'Update task total error',{task:task,total:total});
                })
            }
        })
    })
}

function errorHandler(err,message,task){
   log.error('<TaskDevider> (%d) find: %s',message,JSON.stringify(err));
   log.error('<TaskDevider> Task obj: %s',JSON.stringify(task));
}
