function routesWithSlug({ server, app }) {

    //test. remove later
    // server.use('/admin/', (req, res, next) => {
    //     // console.log("-use req.params:", req.params)

    //     next()
    // })

    server.get('/books/:bookSlug/:chapterSlug', (req, res) => {
        console.log("routesWithSlug-get /books/:bookSlug/:chapterSlug",req.params)
        const { bookSlug, chapterSlug } = req.params

        app.render(req, res, '/public/read-chapter', { bookSlug, chapterSlug })
    })

    server.get('/admin/book-detail/:slug', (req, res) => {
        // console.log("routesWithSlug-get /admin/book-detail/:slug req.params:",req.params)
        const { slug } = req.params
        console.log("routesWithSlug-get /admin/book-detail/:slug slug:",slug)

        app.render(req, res, '/admin/book-detail', { slug })
    })

    server.get('/admin/edit-book/:slug', (req, res) => {
        const { slug } = req.params

        app.render(req, res, '/admin/edit-book', { slug })
    })
}

module.exports = routesWithSlug