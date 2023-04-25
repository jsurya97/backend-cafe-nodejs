const express = require("express");

const connection = require("../connection");
const router = express.Router();

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post("/signup", (req, res) => {
  console.log("11111111111");
  let user = req.body;
  query = "select email,password,role,status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query =
          'insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,"false","user")';
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Successfully registred" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email already exsist." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;
  console.log(req.body);
  query = "select email,password,role,status from user where email=? ";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        return res
          .status(401)
          .json({ message: "Incorrect username or password" });
      } else if (results[0].status == "false") {
        return res.status(401).json({ message: "Waiting for admin approval" });
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        //require('crypto').randomBytes(64).toString('hex')
        console.log("33333333");
        console.log(process.env.ACCESS_TOKEN);
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        return res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(500)
          .json({ message: "Something went wrong please try after some time" });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Something went wrong please try after some time" });
    }
  });
});




router.get("/get", auth.authenticateToken,checkRole.checkRole, (req, res) => {
  var query =
    "select id ,name,email,contactNumber,status from user where role='user'";
  connection.query(query, (err, result) => {
    if (!err) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/update", auth.authenticateToken, (req, res) => {
  let user = req.body;
  query = "update user set status =? where id=?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "user id does not exist" });
      }
      return res.status(200).json({ message: "user updated successfully" });
    } else {
      return res.status(400).json(err);
    }
  });
});

router.get("/checkToken", auth.authenticateToken, (req, res) => {
  return res.status(200).json({message:""});
});

router.post("/changePassword",auth.authenticateToken, (req, res) => {
  console.log("11111111111");
  let user = req.body;
  let email = res.locals.email;
  console.log(res.locals)
  query = "select * from user where email=? and password=?";
  connection.query(query, [email,user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Inncorrect password" });
      }else if(results[0].password == user.oldPassword){
        query =
          'update user set password =? where email=?';
        connection.query(
          query,
          [user.newPassword ,email],
          (err, results) => {
            if (!err) {
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "something went wrong" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});


var transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        uesr:process.env.EMAIL,
        password:process.env.PASSWORD
    }
})

router.post('/forgotpassword', (req, res) => {
    console.log("forgotpassword")
    const user =req.body;
    query = "select email,password from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            console.log(results.length)
            if(results.length<=0){
                return res.status(500).json({message:"User does not exsit"})
            }else{
                var mailOptions = {
                    from:process.env.EMAIL,
                    to:results[0].email,
                    subject:"Password by cafe management system",
                    html:'<p><b>Your login details for cafe management system</b><br><b>Email:</b>'+results[0].email+'<b>Password:</b>'+results[0].password+'<br> <a href="http://localhost:4200/">Click here to login</a></p>'
                };
                transport.sendMail(mailOptions,function(err,info) {
                    if(err){
                        console.log(err);
                    }else{
                        console.log("email sent successfully",info.response)
                    }
                });
                return res.status(200).json({message:"Password set successfully to your email"})
            }
        }else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router;
