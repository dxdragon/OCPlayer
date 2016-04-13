;(function($){
	'use strict';
	$.extend({
		cbRate : function(id){
			var self = $(id),dotype = self.attr("data-type"),read = true;
			if(self.length <= 0)return false;
            dotype = dotype || 'rate';
			self.on('click', 'li', function(){
			    var score = $(this).attr("data-score");
			    if(read != true) return false;
				$.ajax({
					async:true,
					type:"post",
					url:GV.DETAIL.POST_URL,
					data:{'op':dotype,'score':score,'sid':GV.DETAIL.SID,'csrf_token':GV.TOKEN},
					dataType:"json",
					beforeSend:function(){
						read = false;
						self.find(".load").html("<i class='loading16'></i>");
					},
					success:function(data, status){
						if(data.state == 'success'){
                            var l=0,w=0;
                            if(dotype == 'rate'){
                                self.find(".rating_down").html('');
                                self.find(".rating_up").html('');
                                if(data.result.average > 0){
                                    w = Math.abs(data.result.average*30);
                                    self.find(".rating_up").html('<ul><li class="average" style="width:'+w+'px !important" title="平均分" data-score="'+data.result.average+'"></li></ul>');
                                }else{
                                    w = Math.abs((data.result.average-1)*30);
                                    l = 180 - w;
                                    self.find(".rating_down").html('<ul><li class="average" style="left:'+l+'px;width:'+w+'px !important" title="平均分" data-score="'+data.result.average+'"></li></ul>');
                                }
                            }else{
                                var cls = '';
                                if(data.result.average > 0){
                                    l = 180;
                                    w = Math.abs(data.result.average*30);
                                    cls = 'average-r';
                                }else{
                                    w = Math.abs((data.result.average-1)*30);
                                    l = 180 - w;
                                    cls = 'average-l';
                                }
                                self.find(".rating_score").html('<ul><li class="'+cls+'" style="left:'+l+'px;width:'+w+'px !important" title="平均分" data-score="'+data.result.average+'"></li></ul>');
                            }
                            self.find(".rated > span").html("<em class='num'>"+data.result.average+"</em>(共"+data.result.count+" 次打分)");
                            $(".total_rated").fadeIn().find("em").html((parseFloat($("#total_score").html())+parseFloat(data.result.average)).toFixed(1));
						}
                        self.find(".load").hide();
					}
				});
			});
		},
		cbDig : function(id){
			var self = $(id),read = true;
			if(self.length <= 0)return false;
			self.parent().mouseover(function(){if($(this).hasClass("left_art_short")){$(this).removeClass("left_art_short")};$(this).unbind("mouseover")});
			self.on('click', function(){
				if(read != true) return false;
				$.ajax({
					async:true,
					type:"post",
					url:GV.DETAIL.POST_URL,
					data:{'op':'good','sid':GV.DETAIL.SID,'id':GV.USER.ID,'csrf_token':GV.TOKEN},
					dataType:"json",
					beforeSend:function(){
						read = false;
						self.find("em").html("<i class='loading16' style='padding-left:0px !important;'></i>");
					},
					success:function(data, status){
						if(data.state == 'success'){
							self.find(".good_label").html("已顶");
							self.find("em").html(data.result.good);
							if(data.result.stat == '0'){alert('您已用力的顶过了,明天再来吧')}
						}
						self.unbind();
					}
				});
			});
		},
		cbFav : function(id){
			var self = $(id),read = true;
			if(self.length <= 0)return false;
			self.on('click', function(){
				if(read != true) return false;
				$.ajax({
					async:true,
					type:"post",
					url:GV.DETAIL.POST_URL,
					data:{'op':'favorite','sid':GV.DETAIL.SID,'id':GV.USER.ID,'csrf_token':GV.TOKEN},
					dataType:"json",
					beforeSend:function(){
						read = false;
						self.find("em").html("<i class='loading16' style='padding-left:0px !important;'></i>");
					},
					success:function(data, status){
						//if(data.state == 'success'){
							self.find(".favorite_label").html("已收藏");
							self.find("em").html(data.result.count);
							if(data.result.stat == '0'){alert('您已经收藏过本篇资讯了')}
						//}
						self.unbind();
					}
				});
			});
		},
        refreshSeccode : function(id){
            $("#"+id).click();return false;
        },
		cbPublish : function(id){
			var self = $(id);
			if(self.length <= 0)return false;
            var ready = false,
                posted = true,
				pContent = self.find("textarea"),
				pBtn = self.find(".cb-post-button"),
				pTips = self.find(".cb-tip-error"),
				pEmote = self.find(".cb-add-emote"),
				pList = $("#J_commt_list"),
				pCode = self.find("input[name=seccode]"),
                seccode_obj = self.find("img.seccode"),
                tid = self.find("input[name=tid]").val(),
                seccode_id = 'seccode'+tid,
				pSubmit = function(){
                    if(!posted)return false;
					var wcontent = $.trim(pContent.val());
					wcontent = wcontent.replace(pContent.attr('placeholder'), "");
					var num = $.getLength(wcontent);
					if(num < 1 || num > 320){
                        pTips.html('<ins class="tips tips_icon_error">请输入评论内容</ins>');
                        ready = false;
                        return false;
					}
                    if($.cookie('cb_post') == wcontent){
                        pTips.html('<ins class="tips tips_icon_error">请勿评论重复内容</ins>');
                        ready = false;
                        return false;
                    }
                    var reg= /\[s:([^\][]*)\]/ig; //仅过滤[]符号
                    if(wcontent.replace(reg,'') == ''){
                        pTips.html('<ins class="tips tips_icon_error">您再写点什么吧</ins>');
                        ready = false;
                        return false;
                    }
					var wseccode = $.trim(pCode.val());
                    if(wseccode.length < 4){
                        pTips.html('<ins class="tips tips_icon_error">请填写验证码</ins>');
                        pCode.focus();
                        ready = false;
                        return false;
                    }else{
						ready = true;
					}

                    if(!ready)return false;
                    var post_sync=self.find("input[name=repost]:checked").val();
                    $.ajax({
                        async:true,
                        type:"post",
                        url:GV.DETAIL.POST_URL,
                        data:{'op':'publish','content':wcontent,'seccode':wseccode,'sid':GV.DETAIL.SID,'sync':post_sync,'pid':tid,'csrf_token':GV.TOKEN},
                        dataType:"json",
                        beforeSend:function(){
                            posted = false;
                            pTips.html('<ins><i class="loading16"></i>正在发送......</ins>');
                        },
                        success:function(data, status){
                            posted = true;
                            if(data.state == 'success'){
                                $.cookie('cb_post', wcontent, { expires: 0.002 });
                                if(data.message == 'comment_ok'){
                                    pTips.html('<ins class="tips tips_icon_success">感谢评论,编辑正在审核中</ins>');
                                    var ap_text = '<dl><dt><span class="re_username">匿名人士</span><span class="re_area"></span><span class="datetime">发表于 '+(new Date()).toLocaleTimeString()+'</span></dt><dd class="re_text">'+$.htmlspecialchars(wcontent)+'</dd><dd class="re_mark"><span></span></dd></dl>';
                                    pContent.val("");
                                    pCode.val("");
                                    pList.prepend(ap_text).parent().fadeIn();
                                    setTimeout(function(){$.refreshSeccode(seccode_id);},3000);
                                }else if(data.message == 'reply_ok'){
                                    pTips.html('<ins class="tips tips_icon_success">感谢回复,编辑正在审核中</ins>');
                                    var ap_text = '<div class="replied"><p class="title"><span class="re_username">匿名人士</span><span class="re_area"></span><span class="datetime"></span></p><p class="re_text">'+$.htmlspecialchars(wcontent)+'</p></div>';
                                    self.parent().prev().append(ap_text);
                                }
                                return false;
                            }
                            if(data.state == 'error'){
                                if(data.error_code){
                                    pTips.html('<ins class="tips tips_icon_error">'+data.error+'</ins>');
                                    if(data.error_code == '8'){
                                        $.refreshSeccode(seccode_id);
                                        pCode.val("").focus();
                                    }else if(data.error_code == '9'){
                                        posted = false;
                                    }
                                }
                                return false;
                            }
                        }
                    });
				};
            //重新定义id,并绑定
            seccode_obj.attr('id', seccode_id);
            $(document).on('click', '#'+seccode_id, function(){
                $.ajax({
                    url: "\/captcha.htm?refresh=1",
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        $('#'+seccode_id).attr('src', data['url']);
                        $('body').data('captcha.hash', [data['hash1'], data['hash2']]);
                    }
                });
                return false;
            });
            if(self.find(".cb-sync").is(":visible")) {
                self.find(".cb-sync").find("a[service-bind=1]").toggle(function(){
                    var repost = self.find("input[name=repost]"),sync = repost.val();
                    sync = sync ? sync.split(",") : [];
                    $(this).toggleClass('cb-service-icon');
                    $(this).toggleClass('cb-service-icon-grey');
                    if($.inArray($(this).attr("data-service"), sync) == '-1')
                        sync.push($(this).attr("data-service"));
                    repost.val(sync.join(","));repost.attr("checked",true);
                },function(){
                    var repost = self.find("input[name=repost]"),sync = repost.val();
                    sync = sync ? sync.split(",") : [];
                    $(this).toggleClass('cb-service-icon');
                    $(this).toggleClass('cb-service-icon-grey');
                    sync.splice($.inArray($(this).attr("data-service"), sync), 1);
                    sync = sync.join(",");
                    repost.val(sync);repost.attr("checked",sync != '');
                });
            }
            pCode.bind("focus",function(e){
                if(seccode_obj.attr('src') == ''){
					$.refreshSeccode(seccode_id);
                }
			});
			pContent.bind("focus",function(e){
                if(seccode_obj.attr('src') == ''){
					$.refreshSeccode(seccode_id);
                }
			}).bind("focus keyup input paste",function(e){
                var content = pContent.val();
                content = content.replace(pContent.attr('placeholder'), "");
                var num = $.getLength(content),
                    left = 320 - num;
                if(left>=0){
                    pTips.html("<ins>评论还可以输入<strong>"+left+"</strong>字</ins>");
                }else{
                    pTips.html("<ins class='tips tips_icon_error'>评论已超过<b>"+Math.abs(left)+"</b>字</ins>");
                }
			}).bind("blur",function(){
			}).trigger("keyup");
			pEmote.on('click', function(e){
				e.preventDefault();
				$.insertEmotions($(this), $($(this).data('emotiontarget')));
			});
			pBtn.click(function(){
				pSubmit();
			});
		},
        cmtOnload : function(id){
			var self = $(id),
				loadCmt = self.find(".load_cmt"),
				cmtList = self.find("#J_commt_list"),
				lastT = 0,
				more = self.find("#J_commt_more"),
                cmtPosted = [],
				genList = function(gened){
                    if(GV.COMMENTS.CLICKED == 0){//start click
                        GV.COMMENTS.CLICKED = 1;
                        var data = GV.COMMENTS.CMNTLIST,
                            offset = (GV.COMMENTS.MOREPAGE - 1)*GV.COMMENTS.MORENUM,
                            limit = ((offset + GV.COMMENTS.MORENUM) > data.length) ? data.length : (offset + GV.COMMENTS.MORENUM);
                        if(typeof data[offset] != 'undefined'){
                            for(var i = offset; i < limit; i++){
                                var tid = data[i].tid;
                                if($('#J_Comment_Item_'+GV.COMMENTS.CMNTSTORE[tid].tid).length > 0)continue;
                                if(typeof GV.COMMENTS.CMNTSTORE[tid] == 'undefined')continue;
                                if(typeof GV.COMMENTS.CMNTSTORE[tid].icon == 'undefined'){
                                    GV.COMMENTS.CMNTSTORE[tid].icon = '';
                                }
                                GV.COMMENTS.CMNTSTORE[tid].lou = GV.COMMENTS.SHOWNUM--;
                                if(!GV.COMMENTS.CMNTSTORE[tid].icon){
                                    GV.COMMENTS.CMNTSTORE[tid].icon = '/assets/default/images/anonymous.gif';
                                }
                                GV.COMMENTS.CMNTSTORE[tid].comment = $.wysiwyg(GV.COMMENTS.CMNTSTORE[tid].comment);
                                cmtList.append(CB.tmpl(cmt_tp, GV.COMMENTS.CMNTSTORE[tid]));
                                if(data[i].parent != ''){
                                    var dict = GV.COMMENTS.CMNTDICT;
                                    var quote_box = '#J_Comment_Quote_'+data[i].tid;
                                    for(var d = dict[data[i].tid].length - 1; d >= 0 ; d--){
                                        var dic = dict[data[i].tid];
                                        var dic_tid = dic[d].tid;
                                        if(typeof GV.COMMENTS.CMNTSTORE[dic_tid] != 'undefined'){
                                            GV.COMMENTS.CMNTSTORE[dic_tid].ptid = tid; // main parent tid
                                            GV.COMMENTS.CMNTSTORE[dic_tid].quote_num = d+1; // 排序
                                            GV.COMMENTS.CMNTSTORE[dic_tid].comment = $.wysiwyg(GV.COMMENTS.CMNTSTORE[dic_tid].comment);
                                            var quote = CB.tmpl(quote_tp, GV.COMMENTS.CMNTSTORE[dic_tid]);
                                            $(quote_box).prepend(quote);
                                            quote_box = '#J_Comment_Quote_'+tid+'_'+dic_tid;
                                        }
                                    }
                                }
                            }
                            self.fadeIn();
                            GV.COMMENTS.MOREPAGE++;
                            // 绑定事件
                            bindAction();
                        }else{
                            // get new
                            if(offset >= data.length && GV.COMMENTS.MORENUM <= data.length){
                                GV.COMMENTS.PAGE++;
                                if(cmtPosted[GV.COMMENTS.PAGE] == true){
                                    //return false;
                                }else{
                                    initData(GV.COMMENTS.PAGE);
                                }
                            }
                        }
                    }
                    GV.COMMENTS.CLICKED = 0;//end click
                    return true;
				},
				genHotList = function(){
					var len = GV.COMMENTS.HOTLIST.length, hot = '';
                    if(len > 0) {
                        for(var i=0;i<len;i++){
                            var tid = GV.COMMENTS.HOTLIST[i].tid, li_class = '';
                            if(len - i == 1){
                                li_class = 'style="border-bottom:0px"';
                            }
                            GV.COMMENTS.CMNTSTORE[tid].li_class = li_class;
                            GV.COMMENTS.CMNTSTORE[tid].date_show = GV.COMMENTS.CMNTSTORE[tid].date.substring(5);
                            hot += CB.tmpl(hot_tp, GV.COMMENTS.CMNTSTORE[tid]);
                        }
                        $("#J_hotcommt_list").show().html(hot).parent('section').fadeIn();
                    }else{
                        $("#J_hotcommt_list").parent('section').hide();
                    }
                    fixed_top = $("#fixed_area").offset().top;
				},
				initData = function(page){
                    if(GV.COMMENTS.POSTED == 0 && !cmtPosted[page]){
                        //GV.COMMENTS.POSTED = 1;//start get
                        $.ajax({
                            async: true,
                            type:"POST",
                            url:GV.DETAIL.POST_VIEW_URL,
                            dataType:"json",
                            cache:!0,
                            data:{'op':page+','+GV.DETAIL.SID+','+GV.DETAIL.SN},
                            beforeSend:function() {
                                GV.COMMENTS.POSTED = 1;//start get
                            },
                            success:function(data){
                                if(data.state == 'success'){
                                    if(typeof data.result == 'string'){
                                        var res = $.parseJSON(data.result);
                                    }else{
                                        var res = data.result;
                                    }
                                    cmtPosted[1] = true;
                                    GV.COMMENTS.CMNTDICT = res.cmntdict;
                                    GV.COMMENTS.CMNTLIST = res.cmntlist;
                                    GV.COMMENTS.CMNTSTORE = res.cmntstore;
                                    GV.COMMENTS.PAGE = res.page;
                                    if(parseInt(GV.COMMENTS.PAGE) == 1){
                                        // all num
                                        GV.COMMENTS.SHOWNUM = res.join_num;
                                        // set token
                                        GV.TOKEN = res.token;
                                        // show num
                                        if(res.comment_num != 'undefined'){
                                            $(".comment_num").html(res.comment_num);
                                            $("#view_num").html(res.view_num);
                                            $("#good_num").html(res.dig_num);
                                            if(res.dig_num > 0){$("#dig_btn").find("em").html(res.dig_num)};
                                            if(res.fav_num > 0){$("#favorite_btn").find("em").html(res.fav_num)};
                                            $(".post_count").html('共有<em>'+res.comment_num+'</em>条评论，显示<em>'+res.join_num+'</em>条').fadeIn();
                                        }
                                        GV.COMMENTS.HOTLIST = res.hotlist;
                                        genHotList();
                                        // init login
                                        if(typeof res.u.ID != 'undefined'){
                                            GV.USER = res.u;
                                            var login_obj = $("#top_reply_login");
                                            login_obj.find("span").html('<a title="'+GV.USER.NICK+'" href="/user/'+GV.USER.ID+'" target="_blank" class="userName">'+GV.USER.NICK+'</a>');
                                            login_obj.find("img").attr("src",GV.USER.ICON);
                                            login_obj.show();
                                            $("#top_reply_logout").hide();
											if($("#favorite_btn").length > 0){
												$("#favorite_btn").show();
											}
                                            // 开启微博同步
                                            if(GV.USER.TYPE != 'self') {
                                                switch(GV.USER.TYPE){
                                                    case 'qq':
                                                        $(".cb-sync").find(".cb-qqt").attr('service-bind', 1).show();
                                                        $(".cb-sync").find(".cb-qq").attr('service-bind', 1).show();
                                                        $(".cb-sync").show();
                                                        break;
                                                    case 'sina':
                                                        $(".cb-sync").find(".cb-sina").attr('service-bind', 1).show();
                                                        $(".cb-sync").show();
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if($(".cb-sync").is(":visible")) {
                                                    $(".cb-sync").find("a[service-bind=1]").toggle(function(){
                                                        var repost = $("input[name=repost]"),sync = repost.val();
                                                        sync = sync ? sync.split(",") : [];
                                                        $(this).toggleClass('cb-service-icon');
                                                        $(this).toggleClass('cb-service-icon-grey');
                                                        if($.inArray($(this).attr("data-service"), sync) == '-1')
                                                            sync.push($(this).attr("data-service"));
                                                        repost.val(sync.join(","));repost.attr("checked",true);
                                                    },function(){
                                                        var repost = $("input[name=repost]"),sync = repost.val();
                                                        sync = sync ? sync.split(",") : [];
                                                        $(this).toggleClass('cb-service-icon');
                                                        $(this).toggleClass('cb-service-icon-grey');
                                                        sync.splice($.inArray($(this).attr("data-service"), sync), 1);
                                                        sync = sync.join(",");
                                                        repost.val(sync);repost.attr("checked",sync != '');
                                                    });
                                                }
                                            }
                                            /* bind logout */
                                            if($('.quitLogin').length > 0) {
                                                $('.quitLogin').click(function(){
                                                    var from = $(this).attr('data-from');
                                                    $.getJSON('/user/logout?jsoncallback=?',{'type':'pop'},function(){
                                                        GV.USER.ID=0;
                                                        $("#top_reply_login").hide();$("#top_reply_logout").show();
                                                        if($("#favorite_btn").length > 0)$("#favorite_btn").hide();
                                                        $("#post_sync").addClass("none").find("input[name=post_sync]").attr("checked", false);
                                                    });
                                                });
                                            }
                                        }
                                    }
                                    if(res.cmntlist.length > 0) {
                                        GV.COMMENTS.POSTED = 0;//end get
                                        GV.COMMENTS.MOREPAGE = 1;// 内分页初始化
                                        genList(true);
                                        more.unbind("click");
                                        if(GV.COMMENTS.MORENUM > res.cmntlist.length){
                                            more.find("a").html("已到最后一页").fadeOut("slow");
                                        }else{
                                            more.bind("click",function(e){
                                                return genList(true);
                                            }).show();
                                        }
                                        return false;
                                    }
                                }
                                // fail final
                                $("#J_hotcommt_list").parent('section').hide();
                                GV.COMMENTS.MOREPAGE = -1;
                                more.unbind("click");
                                more.find("a").html("已到最后一页").fadeOut("slow");
                                return false;
                            },
                            error: function(){
                                //alert('fail');
                            }
                        });
                    }
				},
				bindAction = function(){
					$("a[action-type=reply]").unbind().click(function(e){
						var parent = $(this).parent(),tid = parent.attr("action-tid"),id = 'replybox'+tid,create=1;
                        $(".cb-reply-sub").each(function(){
                            if($(this).attr("id") == id)
                                create=0;
                            $(this).remove();
                        });
                        if(!create)
                            return;
                        parent.parent().append('<div id="'+id+'" class="cb-thread cb-reply-sub" style="margin-top:40px;background:#fff"><div class="cb-reset"><div class="cb-replybox">'+$("#cb-replybox").html()+'</div></div></div>');
                        var o = $("#"+id);
						o.find("textarea").attr("value","").attr("id","J_reply_textarea_"+tid);
						o.find(".cb-add-emote").attr("data-emotiontarget", "#J_reply_textarea_"+tid);
						o.find("input[name=tid]").val(tid);
						o.find("img.seccode").attr("src", "");
                        o.find(".cb-tip-error").html('');
                        $.cbPublish("#"+id);
					});
					$("a[action-type=support][supported=false]").unbind().on('click', function(e){
						var my = $(this);
						var parent = $(this).parent();
						var tid = parent.attr("action-tid");
						$.ajax({
							async:true,
							type:"post",
							url:GV.DETAIL.POST_URL,
							data:{'op':'support','sid':GV.DETAIL.SID,'tid':tid,'csrf_token':GV.TOKEN},
							dataType:"json",
							beforeSend:function(){
								my.unbind();
								var num = parseInt(my.find("em").html())+1;
								my.attr("class","disabled").html('<span>已支持(<em>'+num+'</em>)</span>');
								my.attr("supported","true");
								var tip = $('<div class="support_tip"></div>');
								tip.css({"left":(parseInt(my.position().left)+23)+'px'}).appendTo(parent.parent()).animate({top:'-25px'},"fast");
								setTimeout(function(){tip.animate({top:'0px',opacity:'0'},"slow");},1000);
							},
							success:function(data, status){
							}
						});
					});
					$("a[action-type=against][againsted=false]").unbind().on('click', function(e){
						var my = $(this);
						var parent = $(this).parent();
						var tid = parent.attr("action-tid");
						$.ajax({
							async:true,
							type:"post",
							url:GV.DETAIL.POST_URL,
							data:{'op':'against','sid':GV.DETAIL.SID,'tid':tid,'csrf_token':GV.TOKEN},
							dataType:"json",
							beforeSend:function(){
								my.unbind();
								var num = parseInt(my.find("em").html())+1;
								my.attr("class","disabled").html('<span>已反对(<em>'+num+'</em>)</span>');
								my.attr("againsted","true");
								var tip = $('<div class="against_tip"></div>');
								tip.css({"left":(parseInt(my.position().left)+23)+'px'}).appendTo(parent.parent()).animate({top:'-25px'},"fast");
								setTimeout(function(){tip.animate({top:'0px',opacity:'0'},"slow");},1000);
							},
							success:function(data, status){
							}
						});
					});
					$("a[action-type=report][reported=false]").unbind().on('click', function(e){
						var my = $(this);
						var parent = $(this).parent();
						var tid = parent.attr("action-tid");
						$.ajax({
							async:true,
							type:"post",
							url:GV.DETAIL.POST_URL,
							data:{'op':'report','sid':GV.DETAIL.SID,'tid':tid,'csrf_token':GV.TOKEN},
							dataType:"json",
							beforeSend:function(){
								my.unbind();
								my.attr("class","disabled").html('<span>已举报</span>');
								my.attr("reported","true");
							},
							success:function(data, status){
							}
						});
					});
					$("a[action-type=share]").unbind().on('mouseover', function(e){
						var my = $(this),
                            share = $('#popshare'),
						    tid = my.parent().attr("action-tid");
                        if(share.length == 0){
                            $('body').append(share_tp);
                            $('#popshare').css({'display':'block','left':my.offset().left,'top':my.offset().top+17});
                            $('#popshare').on('mouseleave', function(e){$(this).hide()});
                            $('#popshare').attr('data-tid', tid);
                        }else{
                            share.css({'display':'block','left':my.offset().left,'top':my.offset().top+17});
                            $('#popshare').attr('data-tid', tid);
                        }
					});
					$("html").on("click", function() {
						if($('#popshare').length > 0){$('#popshare').hide();}
					});
				};
			initData(1);
        },
        //插入表情框
        insertEmotions : function(elem, input, wrap){
            //显示当前页
            function emotionsShowPage(index, i){
                var data = GV.EMOTION.EMO_DATA[i]['emotion'];
                var len = (index*GV.EMOTION.PAGE_SIZE > data.length ? data.length : index*GV.EMOTION.PAGE_SIZE), arr = [];
                for(var i = (index-1)*GV.EMOTION.PAGE_SIZE; i <= len - 1; i++) {
                    arr.push('<li><a href="#" class="J_emotions_item" data-sign="'+ data[i].sign +'"><img title="'+data[i].sign+'" src="'+data[i].url+'"></a></li>');
                }
                return arr.join('');
            }
            //图片src写入
            function emotionsShowImg(wrap){
                var imgs = wrap.find('img');
                if(imgs.data('src')) {
                    imgs.attr('src', function () {
                        return $(this).data('src');
                        }).data('src', '');
                }
            }
            //表情弹窗定位
            function emotionsPos(elem, pop, wrap){
                if(wrap) {
                    //容器内计算边距
                    pop.css({
                        left : elem.offset().left - wrap.offset().left - 30,
                        top : elem.offset().top - wrap.offset().top + elem.height() + 5
                    }).show();;
                }else{
                    pop.css({
                        left : elem.offset().left - 5,
                        top : elem.offset().top + elem.outerHeight() + 15
                    }).show();;
                }
            }
	        var emotions_pop = $('#J_emotions_pop');
            if(emotions_pop.length) {
                if(wrap) {
                    emotions_pop.appendTo(wrap);//移入容器里,定位由页面写
                }else{
                    emotions_pop.appendTo('body');//移入body里
                }
                emotionsPos(elem, emotions_pop, wrap);
            }else{
                if(wrap) {
                    wrap.append(emotions_pop_tp);
                }else{
                    $('body').append(emotions_pop_tp);
                }
                var emotions_pop = $('#J_emotions_pop'), emotions_menu = $('#J_emotions_menu'), emotions_pl = $('#J_emotions_pl');
                //定位
                emotionsPos(elem, emotions_pop, wrap);
                if(!GV.EMOTION.EMO_DATA){
                    $.getJSON(GV.DETAIL.EMOTION_URL, function(data){
                        if(data.state == 'success') {
                            GV.EMOTION.EMO_DATA = data.result;
                        }else if(data.state == 'error'){
                            //nothing
                        }
                    });
                }
                try{
                    if(typeof GV.EMOTION.EMO_DATA == 'object'){
                        var nav_arr = [], index = 0;
                        emotions_pl.html('');
                        //循环读取菜单和表情
                        $.each(GV.EMOTION.EMO_DATA,function(i, o){
                            index++;
                            nav_arr.push('<li class="'+ (index === 1 ? 'current' : '') +'"><a href="">'+ o.category +'</a></li>');
                            var emotion_arr = [], page_count = Math.ceil(o['emotion'].length/GV.EMOTION.PAGE_SIZE);
                            $.each(o.emotion, function(i, o){
                                emotion_arr.push('<li><a href="#" class="J_emotions_item" data-sign="'+ o.sign +'"><img title="'+o.sign+'" '+ (index === 1 ? 'src=\"'+o.url+'\"' : 'data-src=\"'+o.url+'\"') +'></a></li>');
                            });
                            //翻页写入
                            if(page_count > 1) {
                                emotions_pl.append('<div style="'+ (index === 1 ? '' : 'display:none') +'"><ul class="cc">'+ emotionsShowPage( 1, i) +'</ul></div>');
                                var page = [];
                                for(var j = 1; j <= page_count; j++) {
                                    page.push('<a href="javascript:;" class="'+ ( j===1 ? 'current':'' ) +' J_emotions_page" data-index="'+ i +'">'+ j +'</a>');
                                }
                                emotions_pl.children('div').eq(i).append('<div class="show_page J_emo_page">'+ page.join('') +'</div>');
                            }else{
                                //表情写入
                                emotions_pl.append('<div style="'+ (index === 1 ? '' : 'display:none') +'"><ul class="cc">'+ emotion_arr.join('') +'</ul></div>');
                            }
                        });
                        //点击页码
                        $('.J_emo_page').on('click', 'a.J_emotions_page', function(e){
                            e.preventDefault();
                            var $this = $(this);
                            $this.parent().prev('ul').html(emotionsShowPage( parseInt(this.innerHTML), $this.data('index')));
                            $this.addClass('current').siblings().removeClass('current');
                        });
                        //菜单写入
                        emotions_menu.prepend('<div class="hd"><ul class="cc">'+ nav_arr.join('') +'</ul></div>');
                        //点击菜单
                        emotions_menu.on('click', 'a', function(e){
                            e.preventDefault();
                            var container = emotions_pl.children().eq($(this).parent().index());
                            $(this).parent().addClass('current').siblings().removeClass('current');
                            container.show().siblings().hide();
                            emotionsShowImg(container);
                        });
                        //关闭
                        $('#J_emotions_close').on('click', function(e){
                            e.preventDefault();
                            emotions_pop.hide();
                        });
                    }
                }catch(e) {
                    //nothing
                }
            }
            //点击表情
            $('#J_emotions_pl').off('click').on('click', 'a.J_emotions_item', function(e){
                e.preventDefault();
                input.insertContent(this.getAttribute('data-sign'));
                $('#J_emotions_pop').hide();
            });
            //显示大图
            $('#J_emotions_pl img').off('mouseenter').on('mouseenter', function(e){
                var preview = $("#J_emotion_preview"),offset = $(this).offset();
                if(preview.length == 0) {
                    $("body").append("<p id='J_emotion_preview' style='display:none;border:1px solid #ccc;background:#fff;padding:5px;text-align:center'><img src='"+ this.src +"' /><span>"+(this.title?'<br />'+this.title:'')+"</span></p>");
                    preview = $("#J_emotion_preview");
                }else{
                    preview.find("img").attr("src", this.src);
                    preview.find("span").html(this.title?'<br />'+this.title:'');
                }
                preview.css({"top":(offset.top + 30) + "px","left":(offset.left + 30) + "px","position":"absolute","z-index":"12"}).fadeIn("fast");
            });
            $('#J_emotions_pl img').off('mouseleave').on('mouseleave', function(e){
                $("#J_emotion_preview").remove();
            });
        },
		wysiwyg : function(html) {
            if(html.indexOf("<img class") > -1)
                return html;
			//var reg = /\[s:(\d{1,3})\]/ig;
			var reg= /\[s:([^\][]*)\]/ig; //仅过滤[]符号

			//把表情相关的bbcode变为图片
			function showEmotions() {
				if(!GV.EMOTION.EMO_DATA) { return; }
				var index = 0,allEmotionsArr = [];
				//把多个分里的表情放在一个数组里来，以便通过bbcode查找它的图片链接地址
				$.each(GV.EMOTION.EMO_DATA,function(key,obj) {
					if(obj)
					    allEmotionsArr = allEmotionsArr.concat(obj.emotion);
				});
				//替换ubb到图片
				if(!reg.test(html)) {
					return html;
				}
				html = html.replace(reg,function(all, $1) {
                    if(index > GV.EMOTION.SHOW_SIZE-1)
                        return all;
					var bbcode = '[s:'+ $1 +']';
					var result;
					$.each(allEmotionsArr,function(id,emotion) {
						if(emotion['sign'] === bbcode) {
							result =  '<img class="J_emotion" src="'+ emotion.url +'" alt="'+ emotion.name +'" data-bbcode="'+ $1 +'" />';
                            index++;
						}
					});
					return result ? result : all;
				});
				return html;
			}
			//如果数据没有加载进来，则加载，否则直接渲染
            if(GV.EMOTION.EMO_DATA){
				return showEmotions();
            }else{
                $.getJSON(GV.DETAIL.EMOTION_URL, function(data){
                    if(data.state == 'success') {
                        GV.EMOTION.EMO_DATA = data.result;
					    return showEmotions();
                    }
                    return '';
                });
            }
		}
	});
	// bind click
    $.cbRate("#rating_box");
    $.cbRate("#scoring_box");
    $.cbDig("#good_btn");
    $.cbFav("#favorite_btn");

	if($("#fixed_area").length > 0){
		fixed_top = $("#fixed_area").offset().top;
		$(window).scroll(function(){
			var scrolla=$(window).scrollTop();
			var dis=parseInt(fixed_top)-parseInt( scrolla);
			if(dis<=0)$("#fixed_body").removeClass().addClass("fixed_right");
			if(dis>0)$("#fixed_body").removeClass("fixed_right");

			var o = $('#J_commt_more');
			if(o!=null ){
				var bottom = o.offset().top + o.outerHeight(),
					scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0,
					windowHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
				if (scrollTop >= bottom - windowHeight && GV.COMMENTS.POSTED == 0 && GV.COMMENTS.MOREPAGE > 0 && GV.COMMENTS.CLICKED == 0) {
					o.click();
				}
			}
		});
	}
})(jQuery);
