const express = require('express')

const {getNodeFromContent, createTelegraphPage} = require('./utils')

const PORT = 3000
const app = express()

const errorHandler = (error, req, res, next) => {
    console.log(error.stack)
    res.status(error.status || 500)
    res.json({
        error: true,
        message: error.message
    })
}

app.use(express.json())

app.post('/createPage', async (req, res, next) =>  {
    let { access_token, title, author_name, content} = req.body
    if(!access_token || !title || !content) {
        const error = new Error('Missing params')
        error.status = 500
        return next(error)
    }
    try {
        const pageObject = {
            access_token,
            title,
            author_name,
            content: getNodeFromContent(req.body.content)
        }
    
        const contentResponse = await createTelegraphPage(pageObject)
        res.send(contentResponse)
    } catch (error) {
        next(error)
    }
    
    
})

app.use(errorHandler)
app.listen(PORT, () => console.log(`Running on port ${PORT}`))

module.exports = app