const mongoose = require("mongoose");
const blogModel = require("../model/blogsmodel");
const moment = require("moment");
const authorModel = require("../model/authormodel");

let isValid = mongoose.Types.ObjectId.isValid;
let Moment = moment().format();

const isvalidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};
//---------------------------------CREATE BLOG------------------------------------//

const createBlog = async (req, res) => {
  try {
    let blogData = req.body;
    
       if (!isvalidRequestBody(blogData)) {
      res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide author details",
      });
      return;
    }
    
    let { title, body, authorId, tags, category, subcategory, isPublished } =
      blogData;
    let validAuthorId = await authorModel.findById(authorId);
    if (!validAuthorId) {
      return res.staus(400).send({ status: false, msg: "userId is not valid" });
    }
    let blogsData = {
      title: title,
      body: body,
      authorId: authorId,
      tags: tags,
      category: category,
      subcategory: subcategory,
      isPublished: isPublished ? isPublished : false,
      publishedAt: isPublished ? new Date() : null,
    };
    //Blogs creation
    let savedData = await blogModel.create(blogsData);
    return res.status(201).send({ status: true, data: savedData });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//_____________________________GET BLOGS_____________________________//

const getBlogs = async function (req, res) {
  try {
    let requestBody = req.query;
    let { authorId, category, tags, subcategory } = requestBody;

    if (Object.keys(requestBody).length != 0) {
      if (authorId) {
        if (!isValid(authorId)) {
          return res
            .status(400)
            .send({ status: false, message: "Not a valid author id" });
        }
      }
      let obj = { isPublished: true, isDeleted: false };
      if (authorId) {
        obj.authorId = authorId;
      }
      if (category) {
        obj.category = category;
      }
      if (tags) {
        obj.tags = tags;
      }
      if (subcategory) {
        obj.subcategory = subcategory;
      }

      let checkValue = await blogModel.find(obj);
      if (checkValue.length == 0) {
        return res
          .status(404)
          .send({ status: false, message: "No such data found" });
      }
      res.status(200).send({ status: true, message: checkValue });
    } else {
      let getBlogData = await blogModel.find({
        $and: [{ isPublished: true }, { isDeleted: false }],
      });
      if (!getBlogData.length) {
        return res
          .status(404)
          .send({ status: false, data: "No such blog found" });
      }
      return res.status(200).send({ status: true, data: getBlogData });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//--------------------------UPDATE BLOG----------------------------------//

const updateBlog = async function (req, res) {
  try {
    let requestBody = req.params.blogId;
    let { title, body, tags, subcategory } = req.body;
    let deleteCheck = await blogModel.findOne({
      _id: requestBody,
      isDeleted: false,
    });
    if (!deleteCheck) {
      return res
        .status(404)
        .send({ status: false, message: "Blog does not exist" });
    }
    let dataCheck = {
      isPublished: true,
      publishedAt: Moment,
    };
    let arrayData = {};
    if (title != null) {
      dataCheck.title = title;
    }
    if (body != null) {
      dataCheck.body = body;
    }
    if (tags != null) {
      arrayData.tags = tags;
    }
    if (subcategory != null) {
      arrayData.subcategory = subcategory;
    }
    let updatedData = await blogModel.findOneAndUpdate(
      { _id: requestBody },
      { $set: dataCheck, $push: arrayData },
      { upsert: true, new: true }
    );
    res.status(200).send({ status: true, data: updatedData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//----------------------------Delete blogs by params-----------------------//

const deleteByBlogID = async (req, res) => {
  try {
    let requestParams = req.params.blogId;
    let findData = await blogModel.findById(requestParams);
    if (findData) {
      if (findData.isDeleted == false) {
        let changeStatus = await blogModel.findOneAndUpdate(
          { _id: requestParams },
          { $set: { isDeleted: true, deletedAt: Moment } },
          { new: true, upsert: true }
        );
        return res.status(200).send({
          status: true,
          msg: "Data deleted successfully",
          changeStatus,
        });
      } else {
        return res
          .status(404)
          .send({ status: false, msg: "No such data found" });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};

//-------------------------Delete blog by query----------------------//

const deleteByFilter = async function (req, res) {
  try {
    // parameters are mandatory to be filled in query section
    let requestQuery = req.query;
    let { authorId, category, tags, subcategory, isPublished } = requestQuery;

    if (Object.keys(requestQuery).length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "Request body can not be empty" });
    }
    let checkData = ["true", "false"];
    if (isPublished) {
      if (!checkData.includes(isPublished)) {
        return res.status(400).send({
          status: false,
          message: "Please give true or false value to isPublished",
        });
      }
    }
    let obj = {};
    if (authorId) {
      obj.authorId = authorId;
    }
    if (category) {
      obj.category = category;
    }
    if (tags) {
      obj.tags = tags;
    }
    if (subcategory) {
      obj.subcategory = subcategory;
    }
    if (checkData.includes(isPublished)) {
      obj.isPublished = Boolean(isPublished);
    }
    if (!Object.keys(obj).length)
      return res.status(400).send({
        status: false,
        message: "Please provide some value to filter the data",
      });
    if (!authorId) obj.authorId = req.decode.authorId;
    obj.isDeleted = false;

    let filtered = await blogModel.find(obj);
    if (filtered.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "No such data found" });
    } else {
      let deletedData = await blogModel.updateMany(
        obj,
        { isDeleted: true, deletedAt: Moment },
        { upsert: true, new: true }
      );
      return res.status(200).send({ status: true, message: deletedData });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  updateBlog,
  deleteByFilter,
  deleteByBlogID,
};
