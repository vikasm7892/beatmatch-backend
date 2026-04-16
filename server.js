const express = require('express')
const axios = require('axios')
const app = express()

app.get('/', (req, res) => {
    res.json({ status: 'BeatMatch API is running!' })
})

async function fetchFromItunes(term, country, limit) {
    const response = await axios.get('https://itunes.apple.com/search', {
        params: { term, media: 'music', entity: 'song', limit, country },
        headers: { 'User-Agent': 'iTunes/12.12.4 (Macintosh; OS X 12.6)' },
        timeout: 10000
    })
    return response.data
}

app.get('/search', async (req, res) => {
    const limit   = req.query.limit || 50
    const countries = ['US', 'IN', 'GB', 'AU']

    // Support multiple fallback terms: /search?term=hip+hop&fallback=rap&fallback=eminem
    let terms = [req.query.term || 'pop']
    if (req.query.fallback) {
        const extra = Array.isArray(req.query.fallback)
            ? req.query.fallback
            : [req.query.fallback]
        terms = terms.concat(extra)
    }

    for (const term of terms) {
        for (const country of countries) {
            try {
                console.log(`Trying term="${term}" country=${country}`)
                const data = await fetchFromItunes(term, country, limit)
                console.log(`  → ${data.resultCount} results`)
                if (data.resultCount > 0) {
                    return res.json(data)
                }
            } catch (err) {
                console.log(`  → failed: ${err.message}`)
            }
        }
    }

    res.json({ resultCount: 0, results: [] })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('BeatMatch server is running!')
})