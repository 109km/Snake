

/**
 *
 * @type {{CANVAS: {width: number, height: number}, SIZE: {length: number}}}
 */

var Config = {
    CANVAS: {
        width: 936,
        height: 507
    },
    SNAKE_MAX_LENGTH: 312,
    START_NUM : 4,
    SIZE: {
        length: 39
    },
    DIRECTION: {
        up: 0,
        right: 1,
        down: 2,
        left: 3
    },
    IMAGE: {
        filePath: 'pics/',
        filePrefix:'dot',
        fileType: '.png'
    },
    FPS : 1000,
    SECONDS_BETWEEN_FRAMES : 1 / this.FPS,
    RATE : 50 * this.SECONDS_BETWEEN_FRAMES
}


var canvas,
    context,
    dot = new Image(),
    dot_star = new Image(),
    food_status = true,
    food_dot = dot;

dot_star.src = Config.IMAGE.filePath + Config.IMAGE.filePrefix
    + '_star' + Config.IMAGE.fileType;

canvas = document.getElementById('canvas');
context = canvas.getContext('2d');

canvas.width = Config.CANVAS.width;
canvas.height = Config.CANVAS.height;


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

    Node.apply(this,[x, y]);

}

function checkFood(x,y){
    for (var i = 1; i < snake_body.length; i++)
    {
        if ( x === snake_body[i].x && y === snake_body[i].y)
        {

            return false;
        }
    }
    return true;
}

/**
 * @private
 * 绘制食物
 */
Food.prototype._draw = function(){


    if ( food_status ){

        var i = parseInt(Math.random() * 10);

        if ( i >= 9 ){
            food_dot = dot_star;
        }else{
            food_dot = dot;
        }

        food_status = false;

    }

    context.drawImage(food_dot,this.x, this.y);


};

/**
 * @constructor
 */

var snake_body = [];



function Snake() {
    this.body = [];

    this.food = this.createFood();
    this.direction = Config.DIRECTION.right;
    this.speed = 200;

    //event
    this.onEaten = null;
    this.onDie = null;
    this.onSuccess = null;
}

Snake.prototype.createFood = function(){

    var foodNode;

    while( true ){

        foodNode = new Food();

        if (checkFood(foodNode.x,foodNode.y)){
            return foodNode;
            break;
        }else{

            if ( snake_body.length == Config.SNAKE_MAX_LENGTH ){
                this.onSuccess();
                break;
            }
        }
    }


}
/**
 * 初始化snake
 */
Snake.prototype.init = function (bean_style) {
    var x = Config.SIZE.length * 10;
    var y = Config.SIZE.length * 10;

    var type = bean_style || '01';

    dot.src = Config.IMAGE.filePath + Config.IMAGE.filePrefix
        + type + Config.IMAGE.fileType;

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

        var isStar = false;
        if ( food_dot.src == dot_star.src ){
            isStar = true;
        }


        if(this.onEaten){
            this.onEaten.call(this,isStar);
        }
        food_status = true;

        snake_body.unshift(this.food);
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