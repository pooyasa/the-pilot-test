process.env.DEBUG = ["app:db" , "app:main"]
const express = require("express")
const debug = require("debug")("app:main");
const bodyParser = require("body-parser")
const mongooseLink = require('./modules/mongooseLink');
const favicon = require("serve-favicon")
const path = require('path')

const config = require("./config")

mongooseLink.begin()
const app = express()
app.set('view engine', 'ejs');
app.set("views" , './views');

app.use(express.static('static'))

app.use("/" , express.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/" , async (req , res) => {
    let leastShowedPictures = await mongooseLink.getLeastShowedPictures(config.numberOfPicturesToBeShown);
    let randomArray = [];
    let pictureNumbers = []
    let randomVar;
    for (let i = 0 ; i < config.numberOfPicturesToBeShown ; i++){
        randomVar = Math.floor(Math.random() * config.numberOfPicturesToBeShown * 3)
        while (!(randomArray.find(element => element == randomVar) == undefined)){
            randomVar = Math.floor(Math.random() * config.numberOfPicturesToBeShown )
        }
        randomArray.push(randomVar)
        pictureNumbers.push(leastShowedPictures[randomArray[i]].id)
        mongooseLink.incPictures(pictureNumbers[i])
    }
    res.render("home" , {title : "ارزیابی تصاویر" , pictures : pictureNumbers})
});

app.post("/" , (req , res) => {
    console.log(req.body)
    try {
        if (!validatePost(req.body))
            return res.status(400).send("Bad Request.");
        let timeStamps = JSON.parse(req.body.timeStamps);
        let model = {}
        model.gender = req.body.gender;
        model.age = req.body.age;

        model.education = req.body.education;
        model.disorder = req.body.disorder;
        model.medCond = req.body.medCond;

        delete req.body.gender;
        delete req.body.age;
        delete req.body.timeStamps;

        delete req.body.education;
        delete req.body.disorder;
        delete req.body.medCond;

        let happiness = {};
        let provoked = {};
        for(i in req.body){
            let modH = i.replace('h' , '');
            let modP = i.replace('p' , '');
            if (i != modH){
                happiness[modH] = req.body[i]
            } else if (i != modP){
                provoked[modP] = req.body[i]
            }
        }
        model.result = {} ;
        
        for (i in happiness)
        {
            model.result[i] = {};
            model.result[i].time = timeStamps[i];
            model.result[i].valence = happiness[i];
            model.result[i].arousal = provoked[i];
        }
        delete model.result[timeStamps.testRound];
        debug(model)
        mongooseLink.addReport(model)
        res.render("end" , {title : "ارزیابی تصاویر"})
    } catch (err) {
        console.error(err)
        res.send("Unknown Error")
    }
});

app.get("/getResults" , async  (req , res) => {
    res.json( await mongooseLink.getReports())
});

app.get("/getPictures" , async  (req , res) => {
    res.json( await mongooseLink.getPictures())
});

app.listen(3000 , () => {
    debug("Started!")
});

function validatePost(req) {
    if (!req.gender) return false;
    if (!req.age) return false;
    if (!req.timeStamps) return false;

    if (!req.education) return false;
    if (!req.disorder) return false;
    if (!req.medCond) return false;

    if(!req.timeStamps.split(",").length) return false;
    if(req.timeStamps.split(",").length < 2) return false;
    return true;
}

//mongooseLink.restartDatabase();
