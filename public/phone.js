(function (doc, win) {
    var docEL = document.documentElement,
        resizeEvt = "orientationchange" in window ? "orientationchange" : "resize",
        recalc = function () {
            // 获取当前设备的宽度
            var clientWidth = docEL.clientWidth;
            if (!clientWidth) return;
            if (clientWidth >= 750) {
                //宽度大于750，根元素字体大小不能超过100px（不能大于设计稿的最大宽度）
                docEL.style.fontSize = "100px"; //设置根元素大小
            } else {
                docEL.style.fontSize = (clientWidth / 750) * 100 + "px";
            }
        };
    if (!doc.addEventListener) return;
    //添加窗口变动监听
    win.addEventListener(resizeEvt, recalc, false);
    //dom加载的时候执行一次
    doc.addEventListener("DOMContentLoaded", recalc, false);
})(document, window);
