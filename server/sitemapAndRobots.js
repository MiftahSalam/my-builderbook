const { SitemapStream, streamToPromise } = require('sitemap')
const path = require('path')
const zlib = require('zlib')
const Chapter = require('./models/Chapter')
const logger = require('./logger')
const getRootUrl = require('../lib/api/getRootUrl')
const ROOT_URL = getRootUrl()

function setupSitemapAndRobots({ server }) {
    let sitemap

    server.get('/sitemap.xml', async (_, res) => {
        res.header('Content-Type', 'application/xml')
        res.header("Content-Encoding", 'gzip')

        console.log(`sitemapAndRobots-setupSitemapAndRobots-get /sitemap.xml sitemap ${sitemap}`)
        if(sitemap) {
            res.send(sitemap)
            return
        }

        try {
            const smStream = new SitemapStream({
                hostname: ROOT_URL,
            })
            const gzip = zlib.createGzip()
            const pipeline = smStream.pipe(gzip)
            const chapters = await Chapter.find({}, 'slug').sort({ order: 1 }).setOptions({ lean: true }) 
            // const chapters = Chapter.find({}, 'slug').sort({ order: 1 }).setOptions({ lean: true }) 
            // logger.debug(`sitemapAndRobots-setupSitemapAndRobots-get /sitemap.xml chapters ${JSON.stringify(chapters)}`)
            // logger.debug(`sitemapAndRobots-setupSitemapAndRobots-get /sitemap.xml chapters ${JSON.stringify(await chapters)}`)

            if(chapters && chapters.length > 0) {
                for(const chapter of chapters) {
                    logger.debug(`sitemapAndRobots-setupSitemapAndRobots-get /sitemap.xml chapter ${chapter.slug}`)
                    // logger.debug(`sitemapAndRobots-setupSitemapAndRobots-get /sitemap.xml chapter ${(await chapter).slug}`)
                    smStream.write({
                        url: `/books/builder-book/${chapter.slug}`,
                        // url: `/books/builder-book/${(await chapter).slug}`,
                        changefreq: 'daily',
                        priority: 1,
                    })
                }
            }

            smStream.write({
                url: '/',
                changefreq: 'weekly',
                priority: 1,
            })
            smStream.write({
                url: '/login',
                changefreq: 'weekly',
                priority: 1,
            })

            streamToPromise(pipeline).then(sm => sitemap = sm)
            smStream.end()
            smStream
            // .pipe(gzip)
            .pipe(res)
            .on('error', (err) => {
                throw err
            })

        } catch (error) {
            logger.debug(error)
            res.status(500).end()
        }
    })

    server.get('/robots.txt', (_, res) => {
        res.sendFile(path.join(__dirname, '../public', 'robots.txt'))
    })
}

module.exports= setupSitemapAndRobots