const express = require('express')
const Book = require('../models/Book')
const User = require('../models/User')
const router = express.Router()
const { getRepos } = require('../github')

router.use((req, res, next) => {
    // console.log("server-api-admin-use req.body:",req.body)
    // console.log("server-api-admin-use req.params:",req.params)
    
    if(!req.user || !req.user.isAdmin) {
        res.status(401).json({ error: "Unauthorized" }) 
        return
    }
    next()
})

router.get('/books', async (req, res) => {
    try {
        const books = await Book.list()
        console.log("server-api-admin-get-books data", books)
        res.json(books)
    } catch (error) {
        console.log("server-api-admin-get-books error", error)
        res.json({ error: error.message || error.toString() })
    }
})

router.post('/books/add', async (req, res) => {
    try {
        console.log("server-api-admin-post /books/add req.body:",req.body)
        const book = await Book.add(req.body);
        res.json(book);
    } catch (error) {
        console.error(error);
        res.json({ error: err.message || error.toString() });    
    }
})

router.post('/books/edit', async (req, res) => {
    try {
        const editedBook = await Book.edit(req.body)
        res.json(editedBook)
    } catch (error) {
        res.json({ error: error.message || error.toString() })
    }
})

router.get('/books/detail/:slug', async (req, res) => {
    try {
        console.log("server-api-admin-get /books/detail/:slug")
        const book = await Book.getBySlug({ slug: req.params.slug });
        res.json(book);
    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
})

router.get('/github/repos',async (req, res) => {
    const user = await User.findById(req.user._id, 'isGithubConnected githubAccessToken')

    if(!user.isGithubConnected || !user.githubAccessToken) {
        res.json({ error: "Github not connected" })

        return
    }

    try {
        console.log("server-api-admin /github/repos user",user)

        const response = await getRepos({ user, request: req })
        res.json({ repos: response.data })
    } catch (error) {
        console.error(err);
        res.json({ error: err.message || err.toString() });    
    }
})

router.post('/books/sync-content', async (req, res) => {
    const { bookId } = req.body
    const user = await User.findById(req.user._id, 'isGithubConnected githubAccessToken')

    if (!user.isGithubConnected || !user.githubAccessToken) {
        res.json({ error: 'Github not connected' });
        return;
    }

    try {
        await Book.syncContent({ id: bookId, user, request: req })
        res.json({ done: 1 })
    } catch (error) {
        console.error(error);
        res.json({ error: error.message || error.toString() });    
    }
      
})
module.exports = router