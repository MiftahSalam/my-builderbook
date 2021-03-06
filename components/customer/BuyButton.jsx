import React from 'react'
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import Button from '@material-ui/core/Button';
import { loadStripe } from '@stripe/stripe-js'

import { fetchCheckoutSessionApiMethod } from '../../lib/api/customer'
import notify from '../../lib/notify'

const styleBuyButton = {
    margin: '10px 20px 0px 0px',
    font: '14px Roboto'
}

const dev = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8000
const ROOT_URL = `http://localhost:${PORT}`
const stripePromise = loadStripe(
    dev ? process.env.STRIPE_TEST_PUBLISHABLEKEY : process.env.STRIPE_LIVE_PUBLISHABLEKEY,
)
const propTypes = {
    book: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        textNearButton: PropTypes.string,
    }),
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }),
    redirectToCheckout: PropTypes.bool
}

const defaultProps = {
    book: null,
    user: null,
    redirectToCheckout: false
}

class BuyButton extends React.Component {
    componentDidMount() {
        if(this.props.redirectToCheckout) {
            this.handleCheckoutClick();
        }
    }

    onLoginClicked = () => {
        const { user } = this.props

        if(!user) {
            const redirectUrl = `${window.location.pathname}?buy=1`
            window.location.href = `${ROOT_URL}/auth/google?redirectUrl=${redirectUrl}`
        }
    }

    handleCheckoutClick = async () => {
        NProgress.start()

        try {
            const { book } = this.props
            const { sessionId } = await fetchCheckoutSessionApiMethod({
                bookId: book._id,
                redirectUrl: document.location.pathname
            })
            const stripe = await stripePromise
            const { error } = await stripe.redirectToCheckout({ sessionId })

            if(error) {
                notify(error)
            }
        } catch (error) {
            notify(error)
        } finally {
            NProgress.done()
        }
    }

    render() {
        const { book, user } = this.props

        if(!book) {
            return null
        }

        if(!user) {
            return (
                <div>
                    <Button
                        variant='contained'
                        color='primary'
                        style={styleBuyButton}
                        onClick={this.onLoginClicked}
                    >
                        {`Buy book for $${book.price}`}
                    </Button>
                    <p style={{ verticalAlign: 'middle', fontSize: '15px' }} >{book.textNearButton}</p>
                    <hr />
                </div>
            )
        }

        return (
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    style={styleBuyButton}
                    onClick={this.handleCheckoutClick}
                >
                    {`Buy book for $${book.price}`}
                </Button>
                <p style={{ verticalAlign: 'middle', fontSize: '15px' }}>{book.textNearButton}</p>
                <hr />
            </div>
        );

    }
}

BuyButton.propTypes = propTypes;
BuyButton.defaultProps = defaultProps;

export default BuyButton;
