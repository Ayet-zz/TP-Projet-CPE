 // content.route.js
 "use strict";
 
  var express = require("express");
  var router = express.Router();
  module.exports = router;
  
  var multer = require("multer");
  var multerMiddleware = multer({ "dest": "/tmp/" });  
 
  var contentController = require('./../controllers/content.controllers');
 
   router.route('/contents')
	 .get(contentController.list)
 	 .post(multerMiddleware.single("file"), contentController.create);
 
    router.route('/contents/:contentId')
 	 .get(contentController.read)
// 	 .put(contentController.update)
// 	 .delete(contentController.delete);
 
   router.param('contentId', function(req, res, next, id) {
	   req.contentId = id;
	   next();
   });

