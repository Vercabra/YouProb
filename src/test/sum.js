require('dotenv').config()
Promise = require('bluebird')
const{ google } = require('googleapis')
const config =  require('./s_request.json')
let Queue = require("queue-promise")
const fs = require("fs")
const chalk = require("chalk")
const cliProgress = require('cli-progress')
const _ = require("lodash")
const moment = require("moment")



async function processing () {

    let data1 = []

    const queue = new Queue({
        concurrent: 10,
        interval: 2
    });

    const progressBar = new cliProgress.SingleBar({
        format: ' {bar} {percentage}% | {value}/{total} | elapsed: {duration_formatted} | estimated: {eta_formatted} ' +
            'Current Request: '+chalk.green('{req}'),
        hideCursor: true
    })

    progressBar.start(config.length,0)

    queue.on("resolve", res => {
        progressBar.update(data1.length,{req: source.req})
    })

    queue.on('end', () => {
        progressBar.stop()
        fs.writeFileSync(
            require.resolve("./s_request.json"),
            JSON.stringify(data1, null, " ")
        )
    })

    config.forEach(source =>{
        queue.enqueue(() => new Promise((resolve, reject) => {
            google.youtube('v3').search.list({
                key: process.env.YOUTUBE_TOKEN,
                part: 'snippet',
                q: source.req,
                type: 'video',
                maxResults: source.amount,
            }).then((response) => {
                const {data} = response
                let result = []
                Promise.each(data.items, (item) => {
                    return google.youtube('v3').videos.list({
                        part: 'snippet,contentDetails,statistics',
                        id: item.id.videoId,
                        key: process.env.YOUTUBE_TOKEN,
                    }).then((response2 => {
                        let res = {title: item.snippet.title, views: response2.data.items[0].statistics.viewCount}
                        result.push(res)
                    })).catch((err) => console.log(err))
                }).then(() => {
                    source.result = result;
                    source.updatedAt = new Date();
                    data1.push(source);
                    resolve(source)
                    progressBar.update(data1.length, {req: source.req});
                })
            }).catch((err) => reject(err))
        }))
    })
    queue.start()
}
processing()





