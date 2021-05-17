require('dotenv').config()
const{ google } = require('googleapis')
const req = 'Slipknot' // request search
const amount = '5' // how many first videos



google.youtube('v3').search.list({
    key: process.env.YOUTUBE_TOKEN,
    part: 'snippet',
    q: req,
    type: 'video',
    maxResults: amount,
}).then((response) => {
    const{ data } = response
    data.items.forEach((item) => {
        google.youtube('v3').videos.list({
            part: 'snippet,contentDetails,statistics',
            id: item.id.videoId,
            key: process.env.YOUTUBE_TOKEN,
        }).then((response2 => {
            console.log(`Title: ${item.snippet.title} |  views: ${response2.data.items[0].statistics.viewCount}`)
        })).catch((err) => console.log(err))
    })
}).catch((err) => console.log(err))

