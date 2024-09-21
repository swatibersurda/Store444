export const errorMiddleware=(error,req,res,next)=>{
error.message ||="Internal Server Error",
error.statusCode ||=500;
return res.status(error.statusCode).json({
    sucess:false,
    message:error.message,
    statusCode:error.statusCode
})
}