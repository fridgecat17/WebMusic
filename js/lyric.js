(function ($window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }
    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times: [],
        lyrics: [],
        index: -1,
        lineNo:0,
        C_pos:3,
        loadLyric: function (callBack) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    $this.parseLyric(data);
                    callBack();
                },
                error: function (e) {
                    console.log(e);
                }
            });
        },
        //面向对象， 一个方法只做一件事情 方便以后维护
        parseLyric: function (data) {
            var $this = this;
            //一定要清空上一段的歌词和时间
            $this.times = [];
            $this.lyrics = [];
            var array = data.split("\n");
            //[00:23.59]
            var timeReg = /\[(\d*:\d*\.\d*)\]/
            //遍历取出每一条歌词
            $.each(array, function (index, ele) {
                //处理歌词
                var lrc = ele.split("]")[1];
                //排除空字符串（没有歌词的）
                if (lrc.length == 0) return true;
                $this.lyrics.push(lrc);

                var res = timeReg.exec(ele);
                if (res == null) return true;
                var timeStr = res[1];
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min + sec).toFixed(2));
                $this.times.push(time);
            });

        },
        currentIndex: function (currentTime) {
            if (currentTime > this.times[this.index + 1]) {
                this.index++;
            }
            if (currentTime < this.times[this.index]) {
                this.index--;
            }
            return this.index;
        },

    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);