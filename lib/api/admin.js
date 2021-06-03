import sendRequest from './sendRequest'

const BASE_PATH = '/api/v1/admin'

export const getBookListApiMethod = () => {
    console.log("lib-api-admin-getBookListApiMethod")
    const data = sendRequest(`${BASE_PATH}/books`, { method: 'GET', })

    return data
}

export const addBookApiMethod = ({ name, price, githubRepo }) => {
    console.log(`lib-api-admin-addBookApiMethod name: ${name}, price: ${price}, gtihubrepo: ${githubRepo}`)

    const data = sendRequest(`${BASE_PATH}/books/add`, {
        method: "POST",
        body: JSON.stringify({ name, price, githubRepo }),
    })

    return data
}

export const editBookApiMethod = ({ id, name, price, githubRepo }) => {
    const data = sendRequest(`${BASE_PATH}/books/edit`, {
        body: JSON.stringify({
            id, name, price, githubRepo,
        })
    })

    return data
}

export const getBookDetailApiMethod = ({ slug }) => {
    console.log(`lib-api-admin-getBookDetailApiMethod slug: ${slug}`)
    
    const data = sendRequest(`${BASE_PATH}/books/detail/${slug}`, {
        method: 'GET',
    })

    return data
}

export const getGithubReposApiMethod = () => {
    console.log("lib-api-admin-getGithubReposApiMethod")

    const data = sendRequest(`${BASE_PATH}/github/repos`, {
        method: 'GET',
    })

    return data
}

export const syncBookContentApiMethod = ({ bookId }) => {
    console.log("lib-api-admin-syncBookContentApiMethod bookId:",bookId)

    const data = sendRequest(`${BASE_PATH}/books/sync-content`, {
        body: JSON.stringify({ bookId })
    })

    return data
}