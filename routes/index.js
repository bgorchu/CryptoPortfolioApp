var express=require("express");
const router=express.Router();
const {ensureAuthenticated}=require("../config/auth");
var rp= require('request-promise');
// var bodyParser=require("body-parser");



router.get("/portfolio",ensureAuthenticated, function(req, res){
	res.render("inputform");
});




router.get("/", function(req, res){
	res.render("welcome");
});




module.exports= router;
