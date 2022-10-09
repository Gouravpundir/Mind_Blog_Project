const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId
const typemix = mongoose.Schema.Types.Mixed
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: ObjectId,
        ref: "authorsName",
        required: true
    },
    tags: {
        type: typemix
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: typemix
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
    },
    deletedAt: {
        type: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('blog', blogSchema)