const express = require('express')
const session = require('express-session')
const mongoSessionStore = require('connect-mongo')
const next = require('next')
const mongoose = require('mongoose')
const compression = require('compression')
const helmet = require('helmet')

const setupGoogle = require('./google')
const { setupGithub } = require('./github')
const api = require('./api')
const logger = require('./logger')
const routesWithSlug = require('./routesWithSlug');
const getRootUrl = require('../lib/api/getRootUrl')
const setupSitemapAndRobots = require('./sitemapAndRobots')
const { stripeCheckoutCallback } = require('./stripe')

// const { insertTemplates } = require('./models/EmailTemplate')

require('dotenv').config()

const dev = process.env.NODE_ENV !== 'production'
const MONGO_URL = process.env.MONGO_URL_TEST

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,  
}

mongoose
  .connect(MONGO_URL, options)
  .then(() => {
      console.log('Connected to mongo uri',MONGO_URL)
      
    //   const new_user = new User({
    //     googleId: 'newgId870328442411-ppooolbcvdrl6l5thkgmod9chptcckvf.apps.googleusercontent.com',
    //     googleToken: 'newgtoken_870328442411-ppooolbcvdrl6l5thkgmod9chptcckvf.apps.googleusercontent.com',
    //     slug: 'team-builder-book1',
    //     createdAt: Date(),
    //     email: 'salam.miftah@yahoo.com',
    //     isAdmin: false,
    //     displayName: 'ms_tensai',
    //     avatarUrl: 'htttp://ms_tensai',    
    //   })
    //   new_user.save()
    //   .then(user => {
    //     console.log('Connected to mongo new user',user)
    //   })
    //   .catch((err) => console.log('Caught mongo new user error', err.stack)); // eslint-disable-line no-console

    //   User.find()
    //     .then(user => {
    //         console.log('Connected to mongo-user',user)
    //     })
    //     .catch((err) => console.log('Caught mongo user fetch error', err.stack)); // eslint-disable-line no-console
    }) // eslint-disable-line no-console
  .catch((err) => console.log('Caught mongo error', err.stack)); // eslint-disable-line no-console

const port = process.env.PORT || 8000;
const ROOT_URL = getRootUrl()
const URL_MAP = {
    '/login': '/public/login',
    '/my-books': '/customer/my-books',
}
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
    const server = express()

    server.use(helmet({ contentSecurityPolicy: false }))
    server.use(compression())
    server.use(express.json())

    server.get('/_next/*', (req, res) => {
        handle(req, res)
    })

    const MongoStore = mongoSessionStore(session)
    const sess = {
        name: process.env.SESSION_NAME,
        secret: process.env.SESSION_SECRET,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            ttl: 14 * 24 * 60 * 60,
        }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 14 * 24 * 60 * 60 * 1000,
        }
    }

    if(!dev) {
        server.set('trust proxy', 1)
        sess.cookie.secure = true
        sess.cookie.domain = process.env.COOKIE_DOMAIN
    }

    server.use(session(sess))

    // await insertTemplates()

    setupGoogle({ server, ROOT_URL })
    setupGithub({ server, ROOT_URL })
    api(server)
    routesWithSlug({ server, app })
    stripeCheckoutCallback({ server })
    setupSitemapAndRobots({ server })
    
    server.get('*', (req, res) => {
        const url = URL_MAP[req.path]

        // console.log('server-get * req.path',req.path)
        // console.log('server-get * url',url)

        if(url) {
            app.render(req, res, url)
        } else {
            handle(req, res)
        }
    })

    server.listen(port, (err) => {
        if(err) throw err
        logger.info(`> Ready on ${ROOT_URL}`);
    })
})