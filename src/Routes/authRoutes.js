const express = require("express")
const router = express.Router()
const {User} = require("../models/user")
const bcrypt = require("bcrypt")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const { isLoggedIn } = require("../middlewares/isLoggedIn")
const { default: axios } = require("axios")
const { OTP } = require("../models/OTP")


router.post("/signup" ,async(req, res) => {
    try{
        const{emailId, password, username} = req.body
        const foundOtp = await OTP.findOne({email : emailId, isVerified:true})
        if(!foundOtp)
        {
            throw new Error("Please verify your email first")
        }
        const flag = validator.isStrongPassword(password)
        if(!flag)
        {
            throw new Error("Please Enter a strong password")
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        // let createdUser = (await User.insertOne({username, emailId, password : hashedPassword})).validate()
        const createdUser = await User.create({
            username, emailId, password : hashedPassword
        })
        await createdUser.save()
        const token = createdUser.getJWT()
        res.cookie("token", token)
        res.status(200).json({"msg" : "User registered successfully", data : createdUser})
    } catch(e)
    {
        // console.log(e)
        res.status(400).json({"msg" : e.message})
    }
})

router.post("/login", async(req, res) => {

    try {
        const{username, password} = req.body
        const FoundUser = await User.findOne({username})
        if(!FoundUser)
        {
            throw new Error("User does not exist")
        }
        const flag = await bcrypt.compare(password, FoundUser.password)
        if(flag)
        {
            // const token = jwt.sign({_id : FoundUser._id}, process.env.JWT_SECRET, {
            //     expiresIn : "7d"
            // })
            const token = FoundUser.getJWT()
            // console.log("OK")
            const{firstName, lastName, image, bio, username, DOB, _id} = FoundUser
            res.cookie("token", token).json({"msg" : "User logged in successfully", data : {
                firstName, lastName, image, bio, username, DOB, _id
            }})
        }
        else
        {
            res.status(401).json({"msg" : "Invalid Credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({"error" : error.message})
    }
    
})

router.get("/logout", isLoggedIn ,async(req, res) => {
   try {
        res.cookie("token", null)
        res.status(200).json({"msg" : "User logged out"})
   } catch (error) {
        res.json({"msg" : error.msg})
    
   }
})


router.get("/verify-mail/:email", async(req, res) => {
    try {
        console.log("OK")
        const email = req.params.email
        const foundUser = await User.findOne({emailId : email})
        if(foundUser)
        {
            throw new Error("User already exists")
        }
        const resFromMailMicroservice = await axios.get("http://localhost:8081/mail/" + email + "/otp" )
        if(resFromMailMicroservice.status == 200)
        {
            // console.log("OK")
            const otp = resFromMailMicroservice.data.otp
            const newOtp = await OTP.create({email, otp, isVerified : false})
            await newOtp.save()
            return res.json({msg : "OTP Generated"})
        }
    } catch (error) {
        // console.log(error)
        res.status(400).json({msg : error.message})
    }
})



router.get("/verify-otp/:otp", async(req, res) => {
try {
    const otp = req.params.otp
    const foundOtp = await OTP.findOne({otp : otp})
    if(!foundOtp)
    {
        return res.status(404).json({msg : "Invalid OTP / OTP Expired"})
    }
    foundOtp.isVerified = true
    await foundOtp.save()

    res.status(200).json({msg : "Okay"})
} catch (error) {
    res.status(400).json("Something Went Wrong")
}
    
})


module.exports = {
    authRouter : router
}