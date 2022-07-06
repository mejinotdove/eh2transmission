// ==UserScript==
// @name        eh2qBittorrent
// @namespace   takahashi
// @include     *://exhentai.org/*
// @require     https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @connect     *
// @version     1.3
// @author      takahashi
// @description 2022/7/5 下午2:56:34
// ==/UserScript==

(function() {
  'use strict';
  
  unsafeWindow.sendDownload = function(btn) {    
    var torrent_url = $(btn).siblings('a').attr('href');
      
    // 下载种子文件
    GM_xmlhttpRequest({
      method: 'GET',
      url: torrent_url,
      responseType:"blob",
      onload: function(r) {
        var now = new Date();
        var torrentBlob = r.response;
        var formData = new FormData();
        formData.append("torrents", torrentBlob, "test.torrent");
        formData.append("category", "EH_" + now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate());
                
        // 发送添加种子请求
        GM_xmlhttpRequest({
          method: "POST",
          responseType: "text",
          url: GM_getValue('APIURL') + '/api/v2/torrents/add',
          headers: {
            "Origin": GM_getValue('APIURL')
          },
          data: formData,
          onload: function(response){
            if (response.status == 200) {
              console.log('请求', response);
              $(btn).parent().append('添加成功');
            } else {
              alert('添加失败!\nstatus code: ' + response.status + '\n详情: ' + response.response);
            }
          },
          onerror: function(response){
            console.log("请求失败", response);
            alert('添加失败!', response);
          }
        });    
    }});
    
  };
  
  $('#torrentinfo > div:nth-child(1) > form > div > table > tbody > tr:nth-child(3) > td > a').parent().append('<input type="button" value="下载" id="download" onclick="sendDownload(this)"/>');
})();
