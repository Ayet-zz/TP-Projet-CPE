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
                    ContentModel.read(json.PRES_ID, function (err, content) {
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
            }         
        });
    });

}