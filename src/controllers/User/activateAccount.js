const verificationService=require("../../services/User/activateAccount");

async function activateAccount(req,res){
    try {
        const {id,token}=req.params;
        const verify =await verificationService.activateAccount(id,token);
        res.redirect('http://localhost:5173/login?activation=success');
    } catch (error) {
        res.redirect('http://localhost:5173/login?activation=fail');
        res.status(401)
    }
}
module.exports={activateAccount}