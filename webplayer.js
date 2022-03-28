let videoCont = document.querySelector("#videoPlayerCont");
let video = document.querySelector("#videoPlayer");
let playBut = document.querySelector("#playpause");
let playButPath = playBut.querySelector("#play");
let vol = document.querySelector("#volume");
let volBut = document.querySelector("#volume #vol-but");
let volBar = document.querySelector("#volume #vol-percent-bar");
let volPin = document.querySelector("#volume #vol-percent-bar #vol-pin");
let currentTime = document.querySelector("#currentTime");
let totalTime = document.querySelector("#totalTime");
let subs = document.querySelector("#subs");
let settings = document.querySelector("#settings");
let pip = document.querySelector("#pip");
let fsBut = document.querySelector("#fullscreen");
let fsButPaths = document.querySelectorAll("#fullscreen path");
let progBarPin = document.querySelector("#progress-bar #bar-pin");
let dbClick=false;
let dbTimer;
let dbDelay= 200;

let barWidth = Math.round( volBar.clientWidth ) || 100;
let halfBarWidth = Math.round( barWidth / 2 );
let barOffsetLeft = Math.ceil( volBar.offsetLeft + (volPin.clientWidth/2 || 7.5) );
let maxGain = 15;
let GainMagicNum = maxGain / halfBarWidth;
let gain = 1;
let volumeStep = barWidth/20;

let AudioGainNode = AudioGain( video, maxGain );
SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );

// Sound 
video.addEventListener("wheel",(e)=>{
    e.preventDefault();
    if (e.deltaY < 0) {
        SetVolumeSettings( {clientX : barOffsetLeft + volPin.offsetLeft + volumeStep } );        
    } else {
        SetVolumeSettings( {clientX : barOffsetLeft + volPin.offsetLeft - volumeStep } );        
    }
}, {passive:false});
volBut.addEventListener("click",(e)=>{
    let state = vol.getAttribute("data-state");
    if( state === "muted" ){
        SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );        
    }else {
        SetVolumeSettings(e);
    }
});
volBar.addEventListener('mousedown', e => {
    e.preventDefault()
    SetVolumeSettings(e);
    document.onmousemove= SetVolumeSettings;
    document.onmouseup= MouseUp;
}, {passive:false});

function SetVolumeSettings(e){
    let x = e.clientX
    let volume;
    if(barOffsetLeft >= x){
        volume = 0;
        vol.setAttribute("data-state","muted");
    }
    else if( x >= barOffsetLeft + barWidth ){
        volume = barWidth;
    }else{
        volume = x - barOffsetLeft;
    }
    Vol_Colors_Gain(volume);
    volPin.style.left = volume + "px";
}
function Vol_Colors_Gain( volume ){
    let normBarsCol;
    let extBarsCol;
    if(volume > halfBarWidth){
        vol.setAttribute("data-state","extreme");
        gain = (volume - halfBarWidth) * GainMagicNum;
        normBarsCol = (halfBarWidth * 100) / barWidth;
        extBarsCol = ((volume - halfBarWidth) * 100) / barWidth ;
    }else{
        if(volume > halfBarWidth/2 ){
            vol.setAttribute("data-state","full");
        } else if( volume > 0 ){
            vol.setAttribute("data-state","half");
        }
        gain = volume / halfBarWidth;
        normBarsCol = volume;
        extBarsCol = 0;
    }
    AudioGainNode.gain.value = gain;
    volBar.style.setProperty("--vol-Normal", normBarsCol + "%");
    volBar.style.setProperty("--vol-Extreme",extBarsCol  + "%");
}
function MouseUp(e) {
    document.onmousemove= null;
    document.onmouseup= null;
}
function AudioGain( audioSource ){
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let source = audioCtx.createMediaElementSource(audioSource);
    let gainNode = audioCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    return gainNode;
}

// play - pause - replay
playBut.addEventListener("click",PlayHandler);
video.addEventListener("click",PlayHandler);
video.addEventListener('ended', (event) => {
    playBut.setAttribute("data-state","replay");
});
function PlayHandler(e){
    timer = setTimeout(()=>{
        if(!dbClick){
            if(playBut.getAttribute("data-state") === "play"){
                playBut.setAttribute("data-state","pause");
                video.play();
            }
            else if(playBut.getAttribute("data-state") === "pause"){
                playBut.setAttribute("data-state","play");
                video.pause();
            } else{
                playBut.setAttribute("data-state","pause");
                video.pause();
                video.currentTime = 0;
                video.play();
            }
        }else{
            dbClick= false;
        }
    }, dbDelay);
}
// video.addEventListener('play', (event) => {
//     playBut.setAttribute("data-state","pause");
// });
// video.addEventListener('pause', (event) => {
//     playBut.setAttribute("data-state","play");
// });

// fullscreen
fsBut.addEventListener("click",FullScrHandler);
video.addEventListener("dblclick",(e)=>{
    dbClick = true;
    clearTimeout( timer );
    FullScrHandler(e);
});
document.addEventListener('fullscreenchange', event => {
    if( document.fullscreenElement === videoPlayerCont){
        fsBut.setAttribute("data-state","nofull");
    } 
    else if(document.fullscreenElement === null){
        fsBut.setAttribute("data-state","full");
    }
});
function FullScrHandler(e){
    if( document.fullscreenElement === videoPlayerCont){
        document.exitFullscreen();
    } 
    else if(document.fullscreenElement === null){
        videoCont.requestFullscreen();
    }
}

pip.addEventListener("click",PipHandler);
addEventListener('leavepictureinpicture', event => { 
    pip.setAttribute("data-state","disabled");
});
function PipHandler(){
    if(document.pictureInPictureElement === null && document.pictureInPictureEnabled){
        pip.setAttribute("data-state","enabled");
        video.requestPictureInPicture();
    } else if(document.pictureInPictureElement === video){
        pip.setAttribute("data-state","disabled");
        document.exitPictureInPicture();
    }
}
