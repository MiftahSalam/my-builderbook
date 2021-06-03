import React from 'react'
import PropTypes from 'prop-types'
import Error from 'next/error'
import Head from 'next/head'
import { withRouter } from 'next/router'
import throttle from 'lodash/throttle'
import Link from 'next/link'

import Header from '../../components/Header'
import BuyButton from '../../components/customer/BuyButton'
import { getChapterDetailApiMethod } from '../../lib/api/public'
import withAuth from '../../lib/withAuth'
import notify from '../../lib/notify'

const styleIcon = {
    opacity: '0.75',
    fontSize: '24px',
    cursor: 'pointer',
}
const propType = {
    chapter: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        isPurchased: PropTypes.bool,
        isFree: PropTypes.bool.isRequired,
        htmlContent: PropTypes.string,
        htmlExcerpt: PropTypes.string
    }),
    user: PropTypes.shape({
        _id: PropTypes.string.isRequired
    }),
    router: PropTypes.shape({
        asPath: PropTypes.string.isRequired,
    }).isRequired,
    redirectToCheckout: PropTypes.bool.isRequired,
    checkoutCanceled: PropTypes.bool,
    error: PropTypes.string
}

const defaultProps = {
    chapter: null,
    user: null,
    checkoutCanceled: false,
    error: '',
 };
  
class ReadChapter extends React.Component {
    constructor(props, ...args) {
        super(props, ...args)
        
        // console.log(`ReadChapter-constructor props: ${JSON.stringify(props)}, args: ${args}`)

        const { chapter } = props
        let htmlContent = ''

        if(chapter && (chapter.isPurchased || chapter.isFree)){
            htmlContent = chapter.htmlContent
        } else {
            htmlContent = chapter.htmlExcerpt
        }

        this.state = {
            showTOC: false,
            chapter,
            htmlContent,
            hideHeader: false,
            isMobile: false,
        }
    }

    static async getInitialProps(ctx) {
        const { bookSlug, chapterSlug, buy, checkout_canceled, error } = ctx.query
        const { req } = ctx
        const headers = {}
        
        console.log(`ReadChapter-getInitialProps req: ${req}`)
        // console.log(`ReadChapter-getInitialProps bookSlug: ${bookSlug}, chapterSlug:${chapterSlug}`)

        if(req && req.headers && req.headers.cookies) {
            headers.cookies = req.headers.cookies
        }

        const chapter = await getChapterDetailApiMethod({ bookSlug, chapterSlug }, { headers })
        const redirectToCheckout = !!buy

        console.log(`ReadChapter-getInitialProps headers:${headers}`)

        return { chapter, redirectToCheckout, checkoutCanceled: !!checkout_canceled, error }
    }

    static getDerivedStateFromProps(props) {
        // console.log(`ReadChapter-getDerivedStateFromProps props: ${props}`)
        const { chapter } = props
        // console.log(`ReadChapter-getDerivedStateFromProps chapter: ${JSON.stringify(chapter)}`)

        if(chapter) {
            let htmlContent

            if (chapter.isPurchased || chapter.isFree) {
                htmlContent = chapter.htmlContent;
            } else {
                htmlContent = chapter.htmlExcerpt;
            }
            // console.log(`ReadChapter-getDerivedStateFromProps htmlContent: ${htmlContent}`)

            return { chapter, htmlContent };
        }

        return null
    }

    componentDidMount() {
        console.log(`ReadChapter-componentDidMount props: ${this.props}`)
        document.getElementById('main-content').addEventListener('scroll',this.onScroll)

        const isMobile = window.innerWidth < 768

        if(this.state.isMobile !== isMobile) {
            this.setState({ isMobile })
        }
        if(this.props.checkoutCanceled) {
            notify('Checkout canceled')
        }
        if (this.props.error) {
            notify(this.props.error);
        }
    }

    componentDidUpdate(prevProps) {
        console.log(`ReadChapter-componentDidUpdate props.chapter._id: ${this.props.chapter._id}`)
        console.log(`ReadChapter-componentDidUpdate prevprops.chapter._id: ${prevProps.chapter._id}`)
        if(prevProps.chapter && prevProps.chapter._id !== this.props.chapter._id) {
            document.getElementById('chapter-content').scrollIntoView()

            let htmlContent = ''

            if(prevProps.chapter && (prevProps.chapter.isPurchased || prevProps.chapter.isFree)) {
                htmlContent = prevProps.chapter.htmlContent
            } else {
                htmlContent = prevProps.chapter.htmlExcerpt
            }

            this.setState({ chapter: this.props.chapter, htmlContent })
        }
    }
    componentWillUnmount() {
        document.getElementById('main-content').removeEventListener('scroll', this.onScroll)
    }
    onScroll = throttle(() => {
        this.onScrollActiveSection()
        this.onScrollHideHeader()
    }, 500)
    onScrollActiveSection = () => {
        const sectionElm = document.querySelectorAll('span.section-anchor')
        let activeSection
        let aboveSection

        for(let i=0; i < sectionElm.length; i+=1) {
            const s = sectionElm[i]
            const b = s.getBoundingClientRect()
            const anchorBottom = b.bottom

            if(anchorBottom >= 0 && anchorBottom <= window.innerHeight) {
                activeSection = {
                    hash: s.attributes.getNamedItem('name').value
                }
                break
            }
            if(anchorBottom > window.innerHeight && i > 0) {
                if(aboveSection.bottom <= 0){
                    activeSection = {
                        hash: sectionElm[i-1].attributes.getNamedItem('name').value
                    }
                    break
                } 
            } else if (i+1 === sectionElm.length) {
                activeSection = {
                    hash: s.attributes.getNamedItem('name').value
                }   
            }  
            aboveSection = b
        }
        if(this.state.activeSection !== activeSection){
            this.setState({ activeSection })
        }
    }
    onScrollHideHeader = () => {
        const distanceFromTop = document.getElementById('main-content').scrollTop
        const hideHeader = distanceFromTop > 500

        if(this.state.hideHeader !== hideHeader) {
            this.setState({ hideHeader })
        }
    }
    toggleChapterList = () => {
        this.setState((prevState) => ({ showTOC: !prevState.showTOC }))
    }
    closeTocWhenMobile = () => {
        this.setState((prevState) => ({ showTOC: !prevState.isMobile }));
      };
    
    renderMainContent() {
        const { user, redirectToCheckout } = this.props;
        const { chapter, htmlContent, showTOC, isMobile } = this.state
        const { book } = chapter;
        let padding = '20px 20%'

        // console.log(`ReadChapter-renderMainContent state ${JSON.stringify(this.state)}`)

        if(!isMobile && showTOC) {
            padding = '20px  10%'
        } else if(isMobile) {
            padding = '0px 10px'
        }

        return (
            <div style={{ padding }} id='chapter-content'>
                <h2 style={{ fontWeight: '400', lineHeight: '1.5em' }}>
                    {chapter.order > 1 ? `Chapter ${chapter.order - 1}: ` : null}
                    {chapter.title}
                </h2>
                {!chapter.isPurchased && !chapter.isFree ? (
                    <BuyButton user={user} book={book} redirectToCheckout={redirectToCheckout} />
                ) : null }
                <div
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                {!chapter.isPurchased && !chapter.isFree ? (
                    <BuyButton user={user} book={book} redirectToCheckout={redirectToCheckout} />
                ) : null}
            </div>
        )
    }

    renderSections  () {
        const { chapter } = this.state
        const { sections } = chapter
        const { activeSection } = this.state

        if(!sections || !sections.length === 0){
            return null
        }

        return (
            <ul>
                {sections.map((section) => (
                    <li key={section.escapedText} style={{ paddingTop: '10px' }}>
                        <a
                            style={{
                                color: activeSection && activeSection.hash === section.escapedText ? '#1565C0' : '#222',
                            }}
                            href={`#${section.escapedText}`}
                            onClick={this.closeTocWhenMobile}
                        >   
                            {section.text}
                        </a>
                    </li>
                ))}
            </ul>
        )
    }
    renderSideBar() {
        const { showTOC, chapter, isMobile, hideHeader } = this.state;

        if (!showTOC) {
            return null;
        }
        const { book } = chapter;
        const { chapters } = book;

        return (
            <div
                style={{
                    textAlign: 'left',
                    position: 'absolute',
                    bottom: 0,
                    top: hideHeader ? 0 : '64px',
                    transition: 'top 0.5s ease-in',
                    left: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    width: isMobile ? '100%' : '400px',
                    padding: '0px 25px'
                }}
            >
                <p style={{
                    padding: '0px 20px',
                    fontSize: '17px',
                    fontWeight: '400'
                }}>{book.name}</p>
                <ol
                    start='0'
                    style={{
                        padding: '0 25',
                        fontSize: '14px',
                        fontWeight: '300'
                    }}
                >
                    {chapters.map((ch, i) => (
                        <li 
                            key={ch._id}
                            role='presentation'
                            style={{
                                listStyle: i === 0 ? 'none' : 'decimal',
                                paddingBottom: '10px'
                            }}
                        >
                            <Link
                                as={`/books/${book.slug}/${ch.slug}`}
                                href={`/public/read-chapter?bookSlug=${book.slug}&chapterSlug=${ch.slug}`}
                            >
                                <a
                                    style={{
                                        color: chapter._id === ch._id ? '#1565C0' : '#222'
                                    }}
                                    onClick={this.closeTocWhenMobile}
                                >{ch.title}</a>
                            </Link>
                            {chapter._id === ch._id ? this.renderSections() : null}
                        </li>
                    ))}
                </ol>
            </div>
        )
    }

    render() {
        const { user, router } = this.props
        const { chapter, showTOC, hideHeader, isMobile } = this.state

        if(!chapter) {
            return <Error statusCode={404} />
        }

        let left = '20px'

        if(showTOC) {
            left = isMobile ? '100%' : '400px'
        }

        return (
            <div style={{ overflowScrolling: 'touch', WebkitOverflowScrolling: 'touch' }} >
                <Head>
                    <title>
                        {chapter.title === 'Introduction'
                        ? 'Introduction' : `Chapter ${chapter.order - 1}. ${chapter.title}`}
                    </title>
                    {chapter.seoDescription ? (
                        <meta name="description" content={chapter.seoDescription} />
                    ) : null}
                </Head>
                <Header user={user} hideHeader={hideHeader} redirectUrl={router.asPath} />
                {this.renderSideBar()}
                <div
                    style={{
                        textAlign: 'left',
                        padding: '0px 10px 20px 30px',
                        position: 'fixed',
                        right: 0,
                        bottom: 0,
                        top: hideHeader ? 0 : '64px',
                        transition: 'top 0.5s ease-in',
                        left,
                        overflowY: 'auto',
                        overflowX: 'hidden',            
                    }}
                    id='main-content'
                >
                    {this.renderMainContent()}
                </div>
                <div
                    style={{
                    position: 'fixed',
                    top: hideHeader ? '20px' : '80px',
                    transition: 'top 0.5s ease-in',
                    left: '15px',
                }}
                >
                    <i
                        className='material-icons'
                        style={styleIcon}
                        onClick={this.toggleChapterList}
                        onKeyPress={this.toggleChapterList}
                        role="button"
                    >
                        format_list_bulleted
                    </i>
                </div>
            </div>
        )
    }
}

ReadChapter.propType = propType
ReadChapter.defaultProps = defaultProps

export default withAuth(withRouter(ReadChapter), { loginRequired: false })