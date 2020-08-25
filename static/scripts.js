var slideIndex = 1;
showSlides(slideIndex);
let lastTime = Date.now();
let picturesId = document.getElementById("pictureCounter").innerHTML.split(',');
let currentPictureId;
function plusSlides(n, picId) {
    if (slideIndex > 1){
        let isCheckedHappiness = false;
        let isCheckedProvoked = false;
        let currentPicture = slideIndex - 2;
        currentPictureId = picturesId[currentPicture];
        let radios1 = document.getElementsByName('h' + parseInt(currentPictureId));
        let radios2 = document.getElementsByName('p' + parseInt(currentPictureId));
        for (i in radios1){
            if (radios1[i].checked){
                isCheckedHappiness = true;
                break;
            }
        }
        for (i in radios2){
            if (radios2[i].checked){
                isCheckedProvoked = true;
                break;
            }
        }
       if (isCheckedHappiness && isCheckedProvoked) {
            const shownOptions = document.getElementsByClassName("shownPooya");
            const hiddenOptions = document.getElementsByClassName("hiddenPooya");
            getArousalTime(picId);
            for (i = 0; i < shownOptions.length; i++) {
                shownOptions[i].style.display = "block";
            }
            
            for (i = 0; i < hiddenOptions.length; i++) {
                hiddenOptions[i].style.display = "none";
            }
            if (currentPicture == 0){
                //console.log("Test Round: ID = " + currentPictureId)
                let element = document.getElementById("timeStamps");
                let times = JSON.parse(element.value);
                times.testRound = currentPictureId;
                element.value = JSON.stringify(times)
            }
            if (document.getElementById(`counterHead-${slideIndex-1}`))
                document.getElementById(`counterHead-${slideIndex-1}`).innerHTML = `${slideIndex - 1}/50`
            setTimeout(() => showSlides(slideIndex += n) , 0);
            lastTime = Date.now();
        } else  {
            //console.log ("Happines: " + isCheckedHappiness  + " Provoked: " + isCheckedProvoked);
        }
    } else {
        setTimeout(() => showSlides(slideIndex += n) , 0);
        lastTime = Date.now();
    }
}

function getHappinessTime(picId){
    if (slideIndex > 1){
        let isCheckedHappiness = false;
        let currentPicture = slideIndex - 2;
        currentPictureId = picturesId[currentPicture];
        let radios1 = document.getElementsByName('h' + parseInt(currentPictureId));

        for (i in radios1){
            if (radios1[i].checked){
                isCheckedHappiness = true;
                break;
            }
        }

           if (isCheckedHappiness) {
            const shownOptions = document.getElementsByClassName("shownPooya");
            const hiddenOptions = document.getElementsByClassName("hiddenPooya");
            document.getElementById(`sub-${picId}`).style.display = "none";
            document.getElementById(`next-${picId}`).style.display = "block";
            document.getElementById(`next-${picId}`).style.marginTop= "0";

            for (i = 0; i < shownOptions.length; i++) {
                shownOptions[i].style.display = "none";
            }
            
            for (i = 0; i < hiddenOptions.length; i++) {
                hiddenOptions[i].style.display = "block";
            }
        
            let element = document.getElementById("timeStamps");
            let times = JSON.parse(element.value);
            let time = Date.now() - lastTime;
            //console.log("Setting Happiness time for the " + picId  + ": " + time)
            times[picId] = {};
            times[picId].valenceTime = time;
            element.value = JSON.stringify(times);	
            lastTime = Date.now();
        } else {
            //console.log("IS NOT CHECKED")
        }

    }

}
function getArousalTime(picId){
    let element = document.getElementById("timeStamps");
    let times = JSON.parse(element.value);
    let time = Date.now() - lastTime;
    //console.log("Setting Arousal time for the " + picId  + ": " + time)
    times[picId].arousalTime = time;
    element.value = JSON.stringify(times);	
    lastTime = Date.now();
}
