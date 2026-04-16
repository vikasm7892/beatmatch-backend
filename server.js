const express = require('express')
const axios = require('axios')
const app = express()

app.get('/search', async (req, res) => {
    const term = req.query.term || 'pop'
    const limit = req.query.limit || 50

    console.log('Searching for:', term)

    try {
        const response = await axios.get('https://itunes.apple.com/search', {
            params: {
                term: term,
                media: 'music',
                entity: 'song',
                limit: limit
            },
            timeout: 15000
        })

        console.log('iTunes responded with:', response.data.resultCount, 'results')
        res.json(response.data)

    } catch (error) {
        // This will print the REAL error in your Command Prompt
        console.log('ERROR:', error.message)
        console.log('ERROR CODE:', error.code)
        if (error.response) {
            console.log('STATUS:', error.response.status)
            console.log('DATA:', error.response.data)
        }
        res.status(500).json({ resultCount: 0, results: [] })
    }
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('BeatMatch server is running!')
})