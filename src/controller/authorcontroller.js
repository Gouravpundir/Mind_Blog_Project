const authorModel = require("../model/authormodel");
const validator = require("validator");
const jwt = require("jsonwebtoken");

//----------------------------validations--------------------------------------//

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === null) return false;
  return true;
};
const isValidTitle = function (title) {
  return ["Mr", "Mrs", "Miss"].indexOf(title) !== -1;
};

const isvalidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

//---------------------------create author---------------------------------//
const createAuthor = async (req, res) => {
  try {
    const requestBody = req.body;
    if (!isvalidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide author details",
      });
      return;
    }
    //extract params
    const { fname, lname, title, email, password } = requestBody;
    //validation start
    if (!isValid(fname)) {
      res
        .status(400)
        .send({ status: false, message: "First name is required" });
      return;
    }
    if (!isValid(lname)) {
      res.status(400).send({ status: false, message: "Last name is required" });
      return;
    }
    if (!isValid(title)) {
      res.status(400).send({ status: false, message: "Title is required" });
      return;
    }
    if (!isValidTitle(title)) {
      res
        .status(400)
        .send({ status: false, message: `Title should be Mr, Mrs, Miss` });
      return;
    }
    if (!isValid(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }
    if (!isValid(password)) {
      res.status(400).send({ status: false, message: "Password is required" });
      return;
    }
    const isEmailAlreadyUsed = await authorModel.findOne({ email }); //{email :email} object shorthand property
    if (isEmailAlreadyUsed) {
      res.status(400).send({
        status: false,
        message: `${email}email is already registered`,
      });
      return;
    }
    //validation end
    const authorData = { fname, lname, title, email, password };
    const newAuthor = await authorModel.create(authorData);
    res.status(201).send({
      status: true,
      message: `Author created sucessfully`,
      data: newAuthor,
    });
  } catch (err) {
    res.status(500).send({ statu: false, msg: err.message });
  }
};

//---------------------------------------LOGIN AUTHOR-----------------------------------//

const loginAuthor = async function (req, res) {
  try {
    let requestBody = req.body;
    if (!isvalidRequestBody(requestBody)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide author details",
      });
      return;
    }

    const { email, password } = requestBody;

    if (!isValid(email)) {
      res.status(400).send({ status: false, message: "Email is required" });
      return;
    }
    if (!isValid(password)) {
      res.status(400).send({ status: false, message: "Password is required" });
      return;
    }
    const author = await authorModel.findOne({ email, password });
    if (!author) {
      res.status(400).send({ status: false, msg: "Invalid login credentials" });
      return;
    }

    let token = jwt.sign(
      {
        authorId: author._id,
        organisation: "Project-1",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Blogging-Site"
    );
    return res.status(201).send({ status: true, message: token });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAuthor,
  loginAuthor,
};
