const cron = require("node-cron")
const axios = require("axios")
const { ConnectionRequest } = require("../models/connectionRequest")


cron.schedule('0 10 * * *', async() => {

    const allRequest = await ConnectionRequest.find({status : "interested"})

    const temp = allRequest.map((item) => {
        return item.toUserId
    })

    const uniqueTemp = new Set(temp)
    console.log(uniqueTemp.size)
   

});











