import PropTypes from 'prop-types';
import React from 'react'
import Head from 'next/head';

import withAuth from '../lib/withAuth'

const propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
};

const defaultProps = {
  user: null,
};

class Index extends React.Component { 
    render() {
        const { user } = this.props

        return (
            <div style={{ padding: '10px 45px' }} >
                <Head>
                    <title>Settings</title>
                    <meta name='description' content='List of purchased books' />
                </Head>
                <p>List of purchased books</p>
                <p>Email:&nbsp;{user.email}</p>
            </div>
        )
    }
}

Index.getInitialProps = async (ctx) => {
    // console.log("Index-getInitialProps ctx.query", ctx.query)
    console.log("Index-getInitialProps ctx.req.user", ctx.req.user)
    return {
        user: ctx.req.user
    }
}

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;

export default withAuth(Index);
