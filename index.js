process.env.DEBUG = ["app:db" , "app:main"]
const express = require("express")
const bodyParser = require("body-parser")
const mongooseLink = require('./modules/mongooseLink');
const axios = require("axios")
const config = require("./config")
var favicon = require('serve-favicon')
var path = require('path')


mongooseLink.begin()
const app = express()
app.set('view engine', 'ejs');
app.set("views" , './views');

app.use(express.static('static'))
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))

app.use("/" , express.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    res.render("home" , {title : "ارزیابی تصاویر" , pictures : pictureNumbers, capId: config.captcha.siteKey})
});

app.post("/" , (req , res) => {
    try{
        if (!validatePost(req.body)) return res.render("error" , {title : "خطای نامشخص"})
        if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
        {
            addtoDabatase(req, true);
            return res.render("end" , {title : "ارزیابی تصاویر"})
        }
        const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captcha.secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
        axios.create().get(verificationURL)
        .then(response => {
            body = response.data;
            if(body.success !== undefined && !body.success) {
                addtoDabatase(req, true);
                return res.render("end" , {title : "ارزیابی تصاویر"})
            }
            
            try {
                addtoDabatase(req, false);
                return res.render("end" , {title : "ارزیابی تصاویر"})
            } catch (err) {
                console.error(err.message)
                return res.render("error" , {title : "خطای نامشخص"})
            }
        })
        .catch(err => {
            console.log(err.message)
            return res.render("error" , {title : "خطای نامشخص"})
        })
    } catch (err) {
        console.log(err.message)
        return res.render("error" , {title : "خطای نامشخص"})
    }
});

app.get("/getResults" , async  (req , res) => {
    res.json( await mongooseLink.getReports())
});

app.get("/getPictures" , async  (req , res) => {
    res.json( await mongooseLink.getPictures())
});
const port = process.env.PORT || 3000;

app.listen(port , () => {
    console.log("Started!")
});


async function addtoDabatase(req, isValid){
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
    
    delete req.body['g-recaptcha-response']
    delete req.body.action
    
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
    if (isValid) model.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    mongooseLink.addReport(model)
}

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
