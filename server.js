const express = require('express')
const PornHub = require('./modules/Pornhub')
const Util = require('./modules/Util')
const app = express()
const cheerio = require('cheerio')
const portal = new PornHub();
const port = process.env.PORT || 1338

const starsAndCate = require('./modules/starsandcate')

app.get('/pornstars/:page', (req, res) => {
     let page = req.params.page || 1
     
     starsAndCate.fetchPornstars(page)
          .then(result => res.send({
               page : page,
               data: result
          }))
          .catch(e => console.log(e))
});


app.get('/categories', (req, res) => {
     starsAndCate.fetchCategories()
          .then(result => res.status(200).send({
               page : 1,
               categories : result
          }))
          .catch(e => console.log(e))
});

app.get('/search', (req, res) => {
     const q = req.query
     
     portal.searchVideo({
          search: q.search,
          page : q.page,
          thumbsize : q.thumbsize
     })
     .then(result => {
          const reduce = []
          result.videos.forEach(video => {
               reduce.push({
                    video_id : video.video_id,
                    views : video.views,
                    duration : video.duration,
                    ratings: video.ratings,
                    rating : video.rating,
                    title : video.title,
                    url : video.url,
                    default_thumb :video.default_thumb,
                    thumb : video.thumb,
                    publish_date: video.publish_date,
                    segment: video.segment
               })
          });
          res.status(200).send({
               videos : reduce
          });
     })
     .catch(e => res.status(500).send({message : "Something went wrong"}))
});

// Get Embed Video by ID
app.get('/embed/:video_id', (req, res) => {
     let width = req.query.width;
     let height = req.query.height

     portal.getVideoEmbedCode(req.params.video_id)
          .then(result => {
               const stringHtml = Util.escapeCharacter(result.embed.code);
               
               const viewPortHtml = Util.modifyWidthAndHeight(stringHtml,width,height)
               
               res.send({code : viewPortHtml})
          })
          .catch(e => res.status(404).send(e))
});

app.get('/detail/:video_id', (req, res) => {
     portal.getVideoDetail(req.params.video_id)
          .then(result => res.send(result))
          .catch(e => res.status(404).send(e))
});


app.get('*', (req, res) => {
     res.status(404).send({
          message : "Get the fuck out"
     });
});

app.listen(port, () => {
     console.log(`Server started on port ${port}`);
});

