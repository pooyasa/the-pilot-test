const mongoose = require ("mongoose");
const reports = require ("../models/reports.js");
const pictures = require ("../models/pictures.js");
const clc = require("cli-color")

//const url = 'mongodb://localhost:27017/pilotTest';
const url = "mongodb://ubgasaeyxfkdax8edwsa:B15AkMQ55BgHjNrb6Xe1@bzkphowgjeg42gj-mongodb.services.clever-cloud.com:27017/bzkphowgjeg42gj"
//const url = 'mongodb+srv://pooyasajjadi@gmail.com:ASDASD123@cluster0-0s2ms.mongodb.net/pilotTest?retryWrites=true&w=majority'
const dbDebugger = require("debug")("app:db");

module.exports = {
    begin : function (){
        mongoose.connect(url , { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false}, () => {
            dbDebugger(clc.green("Connected to the database!"))
        });        
    },
    addReport : async function(req) {
        try { // Checks if model is folan
            await reports.validate(req); //If validates, Proceeds
            dbDebugger("Model is valid!")
            const report = new reports({
                gender: req.gender,
                age: parseInt(req.age),
                result: req.result,
                education: parseInt(req.education),
                disorder: parseInt(req.disorder),
                medCond: parseInt(req.medCond)
            })
            try{
                const save = await report.save();
                dbDebugger("Added to database!");
                return save;
            } catch(err) {
                return err;
            };
          } catch (err) {
            dbDebugger(clc.red.bold("Add report Error"), err)
            return (err._message);
          }
    },
    getReports : async function (){
        try{
            dbDebugger(clc.yellow.bold("getReports"))
            let get = await reports.find();
            return get
        } catch (err) {
            dbDebugger(clc.red.bold("getReports"))
            return err;
        };
    },
    getPictures : async function (){
        try{
            dbDebugger(clc.yellow.bold("getPictures"))
            let get = await pictures.find();
            get = get.map(pic => ({id: pic.id, number: pic.number}))
            return get
        } catch (err) {
            dbDebugger(clc.red.bold("getCustomer"))
            return err;
        };
    },
    incPictures : async function (id){
        try{
            //dbDebugger(clc.yellow.bold("incPictures " + id))
            let result = await pictures.findOneAndUpdate({id :id}, {$inc : {'number' : 1}});
            return true;
        } catch (err) {
            dbDebugger(clc.red.bold("incPictures"))
            return false;
        };
    },
    getLeastShowedPictures : async function (number){
        try{
            dbDebugger(clc.yellow.bold("getLeastShowedPictures "))
            const picture = await pictures
            .find()
            .sort({number: 1})
            .limit((number * 3));
            return picture
        } catch (err) {
            dbDebugger(clc.red.bold("getLeastShowedPictures"))
            return false;
        };
    },
    addPictures : async function (id){
        try { //Find duplicate rows
            const get = await pictures.find({id:id});
            if (get.length > 0){
                try {
                    await pictures.deleteMany({id:id});
                    dbDebugger("Duplicated Picture Id, removed the last one");
                } catch (err) {
                    dbDebugger(clc.red.bold("addCustomer Validate"))
                    return err;
                }
            }
        } catch (err) {
            dbDebugger(clc.red.bold("addCustomer"))
            return err;
        }
        const picture = new pictures({
            id: parseInt(id),
            number: 0
        })
        try{
            const save = await picture.save();
            dbDebugger("Added to pictures database!");
            return save;
        } catch(err) {
            dbDebugger(clc.red.bold("addPictures Error"))
            dbDebugger(err);
            return err;
        };
    },    
    deleteReports : async function (){
        try{
            dbDebugger(clc.yellow.bold("deleteReports"))
            let get = await reports.deleteMany({});
            dbDebugger(get)
            return get
        } catch (err) {
            dbDebugger(clc.red.bold("deleteReports"))
            return err;
        };
    },
    restartDatabase : async function(){
        for (let i = 1 ; i < 301 ; i++ )
            await this.addPictures(i);
        await this.deleteReports();
    }
}