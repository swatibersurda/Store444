import { app } from "./app.js";
import { connect } from "./Db/connect.js";
import dotenv from "dotenv";
dotenv.config({path:"/.env"})

connect().then(()=>{
    app.on("error",((error)=>{
        console.log("!Failed to connect on ON")
    }))
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server Listening on ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("!!Fail")
})