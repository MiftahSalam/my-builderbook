import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import App from 'next/app';
import PropTypes from 'prop-types';
import React from 'react';
import Head from 'next/head';
import Router from 'next/router'
import NProgress from 'nprogress'

import { theme } from '../lib/theme';
import Notifier from '../components/Notifier'
import Header from '../components/Header';

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})
Router.events.on('routeChangeComplete', (url) => {
  if(window && process.env.GA_MEASUREMENT_ID) {
    window.gtag('config', process.env.GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
  NProgress.done()
})
Router.events.on('routeChangeError', () => NProgress.done());

const propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired, // eslint-disable-line
};

class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;

    // console.log("_app-Myapp-render pageProps",pageProps);

    return (
      <ThemeProvider theme={theme}>
        {/* ThemeProvider makes the theme available down the React tree thanks to React context. */}
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <CssBaseline />
        {pageProps.chapter ? null : <Header {...pageProps}/> }
        {/* {pageProps.chapter ? <Header {...pageProps}/> : null } */}
        <Component {...pageProps} />
        <Notifier />
      </ThemeProvider>
    );
  }
}

MyApp.propTypes = propTypes;
MyApp.getInitialProps = async(ctx) => {
    // console.log("_app-MyApp-getInitialProps ctx.ctx.query", ctx.ctx.query)

    const initialProps = await App.getInitialProps(ctx)

    return {
      ...initialProps,
    };
  
}

export default MyApp;
