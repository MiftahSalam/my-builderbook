const passport = require('passport')
const Strategy = require('passport-google-oauth').OAuth2Strategy
const User = require('./models/User')

function setupGoogle({ server, ROOT_URL }) {
    const verify = async (accessToken, refreshToken, profile, verified) => {
        // console.log('google-setupGoogle-verify accessToken',accessToken,"refreshToken",refreshToken)

        let email
        let avatarUrl

        if (profile.emails) {
            email = profile.emails[0].value
        }
        if(profile.photos && profile.photos.length > 0) {
            avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128')
        }

        try {
            const user = await User.signInOrSignUp({
                googleId: profile.id,
                email,
                googleToken: { accessToken, refreshToken },
                displayName: profile.displayName,
                avatarUrl,
            })

            verified(null, user)
        } catch (error) {
            verified(error)
            console.log(error)
        }
    }

    passport.use(
        new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENTID,
                clientSecret: process.env.GOOGLE_CLIENTSECRET,
                callbackURL: `${ROOT_URL}/oauth2callback`,
                accessType: 'offline',
            },
            verify,
        ),
    )

    passport.serializeUser((user, done) => {
        // console.log('google-setupGoogle-serializeUser', user)
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        // console.log('google-setupGoogle-deserializeUser id',id)
        User.findById(id, User.publicFields(), (err, user) => {
            // console.log('google-setupGoogle-deserializeUser found id',id)
            done(err, user)
        })
    })

    server.use(passport.initialize())
    server.use(passport.session())

    server.get('/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            prompt: 'consent',
            passReqToCallback: true,
            accessType: 'offline',
            session: false,
            // prompt: 'select_account'
        }),
    )
    server.get('/oauth2callback',
        passport.authenticate('google',{
            failureRedirect: '/login'
        }),
        (req, res) => {
            if(req.user && req.user.isAdmin) {
                res.redirect('/admin')
            } else {
                res.redirect('/my-books')
            }
        }
    )
    server.get('/logout', (req, res) => {
        req.logout()
        res.redirect('login')
    })
}

module.exports = setupGoogle