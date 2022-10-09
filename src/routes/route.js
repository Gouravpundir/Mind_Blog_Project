const express = require("express");
const router = express.Router();
const authorController = require("../controller/authorcontroller");
const blogController = require("../controller/blogsController");
const mid1 = require("../middleware/auth1");

//--------------create author api-----------------//

router.post("/authors", authorController.createAuthor);

//---------------create blog api--------------------//

router.post("/blogs", mid1.authentication, blogController.createBlog);

//----------------get blogs-------------------------//

router.get("/getBlogs", mid1.authentication, blogController.getBlogs);

//----------------update blogs--------------------//

router.put(
  "/blogs/:blogId",
  mid1.authentication,
  mid1.authorization,
  blogController.updateBlog
);

//----------------------DELETE /blogs/:blogId---------------------------//

router.delete(
  "/blogs/:blogId",
  mid1.authentication,
  mid1.authorization,
  blogController.deleteByBlogID
);

//----------------------------DELETE /blogs-----------------------------//

router.delete(
  "/blogs",
  mid1.authentication,
  mid1.authorization,
  blogController.deleteByFilter
);

//-----------------------------Login Author------------------------------//
router.post("/login", authorController.loginAuthor);

module.exports = router;
