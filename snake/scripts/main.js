

/**
 *
 * @type {{CANVAS: {width: number, height: number}, SIZE: {length: number}}}
 */

var Config = {
    CANVAS: {
        width: 980,
        height: 589
    },
    START_NUM : 4,
    SIZE: {
        length: 55
    },
    DIRECTION: {
        up: 0,
        right: 1,
        down: 2,
        left: 3
    },
    IMAGE: {
        src: 'pics/dot.jpg'
    },
    FPS : 1000,
    SECONDS_BETWEEN_FRAMES : 1 / this.FPS,
    RATE : 50 * this.SECONDS_BETWEEN_FRAMES
}


var canvas,
    context,
    dot = new Image();

canvas = document.getElementById('canvas');
context = canvas.getContext('2d');

canvas.width = Config.CANVAS.width;
canvas.height = Config.CANVAS.height;

dot.src = Config.IMAGE.src;

/**
 *
 * @param x
 * @param y
 * @constructor
 * 每个节点
 */
function Node(x, y) {
    this.length = Config.SIZE.length;
    this.x = x;
    this.y = y;
}

/**
 * @constructor
 * 食物
 */
function Food(){
    var stepX = Config.CANVAS.width / Config.SIZE.length - 1;
    var stepY = Config.CANVAS.height / Config.SIZE.length - 1;
    var x = Math.ceil(Math.random() * stepX) * Config.SIZE.length;
    var y = Math.ceil(Math.random() * stepY) * Config.SIZE.length;
    Node.apply(this,[x, y])
}

/**
 * @private
 * 绘制食物
 */
Food.prototype._draw = function(){
    context.drawImage(dot,this.x, this.y);
}

/**
 * @constructor
 */
function Snake() {
    this.body = [];
    this.food = new Food();
    this.direction = Config.DIRECTION.right;
    this.speed = 200;

    //event
    this.onEaten = null;
    this.onDie = null;
}

/**
 * 初始化snake
 */
Snake.prototype.init = function () {
    var x = Config.SIZE.length * 10;
    var y = Config.SIZE.length * 10;

    // 生成snake
    for (var i = 0; i < Config.START_NUM; i++) {
        this.body.push(new Node(x - Config.SIZE.length * i, y));
    }
    
    this._bind();
    this._draw();
};

/**
 * 绑定事件
 */
Snake.prototype._bind = function(){
    var _this = this;
    $(window).keydown(function(event){
        switch(event.keyCode) {
            case 38:
                if(_this.direction == Config.DIRECTION.down){
                    return;
                }
                _this.direction = Config.DIRECTION.up;
                break;
            case 39:
                if(_this.direction == Config.DIRECTION.left){
                    return;
                }
                _this.direction = Config.DIRECTION.right;
                break;
            case 40:
                if(_this.direction == Config.DIRECTION.up){
                    return;
                }
                _this.direction = Config.DIRECTION.down;
                break;
            case 37:
                if(_this.direction == Config.DIRECTION.right){
                    return;
                }
                _this.direction = Config.DIRECTION.left;
                break;
        }
    });
};

/**
 *
 * @private
 */
Snake.prototype._draw = function () {
    context.clearRect(0, 0, Config.CANVAS.width, Config.CANVAS.height);
    for (var i = 0; i < this.body.length; i++) {
        context.drawImage(dot,this.body[i].x, this.body[i].y);
    }
    this.food._draw();
};

/**
 *
 * @returns {boolean}
 */
Snake.prototype.isEatenFood = function(){
    return this.body[0].x === this.food.x && this.body[0].y === this.food.y;
};

/**
 *
 * @returns {boolean}
 */
Snake.prototype.isEatenMySelf = function(){
    for (var i = 1; i < this.body.length; i++)
    {
        if (this.body[0].x === this.body[i].x && this.body[0].y === this.body[i].y)
        {
            return true;
        }
    }
    return false;
};

Snake.prototype._onDie = function(){
    if(this.onDie){
        this.onDie.call(this);
    }
    this.stop();
}


/**
 * snake移动
 */
Snake.prototype._move = function () {

    // 是否咬到自己
    if(this.isEatenMySelf()){
        this._onDie();
        return;
    }

    // 吃到食物
    if(this.isEatenFood()){
        if(this.onEaten){
            this.onEaten.call(this);
        }

        this.body.unshift(this.food);
        this.food = new Food();
    }

    this.body.pop();
    var headX = this.body[0].x;
    var headY = this.body[0].y;

    // 判断方向
    switch (this.direction) {
        case Config.DIRECTION.up:
            if(headY <= 0)
            {
                headY = Config.CANVAS.height;
                this._onDie();
                return;
            }
            this.body.unshift(new Node(headX, headY - Config.SIZE.length));
            break;
        case Config.DIRECTION.right:
            if(headX >= Config.CANVAS.width - Config.SIZE.length){
                headX = -Config.SIZE.length;
                this._onDie();
                return;
            }
            this.body.unshift(new Node(headX + Config.SIZE.length, headY));
            break;
        case Config.DIRECTION.down:
            if(headY >= Config.CANVAS.height - Config.SIZE.length){
                headY = -Config.SIZE.length;
                this._onDie();
                return;
            }
            this.body.unshift(new Node(headX, headY + Config.SIZE.length));
            break;
        case Config.DIRECTION.left:
            if(headX <= 0){
                headX = Config.CANVAS.width;
                this._onDie();
                return;
            }
            this.body.unshift(new Node(headX - Config.SIZE.length, headY));
            break;
    }

    this._draw();
};

/**
 * 开始移动
 */
Snake.prototype.start = function(){
    var _this = this;
    var num = setInterval(function(){
        _this._move();
    },_this.speed);

    _this.starNum = num;

};


/**
 * 停止移动
 */
Snake.prototype.stop = function(){
    clearInterval(this.starNum);
};