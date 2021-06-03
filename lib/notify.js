import { openSnackbarExported } from '../components/Notifier'

export default function notify(obj) {
    console.log("notify obj",obj)
    openSnackbarExported({ message: obj.message || obj.toString() })    
}