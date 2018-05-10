const fs = require('fs')
const handlebars = require('handlebars')
const ncp = require('ncp').ncp
const marky = require('marky-markdown')


handlebars.registerHelper("encodeURIComponent", encodeURIComponent)

const metadata = JSON.parse(fs.readFileSync("./in/index.json"))
const posts = metadata["posts"]

// Copy over assets
ncp("./in/assets", "./out/assets", (e) => {
    if (e) console.log(e)
})

// Make index.html
const homepageSrc = fs.readFileSync("./in/templates/index.hbs").toString()
const homepageTemplate = handlebars.compile(homepageSrc)
const homepageHtml = homepageTemplate(metadata)

fs.writeFileSync("./out/index.html", homepageHtml)

// Make [post].html
const postTemplate = handlebars.compile(
    fs.readFileSync("./in/templates/post.hbs").toString()
)

for (let post of metadata["posts"]) {
    const postSrc = fs.readFileSync("./in/" + post["body_src"])
        .toString()
    post["homepage"] = metadata["name"]
    post["body"] = marky(postSrc)
    const postHtml = postTemplate(post)

    fs.writeFileSync("./out/post-" + post["id"] + ".html", postHtml)
}


// Make [tag].html
const tags = new Set()
for (let post of metadata["posts"]) {
    for (let tag of post["tags"]) {
        tags.add(tag)
    }
}

for (let tag of Array.from(tags)) {
    const _metadata = {}

    _metadata["name"] = tag
    _metadata["description"] = `Posts tagged with "${tag}."`

    _metadata["posts"] = metadata["posts"]
        .filter((post) => post["tags"].indexOf(tag) !== -1)

    const tagHtml = homepageTemplate(_metadata)

    fs.writeFileSync("./out/tag-" + tag + ".html", tagHtml)
}