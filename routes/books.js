const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchemaCreate = require('../schemas/bookSchemaCreate');
const bookSchemaUpdate = require('../schemas/bookSchemaUpdate');
const ExpressError = require('../expressError');

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

// router.post("/", async function (req, res, next) {
//   try {
//     const book = await Book.create(req.body);
//     return res.status(201).json({ book });
//   } catch (err) {
//     return next(err);
//   }
// });
router.post("/", async (req, res, next) =>{
  try{
    //const {book} = req.body;
    //we will check the book body insert in is valid or not
    const result = jsonschema.validate(req.body, bookSchemaCreate);
    //if it is not valid, we return error
    if (!result.valid){
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    // if it is valid, create a new book
    const newBook = await Book.create(req.body);
    return res.status(201).json({newBook});
  }catch(e){
    return next(e);
  }
})

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    //const {book} = req.body;
    const result = jsonschema.validate(req.body, bookSchemaUpdate);
    if (!result.valid){
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const newUpdate = await Book.update(req.params.isbn, req.body);
    return res.json({ newUpdate });
  } catch(err){
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
