(function ($window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        musicList: [],
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
        },
        isMove: false,
        progressClick: function (callBack) {
            var $this = this; //此时此刻的this是progress
            //监听背景的点击
            this.$progressBar.click(function (event) { //这里是progressBar触发的，所                                               以this变成了progressBar
                //获取背景距离窗口默认的位置
                var normalLeft = $(this).offset().left;
                //获取点击的距离窗口默认的位置
                var eventLeft = event.pageX;
                //设置前景的宽度
                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft);
                //计算进度条的比例
                var value = (eventLeft - normalLeft) / $(this).width();
                callBack(value);
            });
        },
        progressMove: function (callBack) {
            var $this = this;
            //获取背景距离窗口默认的位置
            var normalLeft = this.$progressBar.offset().left;
            var barWidth = this.$progressBar.width();
            var eventLeft;
            var flag = -1;
            //1.监听鼠标的按下事件
            this.$progressDot.mousedown(function () {
                //2.监听鼠标的移动事件
                $(document).mousemove(function () {
                    //按下移动的时候：使isMove执行true 下方的setProgress不执行拖拽
                    $this.isMove = true;
                    flag = 1;
                    //获取点击的距离窗口默认的位置
                    eventLeft = event.pageX;
                    var offset = eventLeft - normalLeft;
                    if (offset >= 0 && offset <= barWidth) {
                        //设置前景的宽度
                        $this.$progressLine.css("width", offset);
                        $this.$progressDot.css("left", offset);
                    }

                });
            });

            //3.监听鼠标的抬起事件
            $(document).mouseup(function () {
                //抬起的时候：使isMove执行false 下方的setProgress继续执行移动
                if(flag===1){
                    $(document).off("mousemove");
                    $this.isMove = false;
                    //计算进度条的比例
                    var value = (eventLeft - normalLeft) / $this.$progressBar.width();
                    callBack(value);
                    flag = -1;
                }
                
            });
        },
        setProgress: function (value) {
            if (this.isMove) return;
            if (value < 0 || value > 100) return;
            this.$progressLine.css({
                width: value + "%"
            });
            this.$progressDot.css({
                left: value + "%"
            });
        },

    }
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);