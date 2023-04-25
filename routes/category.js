const express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");
var checkRole = require("../services/checkRole");

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let category = req.body;
    query = "insert into category (name) values(?)"
    connection.query(query,[category.name],(err,results)=>{
        if(!err){
            res.status(200).json({message:"Category added successfully"})
        }else{
            res.status(500).json(err);
        }
    })

})


router.get("/get",auth.authenticateToken,(req,res,next)=>{
    var query = "select * from category order by name"
    connection.query(query,(err,results)=>{
        if(!err){
            res.status(200).json(results)
        }else{
            res.status(500).json(err);
        }
    })
})


router.patch("/update",auth.authenticateToken,checkRole.checkRole,(req,res,next)=>{
    let product = req.body
    var query ="update category set name =? where id =?";
    connection.query(query,[product.name,product.id],(err,results)=>{
        if(!err){
            if(res.affectedRows == 0){
                res.status(404).json({message:"category id does not found"})
            }
            res.status(200).json({message:"Category added successfully"})
        }else{
            res.status(500).json(err);
        }
    })
})


module.exports = router