import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'

let openSnackbarFn

class Notifier extends React.Component {
    constructor(props) {
        console.log("Notifier-constructor props",props)
        super(props)

        this.state = {
            open: false,
            message: '',
        }
    }

    componentDidMount() {
        console.log("Notifier-componentDidMount")
        openSnackbarFn = this.openSnackbar
    }

    handleSnackbarRequestClose = () => {
        console.log("Notifier-handleSnackbarRequestClose")
        this.setState({
            open: false,
            message: '',
        })
    }

    openSnackbar = ({ message }) => {
        console.log("Notifier-openSnackbar")
        this.setState({
            open: true,
            message: message,
        })
    }

    render() {
        const message = (
            <span 
                id="snackbar-message-d" 
                dangerouslySetInnerHTML={{ __html: this.state.message }} 
                // style={{ color: 'red' }}
            />
        )

        return (
            <Snackbar 
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={this.state.open}
                message={message}
                autoHideDuration={5000}
                onClose={this.handleSnackbarRequestClose}
                ContentProps={{
                    'aria-describedby': 'snackbar-message-id'
                }}
            />
        )
    }
}

export function openSnackbarExported({ message }) {
    openSnackbarFn({message})    
}

export default Notifier