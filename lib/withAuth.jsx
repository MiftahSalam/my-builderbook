import React from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'

let globalUser = null

export default function withAuth(BaseComponent, 
    { loginRequired = true, logoutRequired = false, adminRequired = false } = {},) {

    // console.log("withAuth. loginRequired",loginRequired,"logoutRequired",logoutRequired)
    const propTypes = {
        user: PropTypes.shape({
            id: PropTypes.string,
            isAdmin: PropTypes.bool,
        }),
        isFromServer: PropTypes.bool.isRequired,
    }

    const defaultProps = {
        user: null
    }

    class App extends React.Component {
        static async getInitialProps(ctx) {
            // console.log("withAuth-App-getInitialProps ctx.query",ctx.query)
            // console.log("withAuth-App-getInitialProps ctx.req.user",ctx.req.user)
            const isFromServer = typeof window === 'undefined'
            const user = ctx.req ? ctx.req.user && ctx.req.user.toObject() : globalUser

            if(isFromServer && user) {
                user._id = user._id.toString()            
                // console.log('google-setupGoogle-deserializeUser found user',user)
            }

            const props = { user, isFromServer }
            // console.log("withAuth-App-getInitialProps props awal",props)

            if(BaseComponent.getInitialProps) {
                // console.log("withAuth-App-getInitialProps BaseComponent.getInitialProps")
                Object.assign(props, (await BaseComponent.getInitialProps(ctx)) || {} )
                // console.log("withAuth-App-getInitialProps BaseComponent.getInitialProps props",props)
            }

            // console.log("withAuth-App-getInitialProps props akhir",props)
            return props
        }

        componentDidMount() {
            const { user, isFromServer } = this.props

            // console.log("withAuth-App-componentDidMount this.props",this.props)

            if(isFromServer) {
                globalUser = user
            }
            if(loginRequired && !logoutRequired && !user) {
                Router.push('/public/login', '/login')
            }
            if(adminRequired && (!user || !user.isAdmin)) {
                Router.push('/customer/my-books', '/my-books')
            }
            if(logoutRequired && user) {
                Router.push('/')
            }
        }

        render() {
            const { user } = this.props

            // console.log("withAuth-App-render this.props",this.props)
            
            if(loginRequired && !logoutRequired && !user) {
                return null
            }
            if(adminRequired && (!user || !user.isAdmin)) {
                return null
            }
            if(logoutRequired && user) {
                return null
            }

            return (
                <>
                    <BaseComponent  {...this.props} />
                </>
            )
        }
    }

    App.propTypes = propTypes
    App.defaultProps = defaultProps

    return App
}