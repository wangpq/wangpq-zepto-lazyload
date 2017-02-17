!(function(){
    window.requestAnimationFrame=(function(){
      return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {setTimeout(callback, 1000 / 60);}
    }());
    var cntr = 0
    var lastCntr = 0
    var diff = 0

    var lastPos = document.body.getBoundingClientRect().top
    var lastSpeeds = []
    var aveSpeed = 0
    function getSpeed(){
        var curPos = document.body.getBoundingClientRect().top
        var speed = lastPos - curPos
        if(lastSpeeds.length<10){
            lastSpeeds.push(speed)
        }else{
            lastSpeeds.shift()
            lastSpeeds.push(speed)
        }
        var sumSpeed = 0
        lastSpeeds.forEach(function(speed){
            sumSpeed += speed
        })
        aveSpeed = Math.abs(sumSpeed/lastSpeeds.length)
        lastPos = curPos
    }

    function enterFrame(){
        if(cntr != lastCntr){
            diff++
            if(diff == 5){
                var e = document.createEvent('HTMLEvents');
                e.initEvent('scrollEnd',true,false);
                window.dispatchEvent(e);
                cntr = lastCntr
            }
        }
        requestAnimationFrame(enterFrame);
    }
    window.requestAnimationFrame(enterFrame)
    window.addEventListener('scroll',function(){
        getSpeed()
        lastCntr = cntr
        diff = 0
        cntr++
    })
    judgeHidden = function(el){
        if($(el).is(':hidden')){
            return true
        }else if($(el).parents().is(':hidden')){
            return true
        }else{
            return false
        }
    }
    $.fn.lazyload = function(){
        if(this.length==0)return false
        var $els = this
        $els.each(function(idx,el){
            if(judgeHidden(el)){
                return
            }
            el.style.opacity = 0
            var compute = function(){
                var rect = el.getBoundingClientRect();
                if(rect.bottom>=0 && rect.top <= window.screen.height){
                    el.src = imgUrl
                    el.addEventListener('load',onloadEnd)
                    window.removeEventListener('scrollEnd',compute)
                    window.removeEventListener('scroll',computeBySpeed)
                    lastSpeeds = []
                }
            }
            var computeBySpeed = function(){
                if(aveSpeed>10)return
                compute();
            }
            var onload = function(){
                compute();
                el.removeEventListener('load',onload)
                window.addEventListener('scrollEnd',compute)
                window.addEventListener('scroll',computeBySpeed)
            }
            var onloadEnd = function(){
                el.style.opacity = 1;
                el.style.transition = 'opacity .3s'
                el.style.webkitTransition = 'opacity .3s'
                el.removeEventListener('load',onloadEnd)
            }
                               
            var imgUrl = $(el).data('lazyload')
            //这段用来解析分辨率匹配的规则
            if($.lazyload && $.lazyload.apapterList){
                $.lazyload.apapterList.forEach(function(adapter,idx){
                    //适配器是否匹配
                    if(adapter.id == $(el).data('lazyload-adapter')){
                        var rule = adapter.rule
                        //适配器匹配分辨率和范围
                        adapter.matches.forEach(function(match){
                            var clientWidth = document.documentElement.clientWidth
                            if(clientWidth > match.range.start && clientWidth <= match.range.end){
                                //根据规则替换
                                if(rule.regex.test(imgUrl)){
                                    $(el).data('lazyload-adapter','null')
                                    var repStr = imgUrl.match(rule.regex)[0]
                                    var tempStr = repStr.replace(RegExp[rule.pos],rule.prefix ? rule.prefix+match.resolution : match.resolution)
                                    imgUrl = imgUrl.replace(repStr,tempStr)
                                }
                            }
                        })
                    }
                })    
            }
            $(el).removeAttr('data-lazyload')
            if(el.src == imgUrl){
                el.style.opacity = 1
                return false
            }

            if(!el.src){
                el.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            }else{
                onload();
            }
            el.addEventListener('load',onload)
        })
    }
    $(function(){
        setInterval(function(){
            $('[data-lazyload]').lazyload()
        },500)
    });
})();
