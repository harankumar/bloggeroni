const fs = require('fs')
const handlebars = require('handlebars')
const ncp = require('ncp').ncp
const marky = require('marky-markdown')


const metadata = JSON.parse(fs.readFileSync("./in/index.json"))
const posts = metadata["posts"]

// Copy over assets
ncp("./in/assets", "./out/assets", (e) => {
    if (e) console.log(e)
})

// Make index.html
const homepageSrc = fs.readFileSync("./in/templates/index.hbs").toString()
const homepageHtml = handlebars.compile(homepageSrc)(metadata)

fs.writeFileSync("./out/index.html", homepageHtml)

// Make [post].html
const postTemplate = handlebars.compile(
    fs.readFileSync("./in/templates/post.hbs").toString()
)

for (let post of metadata["posts"]) {
    const postSrc = fs.readFileSync("./in/" + post["body_src"])
        .toString()
    post["body"] = marky(postSrc)
    const postHtml = postTemplate(post)

    fs.writeFileSync("./out/" + post["id"] + ".html", postHtml)
}


// TODO: TAGS