let isPlaying = false;
let onlyShowOneFrame = false;

let manager;

let bkImage;
let floaterImages = [];
const imgAmount = 5;

let eyePos, eyeLastPos, eyeDir;

let isViewerActive = false;
let eyeUnchangedTimer = 0;
let unchangeTimeout = 1;

/* --- 设置菜单数值变量 --- */
let s_maxAmount;
let s_mode;
let s_endTimedate;
let s_BackgroundImage;
let s_size;
let s_textSpacing;
let s_imgOpacity;
let s_shadowOpacity;
let s_shadowThickness;
let s_shadowSoftness;
let s_localMoveSpeed;
let s_followMoveSpeed;
let s_rotateSpeed;
/* --- 设置菜单数值提示element --- */
let v_maxAmount;
let v_mode;
let v_endtimedate;
let v_size;
let v_textSpacing;
let v_imgOpacity;
let v_shadowOpacity;
let v_shadowThickness;
let v_shadowSoftness;
let v_localMoveSpeed;
let v_followMoveSpeed;
let v_rotateSpeed;

function preload()
{
    bkImage = loadImage("images/background/bk.jpg");

    // 先加载数字0～9的图像(10个) + ":" + 图形文件
    for (let i = 0; i < 10; i++)
    {
        floaterImages.push(loadImage("images/numbers/" + i + ".png"));
    }
    floaterImages.push(loadImage("images/numbers/colon.png"));

    // 图形文件
    for (let i = 1; i <= imgAmount; i++)
    {
        floaterImages.push(loadImage("images/floaters/" + i.toString() + ".png"));
    }
}

function setup()
{
    createCanvas(windowWidth, windowHeight);

    // 初始化设置菜单用于显示数值的element
    initSettingElements();

    // 视线位置相关的向量初始化
    rawEyePos = createVector(windowWidth / 2, windowHeight / 2);
    eyePos = createVector(-1, -1);
    eyeLastPos = createVector(-1, -1);
    eyeDir = createVector(0, 0);

    // 生成Manager实例,并初始化图像数据
    manager = new FloaterManager(floaterImages);
    //manager.setToNumberMode(false);
}
  
function draw()
{
    if (isPlaying)
    {
        const deltaTime = 1000 / Math.floor(frameRate());

        // 背景图片
        tint(255, 255);
        image(bkImage, 0, 0, windowWidth, windowHeight);

        // 更新眼光位置以及视线移动方向
        updateEyeDirection()

        // 检查是否换人
        checkChangeViewer(deltaTime);

        // 更新所有飞蚊
        manager.update(deltaTime, eyeDir);


        /* ---------- DEBUG ---------- */
        // 鼠标测试
        //rawEyePos.set(mouseX, mouseY);
        //smoothEyePos(rawEyePos);

        // 眼睛位置
        fill(0, 255, 0);
        circle(eyeX, eyeY, 20);
        // 帧数
        text("FPS: " + Math.floor(frameRate()), 10, 20);
        /* ---------- DEBUG ---------- */
    }
    else
    {
        if (onlyShowOneFrame)
        {
            // 背景图片
            tint(255, 255);
            image(bkImage, 0, 0, windowWidth, windowHeight);

            // 更新所有飞蚊
            manager.update(deltaTime, eyeDir);

            onlyShowOneFrame = false;
        }
    }
}

function updateEyeDirection()
{
    // 计算眼睛看向的方向 (eyeX, eyeY)为经过滤波处理的视线位置
    eyePos.set(eyeX, eyeY);
    if (eyeLastPos.x != -1) { eyeDir = p5.Vector.sub(eyePos, eyeLastPos); }
    eyeLastPos = p5.Vector.copy(eyePos);
}

function checkChangeViewer(deltaTime)
{
    // 如果和上一帧的眼球位置相同
    if (eyeDir.mag() == 0)
    {
        eyeUnchangedTimer += deltaTime;
        if (isViewerActive &&
            eyeUnchangedTimer > unchangeTimeout * 1000 &&
            document.getElementById("webgazerFaceFeedbackBox").style.borderColor =="black")
        {
            isViewerActive = false;
        }
    }
    else
    {
        eyeUnchangedTimer = 0;
        if (!isViewerActive && document.getElementById("webgazerFaceFeedbackBox").style.borderColor =="green")
        {
            isViewerActive = true;
            manager.spawnFloater();
        }
    }
}

// -------------------------------- //
// 设置菜单数值对应函数
// -------------------------------- //
function initSettingElements()
{
    v_maxAmount = document.getElementById("max-amount-value");
    v_maxAmount.innerHTML = document.getElementById("max-amount-input").value;
    v_mode = document.getElementById("mode-input");
    v_mode.disabled = true;
    v_endtimedate = document.getElementById("endtime-input");
    v_endtimedate.disabled = true;
    v_size = document.getElementById("size-value");
    v_size.innerHTML = document.getElementById("size-input").value * 2 + "%";;
    v_textSpacing = document.getElementById("text-spacing-value");
    v_textSpacing.innerHTML = document.getElementById("text-spacing-input").value;
    document.getElementById("text-spacing-input").disabled = true;
    v_imgOpacity = document.getElementById("image-opacity-value");
    v_imgOpacity.innerHTML = document.getElementById("image-opacity-input").value;
    v_shadowOpacity = document.getElementById("shadow-opacity-value");
    v_shadowOpacity.innerHTML = document.getElementById("shadow-opacity-input").value;
    v_shadowThickness = document.getElementById("shadow-thickness-value");
    v_shadowThickness.innerHTML = document.getElementById("shadow-thickness-input").value;
    v_shadowSoftness = document.getElementById("shadow-softness-value");
    v_shadowSoftness.innerHTML = document.getElementById("shadow-softness-input").value;
    v_localMoveSpeed = document.getElementById("local-move-speed-value");
    v_localMoveSpeed.innerHTML = document.getElementById("local-move-speed-input").value;
    v_followMoveSpeed = document.getElementById("follow-move-speed-value");
    v_followMoveSpeed.innerHTML = document.getElementById("follow-move-speed-input").value;
    v_rotateSpeed = document.getElementById("rotate-speed-value");
    v_rotateSpeed.innerHTML = document.getElementById("rotatespeed-input").value;
}

function maxAmountChanged(value)
{
    s_maxAmount = value;
    v_maxAmount.innerHTML = value;

    manager.setMaxAmount(value);

    onlyShowOneFrame = true;
}

function modeChanged()
{
    s_mode = v_mode.checked;
    if (s_mode) // 倒计时模式
    {
        v_endtimedate.disabled = false;
    }
    else // 图像模式
    {
        v_endtimedate.disabled = true;
    }

    manager.setToNumberMode(s_mode);
}

function endtimeChanged()
{
    s_endTimedate = v_endtimedate.value;
}

function floaterImageChanged(input)
{
    // 暂时不支持修改飞蚊图像
}

function backgroundImageChanged(input)
{
    const imgName = input.files[0].name;
    const filepath = "images/background/" + imgName;
    bkImage = loadImage(filepath);

    onlyShowOneFrame = true;
}

function sizeChanged(value)
{
    s_size = value;
    v_size.innerHTML = value * 2 + "%";

    manager.setSizeMultiplier(value);

    onlyShowOneFrame = true;
}

function textSpacingChanged(value)
{
    s_textSpacing = value;
    v_textSpacing .innerHTML = value;

    manager.setTextSpacing(value)
}

function imageOpacityChanged(value)
{
    s_imgOpacity = value;
    v_imgOpacity.innerHTML = value;

    manager.setImageOpacity(value);

    onlyShowOneFrame = true;
}

function shadowOpacityChanged(value)
{
    s_shadowOpacity = value;
    v_shadowOpacity.innerHTML = value;

    manager.setShadowOpacity(value);

    onlyShowOneFrame = true;
}

function shadowThicknessChanged(value)
{
    s_shadowThickness = value;
    v_shadowThickness.innerHTML = value;

    manager.setShadowThickness(value);

    onlyShowOneFrame = true;
}

function shadowSoftnessChanged(value)
{
    s_shadowSoftness = value;
    v_shadowSoftness.innerHTML = value;

    manager.setShadowSoftness(value);

    onlyShowOneFrame = true;
}

function localMovespeedChanged(value)
{
    s_localMoveSpeed = value;
    v_localMoveSpeed.innerHTML = value;

    manager.setLocalMoveSpeed(value);
}

function followMovespeedChanged(value)
{
    s_followMoveSpeed = value;
    v_followMoveSpeed.innerHTML = value;

    manager.setFollowMoveSpeed(value);
}

function rotatespeedChanged(value)
{
    s_rotateSpeed = value;
    v_rotateSpeed.innerHTML = value;

    manager.setRotateSpeed(value);
}

function clearBtnClicked()
{
    manager.clearAllFloaters();

    onlyShowOneFrame = true;
}