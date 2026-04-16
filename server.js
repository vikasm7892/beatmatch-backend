const express = require('express')
const axios = require('axios')
const app = express()

app.get('/', (req, res) => {
    res.json({ status: 'BeatMatch API is running!' })
})

app.get('/search', async (req, res) => {
    const term = req.query.term || 'pop'
    const limit = req.query.limit || 50

    // Try multiple storefronts until we get results
    const countries = ['US', 'IN', 'GB', 'AU']

    for (const country of countries) {
        try {
            console.log(`Trying term="${term}" country=${country}`)

            const response = await axios.get('https://itunes.apple.com/search', {
                params: {
                    term: term,
                    media: 'music',
                    entity: 'song',
                    limit: limit,
                    country: country
                },
                headers: {
                    'User-Agent': 'iTunes/12.12.4 (Macintosh; OS X 12.6)'
                },
                timeout: 10000
            })

            const count = response.data.resultCount
            console.log(`country=${country} returned ${count} results`)

            if (count > 0) {
                // Found songs — return immediately
                return res.json(response.data)
            }

        } catch (error) {
            console.log(`country=${country} failed:`, error.message)
        }
    }

    // All countries exhausted
    console.log('All countries failed for term:', term)
    res.json({ resultCount: 0, results: [] })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('BeatMatch server is running!')
})