const puppeteer = require('puppeteer')

const cheerio = require('cheerio')

const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/IMDB', {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
})
    .then(res => console.log('Connected to MongoDB.'))
    .catch(err => console.log('Error in connecting to MongoDB!'))

const movieDetailsSchema = new mongoose.Schema({
    title : String,
    storyLine : String,
    rating : String,
    ratingCount : String,
    releaseDate : String
})

const MovieDetails = new mongoose.model('MovieDetails', movieDetailsSchema)

async function webScrapper(){
    
    const browser = await puppeteer.launch({headless : false, slowMo : 1000})

    const page = await browser.newPage()

    const moviePage = await page.goto('https://www.imdb.com/title/tt7838252/?ref_=hm_inth_4', {waitUntil: 'networkidle2'})

    await page.screenshot({path : `screenshots/KGF.png`})

    const $ = cheerio.load(moviePage)

    const movieCred = await page.evaluate(() => {

        return {
            title : $('div[class="title_wrapper"] > h1').text().trim(),
            storyLine : $('div[class="inline canwrap"] > p > span').text().trim(),
            rating : $('div[class="ratingValue"] > strong').text(),
            ratingCount : $('span[itemprop="ratingCount"]').text(),
            releaseDate : $('a[title="See more release dates"]').text().trim()
        }
    })

    const movieDetails = new MovieDetails(movieCred)

    const movieDetailsSaved = await movieDetails.save()

    console.log(movieDetailsSaved)

    await browser.close()
}

webScrapper()
