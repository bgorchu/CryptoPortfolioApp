var express=require("express");
const router=express.Router();
const bcrypt= require('bcryptjs');
const passport=require('passport');
const {ensureAuthenticated}=require("../config/auth");
const rp = require('request-promise');


//User model
const User= require ("../models/User");

const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
  qs: {
    'start': '1',
    'limit': '5000',
    'convert': 'USD'
  },
  headers: {
    'X-CMC_PRO_API_KEY': '19cd8145-8f6e-4ed3-83a4-d1edf8c0339e',
    'Accept': 'application/json',
    'Accept-Encoding': 'deflate, gzip'
  },
  json: true,
  gzip: true
};


router.get("/login", function(req, res){
	res.render("login");
});


router.get("/register", function(req, res){
	res.render("register");
});




router.get("/view", ensureAuthenticated, function(req,res){

	User.findOne({"_id": req.user._id}, function(err,person){
		if(err){
			console.log(err);
			res.redirect("/portfolio");
		}else{

			var old=person;
			rp(requestOptions).then(response => {

			for (var i=0;i<old.portfolio.length;i++){
				for(var j=0; j<old.portfolio[i].portfol.length;j++){
					for(var k=0; k<response.data.length;k++){
						if(response.data[k].name==old.portfolio[i].portfol[j].name){
							console.log("true");
							old.portfolio[i].portfol[j].price=response.data[k].quote.USD.price.toString(10);
						}
					}

				}

			}

			person.set(old);

	
			
			person.save();

			res.render("view", {portfolio: person.portfolio});

			});

		}
	});

});




router.post("/register", function(req, res){

	const {name, email, password, password2}= req.body;
	let errors=[];

	//check required fields
	if(!name || !email || !password2 || !password){
		errors.push({msg:"Please fill in all fields"})
	}

	//check passwords match

	if(password!==password2){
		errors.push({msg:"Passwords do not match"})

	}

	if(password.length <6){
		errors.push({msg:"Password needs to be at least 6 characters long"})

	}

	if(errors.length>0){
		res.render('register', {
			errors,
			name,
			email,
			password,
			password2
		});
	}else{
		//validation passed
		User.findOne({email: email})
		.then(user=>{
			if(user){
				//user exists
				errors.push({msg:"Email already taken"});
				res.render('register', {
					errors,
					name,
					email,
					password,
					password2
				});

			}else{
				const newUser= new User({
					name,
					email,
					password
				});

				//password hash
				bcrypt.genSalt(10, (err,salt)=>
					bcrypt.hash(newUser.password, salt, (err, hash)=>{
						if(err) throw err;
						//password is now hashed
						newUser.password=hash;
						newUser.save()
						.then(user=>{
							req.flash("success_msg", "You are now registered!");
							res.redirect('/users/login');
						})
						.catch(err=> console.log(err));
					}));
			}
		});

	}


});

//Login

router.post("/login", (req,res, next)=>{

	passport.authenticate('local', {
		successRedirect: '/portfolio',
		failureRedirect:'/users/login',
		failureFlash: true
	})(req, res, next);


});


//Logout

router.get("/logout", (req,res)=>{

	req.logout();
	req.flash('success_msg',"You are logged out");
	res.redirect('/users/login')
});


router.get("/view/:id/edit", function(req,res){
	User.findById(req.user.id, function(err, found){
		if(err){
			console.log("err")
		}
		var portfolio=found.portfolio.id(req.params.id);
		console.log(portfolio);
		res.render("edit", {portfolio:portfolio});
	});

});


router.post("/view/:id/", function(req,res){

//UPDATE PRICES HERE


	User.findById(req.user.id, function(err, found){
		if(err){
			res.redirect("/users/view");
		}else{
			
			const old=found.portfolio.id(req.params.id);
			console.log("Passed values;"+req.body)

			var updated={
				portfol:req.body.cryptocurrency
			}

			old.set(updated);
			console.log("Updated:"+old);
			found.save();
			res.redirect("/users/view");
		}
	});

});





router.post("/view/:id/remove", function(req,res){

	console.log(req.params.id);

	User.findOneAndUpdate({"_id": req.user.id},{$pull:{

		portfolio:{
			_id:req.params.id
		}


	}}, function(err,result){
		if(err){
			console.log("error: could not delete entry");
			res.redirect("/users/view");
		}else{
			req.flash("success_msg", "Portfolio Deleted!");

			res.redirect("/users/view");


		}
	});
});



module.exports= router;

