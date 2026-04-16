const express = require('express')
const axios = require('axios')
const app = express()

// Each genre has many artist fallbacks — server tries them until songs found
const GENRE_TERMS = {
    'pop':       ['taylor swift', 'ariana grande', 'dua lipa', 'ed sheeran', 'pop'],
    'hiphop':    ['eminem', 'drake', 'post malone', 'kanye west', 'kendrick lamar'],
    'rnb':       ['the weeknd', 'beyonce', 'rihanna', 'bruno mars', 'usher'],
    'rock':      ['coldplay', 'imagine dragons', 'linkin park', 'green day', 'rock'],
    'dance':     ['david guetta', 'alan walker', 'calvin harris', 'avicii', 'zedd'],
    '90s':       ['backstreet boys', 'spice girls', 'britney spears', 'nsync', 'boyzone'],
    'kpop':      ['bts', 'blackpink', 'twice', 'exo', 'shinee'],
    'bollywood': ['arijit singh', 'shreya ghoshal', 'atif aslam', 'neha kakkar', 'armaan malik'],
    'country':   ['luke combs', 'morgan wallen', 'johnny cash', 'kenny rogers', 'dolly parton'],
    'classic':   ['queen', 'beatles', 'michael jackson', 'elvis presley', 'rolling stones']
}

const COUNTRIES = ['US', 'IN', 'GB', 'AU', 'CA']

async function trySearch(term, country, limit) {
    const response = await axios.get('https://itunes.apple.com/search', {
        params: { term, media: 'music', entity: 'song', limit, country },
        headers: { 'User-Agent': 'iTunes/12.12.4 (Macintosh; OS X 12.6)' },
        timeout: 8000
    })
    return response.data
}

app.get('/', (req, res) => {
    res.json({ status: 'BeatMatch API running', genres: Object.keys(GENRE_TERMS) })
})

// New clean endpoint: /genre?name=hiphop&limit=50
app.get('/genre', async (req, res) => {
    const genreName = (req.query.name || 'pop').toLowerCase()
    const limit     = parseInt(req.query.limit) || 50
    const terms     = GENRE_TERMS[genreName] || GENRE_TERMS['pop']

    console.log(`Genre request: ${genreName}, terms: ${terms}`)

    for (const term of terms) {
        for (const country of COUNTRIES) {
            try {
                console.log(`  Trying "${term}" country=${country}`)
                const data = await trySearch(term, country, limit)
                if (data.resultCount > 0) {
                    console.log(`  ✅ Found ${data.resultCount} songs`)
                    return res.json(data)
                }
            } catch (err) {
                console.log(`  ❌ ${err.message}`)
            }
        }
    }
    res.json({ resultCount: 0, results: [] })
})

// Keep old /search endpoint working for pop
app.get('/search', async (req, res) => {
    const term  = req.query.term || 'pop'
    const limit = parseInt(req.query.limit) || 50

    for (const country of COUNTRIES) {
        try {
            const data = await trySearch(term, country, limit)
            if (data.resultCount > 0) return res.json(data)
        } catch (err) {
            console.log(`search failed: ${err.message}`)
        }
    }
    res.json({ resultCount: 0, results: [] })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('BeatMatch server running!')
}) 