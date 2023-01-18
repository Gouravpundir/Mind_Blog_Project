const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const blogModel = require("../model/blogsmodel");

const secret = "Blogging-Site"; //secret key for JWT

//function to authenticate the token
const authenticate = (req, res, next) => {
  const token = req.headers["x-api-key"]; //get the token from headers
  if (!token) return res.status(400).send({ status: false, message: "Token is missing" }); //if token is missing, return error message

  try {
    req.decode = jwt.verify(token, secret); //decode the token using secret key
    next();
  } catch (error) {
    return res.status(400).send({ status: false, message: "Token is not correct!" }); //if token is invalid, return error message
  }
};

// function to authorize the user
const authorize = async (req, res, next) => {
  const ObjectID = mongoose.Types.ObjectId;
  const authorId = req.query.authorId || req.params.authorId; // get authorId from query or path parameter

  if (!authorId || !ObjectID.isValid(authorId)) return res.status(400).send({ status: false, message: "Invalid Author ID" }); // if authorId is not present or invalid, 
  //return error message

  if (authorId !== req.decode.authorId) return res.status(403).send({ status: false, message: "You are not authorized" }); //if authorId in token and request 
  //do not match, return error message

  next();
};

module.exports = { authenticate, authorize };
