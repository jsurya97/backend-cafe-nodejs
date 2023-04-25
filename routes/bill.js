const express = require("express");
const connection = require("../connection");
const router = express.Router();
let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
let fs = require("fs");
let uuid = require("uuid");
var auth = require("../services/authentication");

router.post("/generateReport", auth.authenticateToken, (req, res, next) => {
  let generateuuid = uuid.v1();
  const orderDetails = req.body;
  var productDetailsReport = JSON.parse(orderDetails.productDetails);
  var query =
    "insert into bill (name,uuid,email,contactNumber,paymentMethod,total,productDetails,createdBy) values(?,?,?,?,?,?,?,?)";
  connection.query(
    query,
    [
      orderDetails.name,
      generateuuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      res.locals.email,
    ],
    (err, results) => {
      if (!err) {
        ejs.renderFile(
          path.join(__dirname, "", "report.ejs"),
          {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount,
          },
          (err, results) => {
            if (err) {
              return res.status(500).json(err);
            } else {
              pdf
                .create(results)
                .toFile(
                  "./generated_pdf/" + generateuuid + ".pdf",
                  function (err, data) {
                    if (err) {
                      return res.status(500).json(err);
                    } else {
                      return res.status(200).json(uuid);
                    }
                  }
                );
            }
          }
        );
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

router.post("/getPdf",auth.authenticateToken,function(req,res){
    const orderDetails = req.body;
    let generateuuid = uuid.v1();
    const pdfPath = "./generated_pdf/" + orderDetails.uuid + ".pdf";
    if(fs.existsSync(pdfPath)){
        res.contentType('application/pdf')
        fs.createReadStream(pdfPath).pipe(res)
    }else{

        const pdfPath = "./generated_pdf/" + generateuuid + ".pdf";
       
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(
            path.join(__dirname, "", "report.ejs"),
            {
              productDetails: productDetailsReport,
              name: orderDetails.name,
              email: orderDetails.email,
              contactNumber: orderDetails.contactNumber,
              paymentMethod: orderDetails.paymentMethod,
              totalAmount: orderDetails.totalAmount,
            },
            (err, results) => {
              if (err) {
                return res.status(500).json(err);
              } else {
                pdf
                  .create(results)
                  .toFile(
                    "./generated_pdf/" + generateuuid + ".pdf",
                    function (err, data) {
                      if (err) {
                        return res.status(500).json(err);
                      } else {
                        res.contentType('application/pdf')
                        fs.createReadStream(pdfPath).pipe(res)
                      }
                    }
                  );
              }
            } 
          );
    }
})


router.get("/getbill",auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "select * from bill order by id DESC";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }else{
            return res.status(500).json(err)
        }
    })
})

router.delete("/delete/:id",auth.authenticateToken,(req,res,next)=>{
    const id = req.params.id;
    var query = "delete from bill where id=?";
    connection.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(500).json({message:"Bill id does not exsit"})
            }
            return res.status(200).json({message:"Bill deleted suuccessfully"})
        }else{
            return res.status(500).json(err)
        }
    })
})

module.exports = router;
