var express=require("express"),
			 app=express(),
			 expressLayouts=require("express-ejs-layouts"),
			 bodyParser=require("body-parser"),
			 mongoose=require("mongoose"),
			 flash=require("connect-flash"),
			 $ = require('jquery'),
			 User= require ("./models/User"),
			 flash=require('connect-flash'),
			 session=require('express-session'),
			 passport=require('passport'),
			 rp = require('request-promise');



//Passport 

require('./config/passport')(passport);


//makes use of the public folder to serve static files
// app.use(expressLayouts);
app.use(express.static(__dirname + '/public'));


app.set("view engine",  "ejs");
// app.use(express.urlencoded({extended: true}))

app.use(express.urlencoded({extended: true}))



//express session
app.use(session({
  secret: 'mystery',
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());


const requestOptions = {
  method: 'GET',
  uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
  qs: {
    'start': '1',
    'limit': '5000',
    'convert': 'USD'
  },
  headers: {
    'X-CMC_PRO_API_KEY': , //INSERT YOUR CIONMARKETCAP API KEY HERE
    'Accept': 'application/json',
    'Accept-Encoding': 'deflate, gzip'
  },
  json: true,
  gzip: true
};


var btc;

rp(requestOptions).then(response => {

	for (var j=0;j<response.data.length;j++){
			if(response.data[j].name==="Bitcoin"){
				btc=response.data[j].quote.USD.price;
			}
	}
});

//global vars
app.use((req, res, next)=>{
	res.locals.currentuser=req.user;
	res.locals.success_msg=req.flash("success_msg");
	res.locals.error_msg=req.flash("error_msg");
		res.locals.error=req.flash("error");
	res.locals.btc=btc;

	next();
})




mongoose.connect("mongodb://localhost/crypto_app",{
	useNewUrlParser:true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(() =>{
	console.log("connected to db");
}).catch(err=>{
	console.log("Error:",err.message);
})


//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 


//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


const PORT = process.env.PORT || 8000;


// User.create({name: "Basat", email:"basat98@gmail.com", password:"test123", portfolio: []}, 
// 	function(err, doc){
// 		if(err){
// 			console.log("first item not added");
// 		}

// 	});



// rp(requestOptions).then(response => {
// 	for(var i=0; i<response.data.length;i++){
// 		console.log(response.data[i].name);
// 	}
//   // console.log('API call response:', response);
// }).catch((err) => {
//   console.log('API call error:', err.message);
// });
app.get('/landing', function(req,res){
	console.log("reached the right page");

	res.render("landing");


});


app.post("/test",function(req,res){
	let test=[];
	var k=0;
	rp(requestOptions).then(response => {

		for(var i=0;i<req.body.cryptocurrency.length;i++){
		for (var j=0;j<response.data.length;j++){
			if(response.data[i].name==="Bitcoin"){
				btc=response.data[i].quote.USD.price;
			}

			if(response.data[j].name===req.body.cryptocurrency[i].name){
			var crypto={
				name:req.body.cryptocurrency[i].name,
				price:response.data[j].quote.USD.price,
				amount:req.body.cryptocurrency[i].amount
			}
			test[k]=crypto;
			k++;
			break;
		}
	}
}

var input={
	portfol:test
}

User.findOneAndUpdate({"_id": req.user._id}, {$push: {"portfolio": input}}, (err, result)=>{
	if(err){
		console.log("could not add portfolio to the database");
	}else{
		console.log("added successfully");
	}
});


res.redirect("/users/view");
		
	}).catch((err) => {
	  console.log('API call error:', err.message);
	});

});





app.listen(PORT, function(){
	console.log(`listening on port ${PORT}`);
});
