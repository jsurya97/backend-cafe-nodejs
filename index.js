const express = require("express");
var cors =require('cors');
var connection =require('./connection');
const userRoute = require('./routes/user')
const productRoute = require('./routes/product')
const billRoute = require('./routes/bill')
const dashboardRoute = require('./routes/dashboard')

const categoryRoute = require("./routes/category")
const app = express();
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/user',userRoute)
app.use('/category',categoryRoute)
app.use('/product',productRoute)
app.use('/bill',billRoute)
app.use('/dashboard',dashboardRoute)

module.exports= app;