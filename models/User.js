const mongoose= require('mongoose');

const PortfolioSchema= new mongoose.Schema({
	portfol:[Object],

});

const UserSchema= new mongoose.Schema({

	name:{
		type:String,
		required:true 
	},
	email:{
		type:String,
		required:true 
	},
	password:{
		type:String,
		required:true 
	},
	date:{
		type:Date,
		default:Date.now 
	},

	portfolio:[PortfolioSchema]
});


const User=mongoose.model('User', UserSchema);
const Portfolio=mongoose.model('Portfolio', PortfolioSchema);

module.exports= User;