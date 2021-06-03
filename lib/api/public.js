import sendRequest from './sendRequest'

const BASE_PATH = '/api/v1/public'

export const getBookDetailApiMethod = ({ slug }) => {
    const data = sendRequest(`${BASE_PATH}/books/${slug}`, {
        method: "GET",
    })

    return data
}
export const getChapterDetailApiMethod = ({ bookSlug, chapterSlug }, options = {}) => {
    console.log(`lib-api-public-getChapterDetailApiMethod bookSlug:${bookSlug}`)
    console.log(`lib-api-public-getChapterDetailApiMethod chapterSlug:${chapterSlug}`)
    console.log(`lib-api-public-getChapterDetailApiMethod options:${options}`)
    const data = sendRequest(`${BASE_PATH}/get-chapter-detail?bookSlug=${bookSlug}&chapterSlug=${chapterSlug}`,{
        method: "GET",
        ...options,
    })

    return data
}