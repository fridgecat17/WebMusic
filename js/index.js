$(function () {
    //0.自定义滚动条
    $(".cont_list").mCustomScrollbar();

    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voiceProgress;
    var viocevalue;
    var lyric;
    var lyricIndex;


    //1.加载歌曲列表  （定义一个方法） 
    /* 
    利用ajax 解决Chrome浏览器的跨域无法获取数据的问题：
    给浏览器传入启动参数（allow-file-access-from-files），允许跨域访问。 
    通过cmd控制台，输入
“C:\Program Files (x86)\Google\Chrome\Application\chrome.exe” –allow-file-access-from-files
    
    */
    getplayList();

    function getplayList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                player.musicList = data;
                //3.1遍历获取到的数据，创建每一条音乐
                var $musicList = $(".cont_list ul");
                $.each(data, function (index, ele) {
                    var $item = createMusicItem(index, ele);
                    $musicList.append($item);
                });
                //初始化歌曲信息
                initMusicInfo(data[0]);
                //初始化歌词信息
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }

    //1.1 初始化歌曲信息
    function initMusicInfo(music) {
        //获取对应的元素
        var $musicImage = $(".song_info_pic img");
        var $musicName = $(".song_info_name a");
        var $musicSinger = $(".song_info_singer a");
        var $musicAblum = $(".song_info_ablum a");
        var $musicPorgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        //给获取到的元素赋值
        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicPorgressName.text(music.name + "/" + music.singer);
        $musicProgressTime.text("/ " + music.time);
        $musicBg.css("background", "url('" + music.cover + "')");
    }

    //1.2初始化进度条
    initProgress();

    function initProgress() {
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");
        progress = Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        progress.progressMove(function (value) {
            player.musicSeekTo(value);
        });

        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");
        voiceProgress = Progress($voiceBar, $voiceLine, $voiceDot);
        voiceProgress.progressClick(function (value) {
            viocevalue = value;
            player.musicVoiceSeekTo(value);
        });
        voiceProgress.progressMove(function (value) {
            viocevalue = value;
            player.musicVoiceSeekTo(value);
        });
    }

    //1.3初始化歌词信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        //清空上一首音乐的歌词
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            //创建歌词列表
            $.each(lyric.lyrics, function (index, ele) {
                var $item = $("<li>" + ele + "</li>");
                $lyricContainer.append($item);
            });
        });
    }

    //2.初始化事件监听
    initEvents();

    function initEvents() {
        //1.监听歌曲的移入移出事件
        /* 利用事件委托，替新创建或者未来创建的新元素监听状态 */
        $(".cont_list").delegate(".list_music", "mouseenter", function () {
            // over
            /* 
                find()
                搜索所有与指定表达式匹配的元素。
                这个函数是找出正在处理的元素的后代元素的好方法。
            */
            //显示子菜单
            $(this).find(".list_menu").stop().fadeIn(100);
            //隐藏时长
            $(this).find(".list_time span").stop().fadeOut(100);
            //显示删除菜单
            $(this).find(".list_time a").stop().fadeIn(100);
            //修改当前li的透明度
            $(this).find("div").addClass("opc");
        });
        $(".cont_list").delegate(".list_music", "mouseleave", function () {
            // out
            //隐藏子菜单
            $(this).find(".list_menu").stop().fadeOut(100);
            //显示时长
            $(this).find(".list_time span").stop().fadeIn(100);
            //隐藏删除菜单
            $(this).find(".list_time a").stop().fadeOut(100);
            //修改当前li的透明度
            $(this).find("div").removeClass("opc");
        });

        //2.监听复选框的点击事件
        /* 利用事件委托，替新创建或者未来创建的新元素监听状态 */
        $(".cont_list").delegate(".list_check", "click", function () {
            $(this).toggleClass("list_checked");
        });

        //3.添加子菜单播放按钮的监听
        var $music_play = $(".music_play");
        $(".cont_list").delegate(".list_menu_play", "click", function () {
            var $item = $(this).parents(".list_music");
            /* console.log($item.get(0).index);
            console.log($item.get(0).music); */
            //3.1 切换播放的图标
            $(this).toggleClass("list_menu_play2");
            //3.2 复原其他的播放图标
            $item.siblings().find(".list_menu_play")
                .removeClass("list_menu_play2");
            //3.3将底部的播放图标同步
            if ($(this).attr("class").indexOf("list_menu_play2") != -1) {
                //当前子菜单的播放按钮是播放状态
                $music_play.addClass("music_play2");
            } else {
                //当前子菜单的播放按钮不是播放状态
                $music_play.removeClass("music_play2");
            }
            //3.4切换序号的状态
            $item.find(".list_number").toggleClass("list_number2");
            //复原其他序号的状态
            $item.siblings().find(".list_number").removeClass("list_number2");
            //3.5切换歌词信息
            if (player.currentIndex != $item.get(0).index) {
                initMusicLyric($item.get(0).music);
            }
            //3.6播放被点击的音乐
            player.playMusic($item.get(0).index, $item.get(0).music);
            //3.7切换歌曲信息
            initMusicInfo($item.get(0).music);
            //初始化结束时间
            $(".music_progress_time").text("/ " + $item.get(0).music.time);
            //初始化我的喜欢
            if($(".list_music").eq(player.currentIndex).hasClass("music_fav2")){
                $(".music_fav").addClass("music_fav2");
                $(".music_fav").attr("title","取消喜欢");
            }else{
                $(".music_fav").removeClass("music_fav2");
                $(".music_fav").attr("title","喜欢");
            }
        });

        //4.监听底部控制区域播放按钮的点击
        $music_play.click(function () {
            //判断有没有播放过音乐
            if (player.currentIndex == -1) {
                //没有播放过音乐
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            } else {
                //播放过音乐
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });
        //5.监听底部控制区域上一首按钮的点击
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });
        //6.监听底部控制区域下一首按钮的点击
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        //7.监听删除按钮的点击
        $(".cont_list").delegate(".list_menu_del", "click", function () {
            //找到被点击的音乐
            $item = $(this).parents(".list_music");

            //判断当前删除的是否是正在播放的
            if ($item.get(0).index == player.currentIndex) {
                $(".music_next").trigger("click");
            }

            $item.remove();
            player.changeMusic($item.get(0).index);

            //重新排序
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index + 1);
            });
        });

        //8.监听播放的进度
        player.musicTimeUpdate(function (currentTime, duration, timeStr) {
            //同步时间
            $(".music_progress_time_start").text(timeStr);
            //同步进度条
            //计算播放比例
            var value = currentTime / duration * 100;
            progress.setProgress(value);
            if (value == 100) {
                $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
            }

            //实现歌词同步
            var index = lyric.currentIndex(currentTime);
            lyricIndex = index;
            var $item = $(".song_lyric li").eq(index);
            $item.addClass("cur");
            $item.siblings().removeClass("cur");
            if (index <= 2) return;
            $(".song_lyric").css({
                transform: "translateY(" + (-index + 2) * 30 + "px" + ")"
            });
        });

        //9.监听声音按钮的点击
        $(".music_voice_icon").click(function () {
            //图标切换
            $(this).toggleClass("music_voice_icon2");
            //声音的切换
            if ($(this).attr("class").indexOf("music_voice_icon2") != -1) {
                //静音
                player.musicVoiceSeekTo(0);
            } else {
                //有声音
                player.musicVoiceSeekTo(viocevalue);
            }
        });

        //10.纯净按钮的监听
        $(".music_only").click(function () {  
            $(".music_only").toggleClass("music_only2");
            if($(".music_only").hasClass("music_only2")){
                $(".content_inl").css({
                    display:"none",
                });
                $(".content_inr").css({
                    width:"100%",
                    right:0
                });
                $(".music_only").attr("title","关闭纯净模式");
            }else{
                $(".content_inl").css({
                    display:"block",
                });
                $(".content_inr").css({
                    width: 500+"px",
                    right:-100+"px"
                });
                $(".music_only").attr("title","开启纯净模式");
            }
        });
        //11.喜欢按钮的监听
        $(".music_fav").click(function () {  
            $(".list_music").eq(player.currentIndex).toggleClass("music_fav2");
            if($(".list_music").eq(player.currentIndex).hasClass("music_fav2")){
                $(".music_fav").addClass("music_fav2");
                $(".music_fav").attr("title","取消喜欢");
            }else{
                $(".music_fav").removeClass("music_fav2");
                $(".music_fav").attr("title","喜欢");
            }
        });

        //12.模式按钮的监听
        var modeArr = ["music_mode1","music_mode2","music_mode3","music_mode4"];
        $("#mode").click(function () { 
            if($(this).attr("class").indexOf("1") > -1){
                $(this).attr("class",modeArr[1]);
                $(this).attr("title","顺序播放");
            }else if($(this).attr("class").indexOf("2") > -1){
                $(this).attr("class",modeArr[2]);
                $(this).attr("title","随机播放");
            }else if($(this).attr("class").indexOf("3") > -1){
                $(this).attr("class",modeArr[3]);
                $(this).attr("title","单曲循环");
            }else{
                $(this).attr("class",modeArr[0]);
                $(this).attr("title","列表循环");
            }
        });
    }

    /*
        方法：
     */
    //定义一个方法创建一条音乐
    function createMusicItem(index, music) {
        var $item = $("<li class=\"list_music\">\n" +
            "<div class=\"list_check\"><i></i></div>\n" +
            "<div class=\"list_number\">" + (index + 1) + "</div>\n" +
            "<div class=\"list_name\">" + music.name +
            "<div class=\"list_menu\">" +
            "<a href=\"javascript:;\" title=\"播放\" class='list_menu_play'></a>" +
            "<a href=\"javascript:;\" title=\"添加\"></a>" +
            "<a href=\"javascript:;\" title=\"下载\"></a>" +
            "<a href=\"javascript:;\" title=\"分享\"></a>" +
            "</div>" +
            "</div>" +
            "<div class=\"list_singer\">" + music.singer + "</div>" +
            "<div class=\"list_time\">" +
            "<span>" + music.time + "</span>" +
            "<a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>" +
            "</div>" +
            "</li>");
        $item.get(0).index = index;
        $item.get(0).music = music;
        return $item;
    }

});