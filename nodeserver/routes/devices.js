var express = require('express');
var DeviceModel    = require('../libs/mongoose').DeviceModel;
var log         = require('../libs/log')(module);
var router = express.Router();

/* GET users listing. */
router.get('/all', function(req, res, next) {
   return DeviceModel.find(function (err, devices) {
       if (!err) {
            return res.send(devices);
       } else {
            res.statusCode = 400;
            log.error('<DeviceModel> (%d): %s',res.statusCode,JSON.stringify(err));
            return res.send({ error: 'There no any devices' });
       }
   });
});

router.post('/',function(req,res,next){
   var incom = req.body;
   
   return DeviceModel.findOne({uuid : incom.uuid},function(err,device){
      if(err || !device){
         var new_device = new DeviceModel({
            uuid : incom.uuid,
            model : incom.model,
            serial : incom.serial,
            platform : incom.platform,
            name : incom.name,
            status  : 'online'
         })
         return new_device.save(function(err){
            if(err){
               res.statusCode = 400;
               log.error('<DeviceModel> can`t save new device (%d): %s',res.statusCode,JSON.stringify(err));
               return res.send({ error: 'Can`t save new device' });
            } else {
               log.info('<DeviceModel> new device saved %s',incom.uuid);
               return res.send('Ok');
            }
         })
      }
      return res.send('Ok');
   })
})

module.exports = router;
