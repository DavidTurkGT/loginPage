const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const session = require('express-session');

const app = express();

let users = [];
let messages = [];

app.use(express.static('public'));

app.engine('mustache', mustacheExpress());

app.set('views','./views');
app.set('view engine','mustache');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(validator());

app.use(session({
  secret: 'cornbread',
  resave: false,
  saveUninitialized: false
}));

app.get("/", function(req, res){
  if(req.session.username){
    res.redirect("/user");
  }
  else{
    res.render('index');
  }
});

app.get("/user", function(req, res){
  console.log("At user");
  console.log("Session: ",req.session);
  console.log("Username: ", req.session.username);
  res.render("user", {username: req.session.username});
});

app.post("/", function(req, res){
  messages = [];

  if(req.body.button === "login"){
    console.log('You wish to login as: ',req.body.username);
    let loggedUser;
    users.forEach(function(user){
      if(user.username === req.body.username){
        loggedUser = user;
      }
    });

    if(!loggedUser){
      messages.push("Invalid username and password");
      res.render("index", {messages: messages});
    }
    else{
      console.log("Found the user");
      req.checkBody("username", "Please enter a username to login.").notEmpty();
      req.checkBody("password", "Please enter a password to login.").notEmpty();
      req.checkBody("password", "Invalid username and password").equals(loggedUser.password);

      console.log("Body checked!");
      let errors = req.validationErrors();
      console.log("Errors to report: ",errors);

      if(errors){
        errors.forEach(function(error){
          messages.push(error.msg);
        });
        res.render("index", {messages: messages});
      }
      else{
        console.log("Session: ",req.session);
        req.session.username = loggedUser.username;
        console.log("New Session: ",req.session);
        console.log("Username: ",req.session.username);
        res.redirect("/user");
      }

    }


  }
  else if(req.body.button === 'add-user'){
    console.log("You wish to add the user, ", req.body.username);
    //Validate username and password
    req.checkBody("username", "Please enter a username").notEmpty();
    req.checkBody("password", "Please enter a password").notEmpty();

    let errors = req.validationErrors();

    if(errors){
      errors.forEach(function(error){
        messages.push(error.msg);
      });
      res.render("index", {messages: messages});
    }
    else {
      //Check is a user name already exists
      users.forEach(function(user){
        if(user.username === req.body.username){
          messages.push("Username already exists");
        }
      });
      if(messages.length){
        res.render("index", {messages: messages});
      }
      else{
        //Add a new user
        let newUser = {
          username: req.body.username,
          password: req.body.password
        };
        users.push(newUser);
        messages.push("New user created: "+ newUser.username);
        console.log("New user list:",users);
        res.render("index", {messages: messages});
      }
    }
  }
  else{
    res.redirect("/");
  }
});

app.post("/logout", function(req, res){
  console.log("Logging out...");
  req.session.destroy(function(err){
    console.error(err);
  })
  res.redirect("/");
});

app.listen(3000, function(){
  console.log("App running on localhost:3000")
});
