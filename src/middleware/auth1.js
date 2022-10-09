const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const blogModel = require("../model/blogsmodel");

//-----------------------AUTHENTICATION-------------------------//

const authentication = async function (req, res, next) {
  try {
    var token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: "Token is missing" });
    }
    var decodedToken = jwt.verify(token, "Blogging-Site", (err, decode) => {
      if (err) {
        return res
          .status(400)
          .send({ status: false, message: "Token is not correct!" });
      }
      req.decode = decode;

      next();
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//-----------------------AUTHORIZATION-----------------------------//

const authorization = async function (req, res, next) {
  try {
    let ObjectID = mongoose.Types.ObjectId;

    // checking for query params

    if (req.query.authorId) {
      let authorId = req.query.authorId;
      if (!ObjectID.isValid(authorId)) {
        return res
          .status(400)
          .send({ status: false, message: "Not a valid AuthorID" });
      }
      if (authorId != req.decode.authorId) {
        return res
          .status(403)
          .send({ status: false, message: "You are not a authorized user" });
      }
      return next();
    }

    // checking for path params

    if (req.params.blogId) {
      let blogId = req.params.blogId;
      if (!ObjectID.isValid(blogId)) {
        return res
          .status(400)
          .send({ status: false, message: "Not a valid BlogID" });
      }
      let check = await blogModel.findById(blogId);
      if (!check) {
        return res
          .status(404)
          .send({ status: false, message: "No such blog exists" });
      }
      if (check.authorId != req.decode.authorId) {
        return res
          .status(403)
          .send({ status: false, message: "You are not a authorized user" });
      }
      return next();
    }
    next();
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { authentication, authorization };
