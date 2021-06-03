
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://miftah:<password>@cluster0.mtq1q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


const mongoose = require('mongoose')
const _ = require('lodash')

const { addToMainchimp } = require('../mailchimp')
const generateSlug = require('../utils/slugify')
const sendEmail = require('../aws-ses')
const { getEmailTemplate } = require('./EmailTemplate')
const logger = require('../logger');

const { Schema } = mongoose

const mongoSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    googleToken: {
        access_token: String,
        refresh_token: String,
        token_type: String,
        expiry_date: Number,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    displayName: String,
    avatarUrl: String,
    isGithubConnected: {
        type: Boolean,
        default: false,
    },
    githubAccessToken: {
        type: String,
    },
    githubId: {
        type: String,
        unique: true,
    },
    purchasedBookIds: [String],
})

class UserClass {
    static publicFields() {
        return [
            'id', 
            'displayName', 
            'email', 
            'avatarUrl', 
            'slug', 
            'isAdmin', 
            'isGithubConnected',
            'purchasedBookIds',
        ];    
    }

    static async signInOrSignUp({ googleId, email, googleToken, displayName, avatarUrl }) {
        const user = await this.findOne({ googleId }).select(UserClass.publicFields().join(' '))

        if(user) {
            const modifier = {}

            if(googleToken.accessToken) {
                // console.log('User-signInOrSignUp googleToken.accessToken',googleToken.accessToken)
                modifier.access_token = googleToken.accessToken
            }
            if(googleToken.refreshToken) {
                // console.log('User-signInOrSignUp googleToken.refreshToken',googleToken.refreshToken)
                modifier.refresh_token = googleToken.refreshToken
            }
            if(_.isEmpty(modifier)) {
                return user
            }

            // console.log('User-signInOrSignUp-updateOne googleId',googleId,"modifief",modifier)
            this.updateOne({ googleId: googleId }, { $set: { googleToken: { ...modifier } } })
            .then(val => { 
                console.log('User-signInOrSignUp-updateOne result',val)
             })
            .catch(err => console.log('User-signInOrSignUp-updateOne err',err))

            return user
        }

        const slug = await generateSlug(this, displayName)
        const newUser = await this.create({
            createdAt: new Date(),
            googleId,
            email,
            googleToken,
            displayName,
            avatarUrl,
            slug,
        })

        try {
            const template = await getEmailTemplate('welcome', {
                userName: displayName,
            })

            await sendEmail({
                from: `Kelly from Builder Book <${process.env.EMAIL_ADDRESS_FROM}>`,
                to: [email],
                subject: template.subject,
                body: template.message,
            })
        } catch (error) {
            console.error('models-User-signInOrSignUp Email sending error:', err);      
            logger.debug('Email sending error:', err);      
        }

        try {
            await addToMailchimp({ email, listName: 'signedup' });
        } catch (error) {
            console.error('models-User-signInOrSignUp Mailchimp error:', err);       
            logger.error('Mailchimp error:', error);                 
        }

        return _.pick(newUser, UserClass.publicFields())
    }
}

mongoSchema.loadClass(UserClass)

const User = mongoose.model('User', mongoSchema)

module.exports = User