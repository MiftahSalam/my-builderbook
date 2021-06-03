import sendRequest from './sendRequest'

const BASE_PATH = '/api/v1/customer';

export const fetchCheckoutSessionApiMethod = ({ boodId, redirectUrl }) => {
    console.log(`lib-api-customer-fetchCheckoutSessionApiMethod boodId: ${boodId}, redirectUrl: ${redirectUrl}`)
    
    const data = sendRequest(`${BASE_PATH}/stripe/fetch-checkout-session`, {
        body: JSON.stringify({ bookId, redirectUrl }),
    })

    return data
}

export const getMyBookListApiMethod = ({ options = {} }) => {
    console.log(`lib-api-customer-getMyBookListApiMethod options: ${options}`)
    
    const data = sendRequest(`${BASE_PATH}/my-books`, {
        method: 'GET',
        ...options,
    })

    return data
}