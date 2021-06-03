import 'isomorphic-unfetch'

const port = process.env.PORT || 8000
const ROOT_URL = process.env.ROOT_URL || `http://localhost:${port}`

export default async function sendRequest(path, options = {}) {
    // console.log("lib-api-sendRequest path:", path, "options:", options)

    const headers = {
        ...(options.headers || {}), 
        'Content-type': 'application/json; charset=UTF-8' 
    }
    const response = await fetch(`${ROOT_URL}${path}`,{
        method: 'POST',
        credentials: 'same-origin',
        ...options,
        headers,
    })

    const data = await response.json()

    // console.log("lib-api-sendRequest ", path, "data:", data)

    if(data.error) {
        throw new Error(data.error)
    }

    return data
}