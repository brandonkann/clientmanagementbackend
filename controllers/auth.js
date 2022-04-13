const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public

exports.register = async (req,res,next) => {
    const {name, email, password, role} = req.body; 

    try {
        // Create the user: 
        const user =  await User.create({
            name,
            email,
            password,
            role
        });

        const token = user.getSignedJwtToken();

        sendTokenResponse(user, 200, res)
    } catch(err) {
        res.status(400).json({success: false, msg: err})
    }
}

//@desc     Login a user
//@route    POST /api/v1/auth/login
//@access   Public

exports.login = async (req,res,next) => {
    const {email, password} = req.body; 

    if (!email || !password) {
        return res.status(400).json({ success: false, msg: "Please provide an email and a password"})
    }

    const user = await User.findOne({email}).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, msg: "Invalid Credentials"})
    }

    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, msg: "Invalid Credentials"})
    }

    sendTokenResponse(user, 200, res)
}


//@desc     Get current logged in user
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMe = async (req,res,next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        })
    }catch(err) {
        res.status(400).json({
            success: false,
            error : err
        })
    }
    
}


//@desc     Update user details
//@route    PUT /api/v1/auth/updatedetails
//@access   Private
exports.updateDetails = async (req,res,next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
        }
        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        })
    }catch(err) {
        res.status(400).json({
            success: false,
            error : err
        })
    }
    
}

//@desc     Update password
//@route    PUT /api/v1/auth/updatePassword
//@access   Private
exports.updatePassword = async (req,res,next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        if(!(await user.matchPasswords(req.body.currentPassword))) {
            return res.status(401).json({success: false, msg: 'Password incorrect'});
        }

        user.password = req.body.newPassword;

        await user.save();
        
        sendTokenResponse(user, 200, res)
    }catch(err) {
        res.status(400).json({
            success: false,
            error : err
        })
    }
    
}




//@desc     Reset password for user
//@route    POST /api/v1/auth/forgotpassword
//@access   public
exports.forgotPassword = async (req,res,next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user) {
            return res.status(400).json({
                success: false,
                msg : "Unable to find user"
            })
        }

        const resetToken =  user.getResetPasswordToken();

        await user.save({validateBeforeSave: false})

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

        const message = `You requested this email because you have requested the reset of a password. Please navigate to ${resetUrl}`

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset',
                message
            })

            res.status(200).json({success: true, data: 'Email Sent'});
        }catch(err) {
            console.log(err)
            user.resetPasswordToken = undefined; 
            user.resetPasswordExpire = undefined;

            await user.save({ validationBeforeSave: false});
            return res.status(500).json({success: false, msg: 'Email failed to be sent'})
        }
    }catch(err) {
        return res.status(400).json({
            success: false,
            error : err
        })
    }
    
}

//@desc     Reset Password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   Public
exports.resetPassword = async (req,res,next) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
        const user = await User.findOne({resetPasswordToken, resetPasswordExpire: { $gt: Date.now()}})
    
        if (!user) {
            return res.status(400).json({
                success: false,
                error : "Invalid token"
            })
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res)
    }catch(err) {
        res.status(400).json({
            success: false,
            error : err
        })
    }
    
}


const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true; // this may cause a issue during production
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true, 
        token 
    })
}