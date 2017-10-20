'use strict';
// io.controller.js

var fs = require("fs");
var utils = require("../utils/utils.js");
var CONFIG = require('../../config.json');

var ContentModel = require("../models/content.model.js");

process.env.CONFIG = JSON.stringify(CONFIG);

module.exports = IoController;

function IoController(){

}

IoController.listen= function(httpServer){
        var socketMap= new Map();
        var currentPresId;
        var cptSlide;
        var io = require('socket.io')(httpServer);
        io.on('connection',function(socket){
        
        socket.emit('connection');
        
        socket.on('data_comm',function(id)
        {
            socketMap[id]=socket;
        });
        socket.on('disconnect', function() {
            delete socketMap[socket.id];
            });
        socket.on('slidEvent',function(json){
            if(json!=null && json!=undefined)
            {
                if(json.CMD!=undefined && json.CMD!="PAUSE")
                {
                    if(json.CMD=="START")
                    {
                        currentPresId=json.PRES_ID;
                        cptSlide=0;
                    }
                    if(currentPresId!=null && currentPresId!=undefined)
                    {
                        fs.readFile(CONFIG.presentationDirectory+"/"+currentPresId+".pres.json",function(err,data)
                        {
                            if(!!err)
                            {	
                                console.error(err);
                                return;
                            }
                            var parsed = JSON.parse(data);
                            if(parsed.slidArray.length>=1){
                                switch(json.CMD){
                                    case "START":
                                    cptSlide=0;
                                    break;
                                    case "BEGIN":
                                    cptSlide=0;
                                    break;
                                    case "END":
                                    cptSlide=parsed.slidArray.length-1;
                                    break;
                                    case "NEXT":
                                    if(cptSlide<parsed.slidArray.length-1)
                                    cptSlide=cptSlide+1;
                                    break;
                                    case "PREV":
                                    if(cptSlide>0)
                                    cptSlide=cptSlide-1;
                                    break;
                                }
                                var currentSlideId= parsed.slidArray[cptSlide].id;
                                ContentModel.read(currentSlideId, function (err, content) {
                                    if(!!err)
                                        {
                                            console.error(err);
                                            return err;
                                        }
                                content.src = "/contents/" + content.id;
                                for (var i in socketMap){
                                    socketMap[i].emit('currentSlidEvent',content);
                                }
                                });
                            }
                                       
                       
                         });
                    
                    } 
                }
            }         
        });
    });

}