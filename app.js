require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const bodyParser  = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const app=express()

app.use(express.static("public"))
app.set("view engine",'ejs')
app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
    secret : "our secret",
    resave : false,
    saveUninitialized : false
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb+srv://ujjwal:ujjwal@cluster0.ttxeinc.mongodb.net/userDb",{useNewUrlParser:true})

const userSchema = new mongoose.Schema({
    username :String,
    email : String,
    password : String,
})
const qusetionScheam = new mongoose.Schema({
    name :String,
    question :String,
})

const answerSchema = new mongoose.Schema({
    qid:String,
    name : String,
    answer : String
})
userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User",userSchema)
const Question = new mongoose.model("qQuestion",qusetionScheam)
const Answer = new mongoose.model("answer",answerSchema)

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.get("/",function(req,res){
    
    res.render("home")
    
})
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register",function(req,res){
    res.render("register")
})

app.get("/question",function(req,res){
        Question.find({},function(err,posts){
            res.render("question",{title : posts})

        })  
})
app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/")
        }
    })
    
})
app.get("/question/:postid",function(req,res){
    // if(req.isAuthenticated()){
    const requestedPostId = req.params.postid

    Question.findOne({_id: requestedPostId}, function(err, post){
        Answer.find({qid:requestedPostId},function(err,answerpost){
        res.render("answer", {
            post:post,
            answer : answerpost,
             id : requestedPostId
          });
        })
     })
    // }
})
app.post("/question/:postid",function(req,res){
    if(req.isAuthenticated()){
    const requestedPostId = req.params.postid
    
    const answer = new Answer({
        qid:requestedPostId,
        answer:req.body.answerarea,
        name:req.user.username
    })
    answer.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/question/"+requestedPostId)
        }
    })
}else{
    res.redirect("/login")
}
})
app.post("/login",function(req,res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
      })
      req.login(user,function(err){
  if(err){
      console.log(err)
      res.redirect("/register")
  }else{
      passport.authenticate("local")(req,res,function(){
          res.redirect("/question")
      })
  }
      })
})
app.post("/register",function(req,res){
   User.register({username : req.body.username ,email : req.body.email},req.body.password,function(err,user){
      if(err){
        console.log(err)
        res.redirect("/register")
      }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/question")
        })
    }
   })
})
app.post("/question",function(req,res){
    if(req.isAuthenticated()){
    const post = new Question({
      name : req.user.username,
      question :req.body.textarea
    })
    post.save(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/question")
        }
    })
} else{
    res.redirect("/login")
}
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("server has  yo started")
})