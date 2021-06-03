const express = require('express')
const router = express.Router()
const Book = require('../models/Book')
const Chapter = require('../models/Chapter')

router.get('/books', async (req, res) => {
    try {
        const books = Book.list()
        res.json(books);
    } catch (error) {
        res.json({ error: err.message || err.toString() });
    }
})

router.get('/books/:slug', async (req, res) => {
    console.log(`server-api-public-get /books/:slug: ${req.params.slug}`)
    try {
        const book = await Book.getBySlug({ slug: req.params.slug, userId: req.user && req.user.id });
        res.json(book);
    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

router.get('/get-chapter-detail', async (req, res) => {
    console.log(`server-api-public-get /get-chapter-detail req.query: ${req.query}`)
    try {
        const { bookSlug, chapterSlug } = req.query
        const chapter = await Chapter.getBySlug({
            bookSlug,
            chapterSlug,
            userId: req.user && req.user.id,
            isAdmin: req.user && req.user.isAdmin,
        })
        res.json(chapter)
    } catch (error) {
        res.json({ error: error.message || error.toString() })
    }
})

module.exports = router