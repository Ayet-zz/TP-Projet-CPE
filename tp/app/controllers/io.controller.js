'use strict';
// io.controller.js

var fs = require("fs");
var utils = require("../utils/utils.js");
var CONFIG = require('../../config.json');

var ContentModel = require("../models/content.model.js");

process.env.CONFIG = JSON.stringify(CONFIG);

module.exports = IoController;

function IoController(){
   var socketMap= new Map();
}

IoController.listen= function(httpServer){

    var io = require('socket.io').listen(httpServer);

    io.sockets.on('connection',function(socket){
        socket.emit('connection');
        socket.on('data_comm',function(id)
        {
            socketMap[id]=socket;
        });
        socket.on('slideEvent',function(json){
            if(message!=null && message!=undefined)
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
                    socket.broadcast.emit('slideEvent',content);
                     });
                } 
            }         
        });
    });

}