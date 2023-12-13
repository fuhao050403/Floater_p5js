// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = false;

const collisionSVG = "collisionSVG";

window.onload = async function()
{
    if (!window.saveDataAcrossSessions)
    {
        var localstorageDataLabel = 'webgazerGlobalData';
        localforage.setItem(localstorageDataLabel, null);
        var localstorageSettingsLabel = 'webgazerGlobalSettings';
        localforage.setItem(localstorageSettingsLabel, null);
    
    }

    const webgazerInstance = await webgazer.setRegression('ridge')
        .setTracker('TFFacemesh')
        .begin();
    webgazerInstance.showVideoPreview(true)
        .showPredictionPoints(false)
        .applyKalmanFilter(false);
    webgazer.setGazeListener( EyeListener );

    kalman = kalmanFilterInit(0.1, 1, 100000);

    window.addEventListener("keypress", handleKeypress);
};

window.onbeforeunload = function()
{
    if (window.saveDataAcrossSessions) { webgazer.end(); }
    else { localforage.clear(); }
}

var eyeX = 0, eyeY = 0;
let rawEyePos;
var EyeListener = async function(data, clock)
{
    if(!data) return;

    if (isPlaying)
    {
        rawEyePos.set(data.x, data.y);
        smoothEyePos(rawEyePos);
    }
}

function smoothEyePos(rawPos)
{
    kalman.update(Matrix.arr(rawPos.array().splice(0,2)));
    const projection = kalman.project().data;
    eyeX = clamp(projection[0][0], 0, windowWidth);
    eyeY = clamp(projection[1][0], 0, windowHeight);
}

let kalman;
function kalmanFilterInit(pF, qF, rF)
{
    let state = new Matrix(4,1); // X
    let estimation = Matrix.eye(4).mul(pF); // P

    let stateModel = Matrix.arr([[1,0,1,0], [0,1,0,1], [0,0,1,0], [0,0,0,1]]); // A
    let observationModel = Matrix.arr([[1,0,0,0],[0,1,0,0]]); // H

    let processNoiseCovariance = Matrix.arr([[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]]).mul(qF); // Q
    let measurementNoiseCovariance = Matrix.arr([[1,0], [0,1]]).mul(rF); // R

    // Dummy Control Input terms
    let B = new Matrix(state.rows, state.rows);  
    let U = new Matrix(state.rows, state.cols);

    return new KalmanFilter(state, estimation, stateModel, observationModel, processNoiseCovariance, measurementNoiseCovariance, B, U);
}

function handleKeypress(e)
{
    if (e.code == "KeyP")
    {
        isPlaying = !isPlaying;

        if (isPlaying)
        {
            eyePos.x = windowWidth / 2;
            eyePos.y = windowHeight / 2;
            eyeLastPos = p5.Vector.copy(eyePos);

            document.getElementById("webgazerVideoContainer").style.opacity = 0;
            document.getElementById("settingBox").style.visibility = "hidden";
        }
        else
        {
            document.getElementById("settingBox").style.visibility = "visible";
        }
    }

    if (e.code == "KeyS")
    {
        manager.spawnFloater();
    }
}

function clamp(num, min, max)
{
    return Math.min(Math.max(num, min), max);
}