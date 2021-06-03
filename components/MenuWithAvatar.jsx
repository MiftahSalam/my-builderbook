import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Menu from '@material-ui/core/Menu';
import Avatar from '@material-ui/core/Avatar';

const propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(String).isRequired,
};

class MenuWithAvatar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: undefined,
    }
  }

  // componentDidUpdate() {
  //   console.log("MenuWithAvatar-componentDidUpdate anchorEl",this.state.anchorEl)
  // }

  handleClick = (event) => {
    // console.log("MenuWithAvatar-handleClick",event.currentTarget)
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = (event) => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { options, src, alt } = this.props;
    const { anchorEl } = this.state;

    // console.log("MenuWithAvatar-render",anchorEl)

    return (
      <div>
        <Avatar
          aria-controls={anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          onKeyPress={this.handleClick}
          src={src}
          alt={alt}
          style={{ margin: '0px 20px 0px auto', cursor: 'pointer' }}
        />
        <Menu
          id='simple-menu'
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          keepMounted
        >
          <p />
          {
            options.map((option) => (
              <div id="wrappingLink" key={option.text}>
                <Link href={option.href} as={option.as || option.href} >
                  <a style={{ padding: '0px 20px' }} >{option.text}</a>
                </Link>
                <p />
              </div>
            ))
          }
        </Menu>
      </div>
    )
  }
}

MenuWithAvatar.propTypes = propTypes;

export default MenuWithAvatar;
