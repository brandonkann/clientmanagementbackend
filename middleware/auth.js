const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req,res,next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1]
    }
    // else if(req.cookies.token) {
    //     token = req.cookies.token
    // }
    
    if (!token) {
        return res.status(401).json({success: false, msg: 'Not authorized to access this route'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        req.user = await User.findById(decoded.id);
        next();
    } catch(err) {
        return res.status(401).json({success: false, msg: 'Not authorized to access this route'})
    }
}