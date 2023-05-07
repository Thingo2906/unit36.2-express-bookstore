process.env.NODE_ENV = "test"
const request = require('supertest');
const app = require('../app');
const db = require('../db');
let book;
beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '123432122',
          'https://amazon.com/taco',
          'Elie',
          'English',
          100,
          'Nothing publishers',
          'my first book', 2008)
        RETURNING isbn, amazon_url,author,language,pages,publisher,title,year `);
  
    book = result.rows[0];
  });
afterEach(async () => {
    await db.query(`DELETE FROM books`);
})

afterAll(async function () {
    await db.end()
  });

describe('GET/books', function (){
    test('Get a list of books', async function() {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books:[book]});
        expect(res.body.books).toHaveLength(1); 
        expect(res.body.books[0]).toHaveProperty("isbn");
    });
});

describe('GET/books/:isbn', function (){
    test('get the book by id', async function(){
        const res = await request(app).get(`/books/${book.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: book});
        expect(res.body.book).toHaveProperty("isbn");
    });
    test('Respond 404 if it cannot find that book', async function(){
        const res = await request(app).get(`/books/374847`);
        expect(res.statusCode).toBe(404);
    })
});

describe('POST/books', function(){
    test("create a new book", async function(){
        const res = await request(app).post(`/books`).send({isbn: '32794782',
                                                              amazon_url: "https://taco.com",
                                                              author: "mctest",
                                                              language: "english",
                                                              pages: 1000,
                                                              publisher: "yeah right",
                                                              title: "amazing times",
                                                              year: 2000});
        expect(res.body.newBook).toHaveProperty("isbn");                                                      
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({newBook:{isbn: '32794782',
                                  amazon_url: "https://taco.com",
                                  author: "mctest",
                                  language: "english",
                                  pages: 1000,
                                  publisher: "yeah right",
                                  title: "amazing times",
                                  year: 2000}})
    });
    test("Respond 400 if missing some data required", async function(){
        const res = await request(app).post(`/books`).send({isbn: '32794782',
                                                            amazon_url: "https://taco.com"});
        expect(res.statusCode).toBe(400);                                                      
    })
});
describe('PUT/books/:isbn', function(){
    test("update a valid book", async function(){
        const res = await request(app).put(`/books/${book.isbn}`).send({
                                                                         amazon_url: "https://taco.com",
                                                                         author: "mctest",
                                                                         language: "english",
                                                                         pages: 1000,
                                                                         publisher: "yeah right",
                                                                         title: "amazing times",
                                                                         year: 2000});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({newUpdate:{isbn: book.isbn,
                                  amazon_url: "https://taco.com",
                                  author: "mctest",
                                  language: "english",
                                  pages: 1000,
                                  publisher: "yeah right",
                                  title: "amazing times",
                                  year: 2000}});
                                                                         
    });
    test("Respond 400 if missing some data for update", async function(){
        const res = await request(app).put(`/books/${book.isbn}`).send({});
        expect(res.statusCode).toBe(400);

    })
});
describe('DELETE/:isbn', function(){
    test("delete a book by isbn", async function(){
        const res = await request(app).delete(`/books/${book.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({message: "Book deleted"});
    })
})
