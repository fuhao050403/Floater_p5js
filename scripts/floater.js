class Floater
{
    constructor()
    {
        this.img;
        this.shadow;

        this.imgWidth;
        this.imgHeight;
        this.sizeMultiplier = 1;

        this.imgIndex;

        this.pos = createVector(random(0, width), random(0, height));
        this.dirToEye = createVector(random(-1, 1), random(-1, 1));
        this.TargetPos = p5.Vector.copy(this.pos);
        this.eyeTargetPos = p5.Vector.copy(this.pos);
        this.localOffset = createVector(0, 0);
        this.localDir = p5.Vector.random2D();
        this.moveSpeed = 0;
        this.offsetSpeed = 0;

        this.rotateAngle = random(0, 180);
        this.rotateOffset = 0;
    }

    show(sizeMultiplier, imgOpacity, shadowOpacity)
    {
        push();

        // 设置图像中心点
        imageMode(CENTER);

        // 调整图像的位置与旋转
        translate(this.pos.x, this.pos.y);
        rotate(this.rotateAngle);
        scale(sizeMultiplier);

        // 调整图像透明度,并渲染图像
        tint(255, shadowOpacity * 255);
        image(this.shadow, 0, 0);
        tint(255, imgOpacity * 255);
        image(this.img, 0, 0);

        scale(1);
        pop();
    }

    updateImage(floaterImg, shadowImg)
    {
        this.img = floaterImg;
        this.shadow = shadowImg;

        this.imgWidth = shadowImg.width;
        this.imgHeight = shadowImg.height;
    }

    update(deltaTime, eyeDir, localSpeedMultiplier, followSpeedMultiplier, rotateMultiplier)
    {
        /* ---------- 位置 ---------- */
        // 检查当前位置是否在屏幕外
        this.checkOffScreen();

        // 更新需要到达的目标位置
        this.eyeTargetPos.add(eyeDir);
        this.updateLocalOffset(deltaTime, localSpeedMultiplier);
        this.TargetPos = p5.Vector.add(this.eyeTargetPos, this.localOffset);
        // 计算当前位置到眼球目标位置的距离
        const dist = p5.Vector.dist(this.pos, this.TargetPos);
        // 将距离映射到[0,1]的范围
        const distPercent = dist > 500 ? 0: 1 - (dist / 500);
        // 带入方程计算加速度p
        // 根据easeOutCubic的方程[1 - (1 - x)^3]对x求一阶导数
        // 得加速度方程[3 * (1 - x)^2], 根据需要调整倍数
        this.moveSpeed = 10 * 3 * Math.pow(1 - distPercent, 2) * (followSpeedMultiplier / 20);
        // 计算朝向眼睛位置的位移向量
        this.dirToTarget = p5.Vector.sub(this.TargetPos, this.pos).normalize().mult(this.moveSpeed);

        // 更新最新的显示位置
        this.pos.add(this.dirToTarget);

        /* ---------- 旋转 ---------- */
        this.updateRotation(deltaTime, rotateMultiplier);
    }

    checkOffScreen()
    {
        // 左
        if (this.pos.x <= -this.imgWidth / 2 * this.sizeMultiplier)
        {
            this.pos.x = windowWidth + this.imgWidth / 2 * this.sizeMultiplier - 1;
            this.localOffset.x += windowWidth + this.imgWidth * this.sizeMultiplier - 1;
        }
        // 右
        else if (this.pos.x >= windowWidth + this.imgWidth / 2 * this.sizeMultiplier)
        {
            this.pos.x = -this.imgWidth / 2 * this.sizeMultiplier + 1;
            this.localOffset.x -= windowWidth + this.imgWidth * this.sizeMultiplier - 1;
        }
        // 上
        else if (this.pos.y <= -this.imgHeight / 2 * this.sizeMultiplier)
        {
            this.pos.y = windowHeight + this.imgHeight / 2 * this.sizeMultiplier - 1;
            this.localOffset.y += windowHeight + this.imgHeight * this.sizeMultiplier - 1;
        }
        // 下
        else if (this.pos.y >= windowHeight + this.imgHeight / 2 * this.sizeMultiplier)
        {
            this.pos.y = -this.imgHeight / 2 * this.sizeMultiplier + 1;
            this.localOffset.y -= windowHeight + this.imgHeight * this.sizeMultiplier - 1;
        }
    }

    updateLocalOffset(deltaTime, speedMultiplier)
    {
        // 随机调整offset方向
        const chance = random(100);
        let rotateAngle = 0;
        if (70 <= chance && chance <= 90)
        {
            rotateAngle = (Math.random() - 0.5) * Math.PI / 18;
        }
        else if (chance > 90)
        {
            rotateAngle = (Math.random() - 0.5) * Math.PI / 9;
        }
        this.localDir.rotate(rotateAngle);

        // 根据随机的方向计算offset
        this.offsetSpeed = (speedMultiplier - Math.min(this.moveSpeed, speedMultiplier)) * deltaTime / 200;
        this.localOffset.add(p5.Vector.mult(this.localDir, this.offsetSpeed));
    }

    updateRotation(deltaTime, rotateSpeed)
    {
        const chance = random(1000);

        // 如果rotateOffset为0,则初始化为顺时针或逆时针转动 (概率对半)
        if (this.rotateOffset == 0)
        {
            this.rotateOffset = chance < 500 ? rotateSpeed : -rotateSpeed;
        }
        else // 旋转进行中
        {
            // 约20%的概率对旋转角进行微调
            if (chance >= 800 && chance <= 998)
            {
                this.rotateOffset += (Math.random() - 0.5) * rotateSpeed / 2;
            }
            // 约千分之2的概率逆向旋转方向
            else if (chance > 998)
            {
                this.rotateOffset *= -1;
            }
        }
        // 如果离平均旋转率过远,则需要主动调整误差
        // rotateOffset的范围为: -1.5倍rotateSpeed ~ 1.5倍rotateSpeed
        // 例: rotateSpeed设置为5,则rotateOffset不会低于-7.5且不会大于7.5
        const diffOffset = this.rotateOffset < 0 ? -rotateSpeed - this.rotateOffset : rotateSpeed - this.rotateOffset;
        this.rotateOffset += diffOffset / 10;
        this.rotateOffset = this.clamp(this.rotateOffset, -rotateSpeed * 1.5, rotateSpeed * 1.5);
        
        // 更新旋转角度
        this.rotateAngle += this.rotateOffset * deltaTime / 25000;
    }

    rotateVector(inVector, angle)
    {
        const x = inVector.x * Math.cos(angle) - inVector.y * Math.sin(angle);
        const y = inVector.x * Math.sin(angle) + inVector.y * Math.cos(angle);
        return p5.Vector(x, y);
    }

    clamp(num, min, max)
    {
        return Math.min(Math.max(num, min), max);
    }

    // 设置器
    setSizeMultiplier(value)
    {
        this.sizeMultiplier = value;
    }

    setImageIndex(newIndex)
    {
        this.imgIndex = newIndex;
    }

    // 获取器
    getImageIndex()
    {
        return this.imgIndex;
    }
}