const _ = require('lodash')

const slugify = (text) => _.kebabCase(text)

async function createUniqueSlug(Model, slug, count) {
    const user = await Model.findOne({ slug: `${slug}-${count}` }, 'id')

    if(!user) {
        return `${slug}-${count}`
    }

    return createUniqueSlug(Model, slug, count+1)
}

async function generateSlug(Model, name, filter = {}) {
    const originSlug = slugify(name)
    const user = await Model.findOne({ slug: originSlug, ...filter }, 'id')

    if(!user) {
        return originSlug
    }

    return createUniqueSlug(Model, originSlug, 1)
}

module.exports = generateSlug