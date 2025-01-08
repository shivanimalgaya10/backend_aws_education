const adminAuth=(req,res,next)=>{
    if(req.user.role!=='admin'){
        return res.status(403).json({
            message: 'Access denied. Admins only.',
            success: false
        })
    }
    next(); // Continue to the next middleware/route if admin
}

export default adminAuth;