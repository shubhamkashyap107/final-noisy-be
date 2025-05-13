const mongoose = require("mongoose");
const validator = require("validator")

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        validate(val)
        {
            const flag = validator.isEmail(val);
            if(!flag)
            {
                throw new Error("Please enter a valid Email")
            }
        }
    },
    otp : {
        type: String,
        required: true,
        trim : true
    },
    isVerified : {
        type : Boolean,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Document expires in 300 seconds
    },

}, {timestamps : true})



const OTP = mongoose.model("OTP", otpSchema)


module.exports = {
    OTP
}