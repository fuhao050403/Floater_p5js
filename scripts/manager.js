class FloaterManager
{
    constructor(images)
    {
        // 成员变量初始化
        this.numberMode = false;

        this.floaters = [];
        this.amount = 0;
        this.maxAmount = 200;

        // 图像参数
        this.floaterRawImgs = images;
        this.shadowImgs = [];
        //this.floaterImg; // 用于传递给Floater类的单一图像
        //this.shadowImg; // 用于传递给Floater的阴影的单一图像
        this.sizeMultiplier = .7;

        // 文字图像相关参数
        this.numberImgWidth;
        this.numberImgHeight;
        this.colonImgWidth; // 冒号
        this.colonImgHeight;
        this.numberSpacing = 0.1;

        // 阴影参数
        this.shadowThickness = 8; // 最小为2
        this.shadowSoftness = 4;

        // 透明度
        this.imageOpacity = 0.25;
        this.shadowOpacity = 0.25;

        // 行为参数
        this.localMoveSpeed = 7;
        this.followMoveSpeed = 10;
        this.rotateSpeed = 5;

        // 倒计时
        this.endtimeData = new Date();
        this.countdownTimer = 0;

        // 初始化图像数据
        this.setupRawImages();
        this.setFloaterImage();

        /* ----- 初始生成Floater ----- */
        const initCount = 1;
        for (let i = 0; i < initCount; i++)
        {
            this.spawnFloater();
        }
    }

    // -------------------------------- //
    // Floater控制函数
    // -------------------------------- //
    update(deltaTime, eyeDir)
    {
        // 如果是倒计时模式,则启用Interval
        if (this.numberMode) { this.countdownInterval(deltaTime); }

        // 更新所有Floater的位置 (倒计时模式下的图片更新,在countdownInterval中完成)
        this.floaters.forEach(floaterObj => {
            floaterObj.floater.update(
                deltaTime,
                eyeDir,
                this.localMoveSpeed,
                this.followMoveSpeed,
                this.rotateSpeed
                );
            floaterObj.floater.show(
                this.sizeMultiplier,
                this.imageOpacity,
                this.shadowOpacity
            );
        })

        text("Amount: " + this.amount, 10, 40);
    }

    spawnFloater()
    {
        const newFloater = new Floater();

        if (this.numberMode)
        {

        }
        else
        {
            // 给新生成的Floater创建随机的图像索引
            const newImgIndex = this.generateImageIndex();
            newFloater.setImageIndex(newImgIndex);
            // 根据生成的索引值,分配原始图像数据
            newFloater.updateImage(this.floaterRawImgs[11 + newImgIndex], this.shadowImgs[11 + newImgIndex]);
        }

        // 添加到数列中
        this.floaters.push({floater: newFloater});
        this.amount++;

        // 如果超过最大允许数量,则删除多出的floater
        if (this.amount > this.maxAmount)
        {
            this.removeFloaters(this.amount - this.maxAmount);
        }
    }

    generateImageIndex()
    {
        const randNum = random(99); // 不能为100,若4张图片则间隔为25且索引值最大应为3,如果正好随机到100,则结果为4
        const step = 100 / imgAmount;
        return Math.floor(randNum / step);
    }

    removeFloaters(amount)
    {
        console.log(amount);
        if (amount > this.floaters.length) return;

        for (let i = 0; i < amount; i++)
        {
            this.floaters[0] = null;
            this.floaters.shift();
        }

        this.amount -= amount;
    }

    clearAllFloaters()
    {
        this.removeFloaters(this.floaters.length);
    }

    countdownInterval(deltaTime)
    {
        this.countdownTimer += deltaTime;
        if (this.countdownTimer >= 1000) // 经过1秒
        {
            // 更新Floater文字图像
            this.setFloaterImage();

            // 累加时间-1秒
            this.countdownTimer -= 1000;
        }
    }

    // -------------------------------- //
    // 图像处理相关
    // -------------------------------- //

    // 用来根据当前的参数调整所有floater的原始图像数据
    // 尺寸的修改: 不直接对原始图片resize,因为resize函数会自动对原始图像进行压缩,如果先缩小再变回原来尺寸时,由于缩小时进行了画质压缩,所以即使变回原始尺寸,清晰度也会和原来不同
    // 所以当前的做法为: 直接将原始尺寸的图像传递给Floater对象,再在每帧输出时,通过scale函数动态的调整大小,而不对原始图像进行缩放. 阴影图像同理
    // *** 该函数当前只用在当阴影的参数发生变化时,重新生成阴影的图像 ***
    setupRawImages()
    {
        this.shadowImgs.length = 0;

        this.floaterRawImgs.forEach((img) =>
        {
            // 修改大小
            //img.resize(img.width * this.sizeMultiplier, img.height * this.sizeMultiplier);

            // 生成阴影
            let shadow = this.addOutline(img, this.shadowThickness);
            shadow.filter(BLUR, this.shadowSoftness);
            this.shadowImgs.push(shadow);
        });

        // this.numberImgWidth = this.floaterRawImgs[0].width;
        // this.numberImgHeight = this.floaterRawImgs[0].height;
        // this.colonImgWidth = this.floaterRawImgs[10].width;
        // this.colonImgHeight = this.floaterRawImgs[10].height;
    }

    // 传递给Floater对象的用于显示的处理完成的图像
    setFloaterImage()
    {
        if (this.numberMode)
        {
            // const countdownStr = this.updateCountdownNumber();
            // this.floaterImg = this.generateNumberImage(countdownStr, true);
            // this.shadowImg = this.generateNumberImage(countdownStr, false);
            // this.shadowImg.filter(BLUR, this.shadowSoftness);

            // // 更新每个Floater的图片
            // this.floaters.forEach(floaterObj => {
            //     floaterObj.floater.updateImage(this.floaterImg, this.shadowImg);
            // });
        }
        else
        {
            // 更新每个Floater的图片
            // this.floaters.forEach(floaterObj => {
            //     const imgIndex = floaterObj.floater.getImageIndex();

            //     this.floaterImg = this.floaterRawImgs[11 + imgIndex];
            //     this.shadowImg = this.shadowImgs[11 + imgIndex];
            //     this.shadowImg.filter(BLUR, this.shadowSoftness);

            //     floaterObj.floater.updateImage(this.floaterImg, this.shadowImg);
            // });
        }
    }

    updateCountdownNumber()
    {
        const end = new Date("2023-12-01T12:00:00");
        const now = new Date().getTime();

        const distance = end - now;
        if (distance < 0) return "00:00:00";

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let countdownText = "";
        if (hours < 10) { countdownText += "0"; }
        countdownText += hours.toString() + ":";
        if (minutes < 10) { countdownText += "0"; }
        countdownText += minutes.toString() + ":";
        if (seconds < 10) { countdownText += "0"; }
        countdownText += seconds.toString();

        return countdownText; // 输出例: "123:56:24"
    }

    // 根据指定的数字的字符串,合并并生成一张图像
    generateNumberImage(number, notShadow)
    {
        // 提取出number(字符串)中的每个数字(字符串形式保存)
        const eachNum = [];
        number.split('').forEach((num) => { eachNum.push(num); })
        const digits = eachNum.length;

        // 尺寸等,距离相关参数
        const offset = this.numberImgWidth * this.numberSpacing;
        const edgePlus = this.shadowThickness + this.shadowSoftness * 2.5;
        let w, h;
        if (notShadow) // 原始图片
        {
            w = this.numberImgWidth * (digits - 2) + this.colonImgWidth * 2 + offset * (digits - 1);
            //h = this.numberImgHeight;
            h = w;
        }
        else // 阴影图片
        {
            w = this.numberImgWidth * (digits - 2) + this.colonImgWidth * 2 + offset * (digits - 1) + edgePlus * 2;
            //h = this.numberImgHeight + edgePlus * 2;
            h = w;
        }

        // 合成为一张图片
        const g = createGraphics(w, h);
        g.imageMode(CENTER);
        for (let i = 0; i < digits; i++)
        {
            const index = eachNum[i] == ":" ? 10 : parseInt(eachNum[i]);
            if (i == 0)
            {
                if (notShadow) // 原始图片
                {
                    g.translate(this.numberImgWidth / 2, this.numberImgHeight / 2);
                }
                else // 阴影图片
                {
                    g.translate(this.numberImgWidth / 2 + edgePlus, this.numberImgHeight / 2 + edgePlus);
                }
            }
            else
            {
                if (eachNum[i] == ":" || eachNum[i - 1] == ":")
                {
                    g.translate(this.numberImgWidth / 2 + this.colonImgWidth / 2, 0);
                }
                else
                {
                    g.translate(this.numberImgWidth + offset, 0);
                }
            }

            if (notShadow) { g.image(this.floaterRawImgs[index], 0, 0); } // 原始图片
            else { g.image(this.shadowImgs[index], 0, 0); } // 阴影图片
        }
        
        return g;
    }

    // 为指定图像添加Outline (不进行模糊处理)
    addOutline(img, thickness)
    {
        const w = img.width + thickness * 2 + this.shadowSoftness * 5;
        const h = img.height + thickness * 2 + this.shadowSoftness * 5;
        const g = createGraphics(w, h);

        g.imageMode(CENTER);
        g.translate(w / 2, h / 2);
        g.image(img, 0, 0, img.width, img.height);

        const shadow = g.get();
        shadow.loadPixels();

        //const c = color(shadowColor);

        const numVals = Math.floor(4 * w * h);
        // 先将所有非透明的像素点变为完全不透明的白色
        for (let c = 0; c < numVals; c += 4)
        {
            if (shadow.pixels[c + 3] == 0) continue;
            shadow.pixels[c + 0] = 255;
            shadow.pixels[c + 1] = 255;
            shadow.pixels[c + 2] = 255;
            shadow.pixels[c + 3] = 255;
        }

        // 向外侧添加指定层数的Outline
        let targetIndex;
        for (let i = 1; i <= thickness; i++)
        {
            for (let j = 0; j < numVals; j += 4)
            {
                // 如果当前像素为新加的Outline,则跳过
                if (shadow.pixels[j + 3] != 255 - i + 1) continue;

                // 检查当前像素点邻近的像素点,如果透明度为0则视为新的Outline
                // 新添加的Outline根据从内到外的所在层数,每增加一层透明度减1
                // 以方便下一个循环时判断哪些像素点为新添加的Outline
                /* 上 */
                targetIndex = j - w * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 下 */
                targetIndex = j + w * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 左 */
                targetIndex = j - 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 右 */
                targetIndex = j + 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 左上 */
                targetIndex = j - (w + 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 右上 */
                targetIndex = j - (w - 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 左下 */
                targetIndex = j + (w - 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
                /* 右下 */
                targetIndex =  j + (w + 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 0) { shadow.pixels[targetIndex + 3] = 255 - i; }
            }
        }

        // 向内侧添加指定层数的Outline (只向内添加厚度的1/3)
        for (let i = 1; i <= Math.floor(thickness / 3); i++)
        {
            for (let j = 0; j < numVals; j += 4)
            {
                // Outline的最内层的透明度为254
                if (shadow.pixels[j + 3] != 255 - i) continue;

                // 向内也使用透明度随层数增加而递减的原则
                /* 上 */
                targetIndex = j - w * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 下 */
                targetIndex = j + w * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 左 */
                targetIndex = j - 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 右 */
                targetIndex = j + 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 左上 */
                targetIndex = j - (w + 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 右上 */
                targetIndex = j - (w - 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 左下 */
                targetIndex = j + (w - 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
                /* 右下 */
                targetIndex =  j + (w + 1) * 4;
                if (shadow.pixels[targetIndex + 3] == 255) { shadow.pixels[targetIndex + 3] = 255 - i - 1; }
            }
        }

        // 指定层数的Outline添加完成后
        for (let i = 0; i < numVals; i += 4)
        {
            const curOpacity = shadow.pixels[i + 3];
            // 背景的像素点
            // 透明度设置为1的原因: 最后使用Gaussian Blur进行模糊处理时,
            // 如果背景的透明度为0,则算法会自动判断所有背景点为黑色(即使将背景的颜色值改为255,255,255)
            // 但如果透明度为1时,则会判定为其原本的颜色. 所以为了保证阴影外侧没有黑边,将所有背景像素点设置为透明度为1的白色
            if (curOpacity == 0)
            {
                shadow.pixels[i + 0] = 255;
                shadow.pixels[i + 1] = 255;
                shadow.pixels[i + 2] = 255;
                shadow.pixels[i + 3] = 1;
                continue;
            }
            // 原始图像所在区域的像素点
            if (curOpacity == 255)
            {
                shadow.pixels[i + 3] = 1;
                continue;
            }

            // 新添加的所有Outline的像素点
            shadow.pixels[i + 0] = 255;
            shadow.pixels[i + 1] = 255;
            shadow.pixels[i + 2] = 255;
            shadow.pixels[i + 3] = 255;
        }
        shadow.updatePixels();

        return shadow;
    }

    // -------------------------------- //
    // 设置器 Setters
    // -------------------------------- //
    setMaxAmount(amount)
    {
        this.maxAmount = amount;

        if (this.amount > this.maxAmount)
        {
            this.removeFloaters(this.amount - this.maxAmount);
        }
    }

    setToNumberMode(isNumberMode)
    {
        this.numberMode = isNumberMode;

        this.setFloaterImage();
    }

    setEndtimeDate(date)
    {
        this.endtimeData = date;
    }

    setSizeMultiplier(value)
    {
        this.sizeMultiplier = value * 2 / 100; // 0.0 ~ 2.0
        this.floaters.forEach(floaterObj => {
            floaterObj.floater.setSizeMultiplier(this.sizeMultiplier);
        });
    }

    setTextSpacing(value)
    {
        this.numberSpacing = 0.4 * value / 100; // 0.2 * (value * 2) / 100
    }

    setImageOpacity(value)
    {
        this.imageOpacity = value / 100;
    }

    setShadowOpacity(value)
    {
        this.shadowOpacity = value / 100;
    }

    setShadowThickness(value)
    {
        this.shadowThickness = value;

        this.setupRawImages();
        this.floaters.forEach(floaterObj => {
            if (this.numberMode)
            {
                // 暂时不启用倒计时模式
            }
            else
            {
                const imgIndex = floaterObj.floater.getImageIndex();
                floaterObj.floater.updateImage(this.floaterRawImgs[11 + imgIndex], this.shadowImgs[11 + imgIndex]);
            }
        });
    }

    setShadowSoftness(value)
    {
        this.shadowSoftness = value;

        this.setupRawImages();
        this.floaters.forEach(floaterObj => {
            if (this.numberMode)
            {
                // 暂时不启用倒计时模式
            }
            else
            {
                const imgIndex = floaterObj.floater.getImageIndex();
                floaterObj.floater.updateImage(this.floaterRawImgs[11 + imgIndex], this.shadowImgs[11 + imgIndex]);
            }
        });
    }

    setLocalMoveSpeed(value)
    {
        this.localMoveSpeed = value;
    }

    setFollowMoveSpeed(value)
    {
        this.followMoveSpeed = value;
    }

    setRotateSpeed(value)
    {
        this.rotateSpeed = value;
    }
}