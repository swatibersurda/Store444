// config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import  {v4 as uuid} from "uuid"
// import User from '../models/user.js';
import dotenv from 'dotenv';
import { User } from '../Model/userModel.js';
dotenv.config({path:"./.env"});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  // this url is given on redirect timeee..
  callbackURL: "http://localhost:9000/api/v1/google/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
  try {
   
    // return done(null, user);
    let user=await User.findOne({email:profile?._json.email})
    // will create the user.
    if(!user){
      user=await User.create({
        name:profile._json.name,
        email:profile?._json.email,
        password:uuid(),

      })
    }
    return done(null,user)
  } catch (err) {
    return done(err, false);
  }
}));

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    let user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});
