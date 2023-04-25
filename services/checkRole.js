require("dotenv").config();

function checkRole(req,res,next) {
    console.log(res.locals.role )
    if(res.locals.role == process.env.USER){
        res.sendStatus(401)
    }  else{
        next();
    }
}


module.exports = {checkRole:checkRole}