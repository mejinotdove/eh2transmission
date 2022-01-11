// ==UserScript==
// @name        eh2transmission 
// @namespace   takahashi
// @include     *://exhentai.org/*
// @require     https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @connect     *
// @version     1.0
// @author      takahashi
// @description 2022/1/10 下午2:56:34
// ==/UserScript==

(function() {
  'use strict';
  
  unsafeWindow.sendDownload = function(btn) {    
    var torrent_url = $(btn).siblings('a').attr('href');
    
    // 下载种子文件
    GM_xmlhttpRequest({
      method: 'GET',
      url: torrent_url,
      responseType:"arraybuffer",
      onload: function(r) {
        // 把种子编码成base64格式
        var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(r.response)));
        
        // 发送添加种子请求
        GM_xmlhttpRequest({
          method: "POST",
          url: GM_getValue('RPC_ADDR'),
          responseType: "json",
          headers: {
            "Content-Type": "application/json",
            "Authorization": GM_getValue('RPC_AUTH'),
            "X-Transmission-Session-Id": GM_getValue('SESSIONID')
          },
          data:'{"method":"torrent-add","arguments":{"metainfo":"' + base64String +'"}}',
          onload: function(response){
            // 如果X-Transmission-Session-Id失效，则更新缓存
            if (response.status == 409) {
              var new_session = response.responseHeaders.match(/X-Transmission-Session-Id: (\w+)/)[1];
              GM_setValue('SESSIONID', new_session);
              console.log('更新X-Transmission-Session-Id: ' + new_session);
              
              // 重新请求
              GM_xmlhttpRequest({
                method: "POST",
                url: GM_getValue('RPC_ADDR'),
                responseType: "json",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": GM_getValue('RPC_AUTH'),
                  "X-Transmission-Session-Id": GM_getValue('SESSIONID')
                },
                data:'{"method":"torrent-add","arguments":{"metainfo":"' + base64String +'"},"tag":123}',
                onload: function(response){
                  console.log('请求', response.response);
                  if (response.response['result'] == 'success') {
                    alert('请求成功: ' + response.response['arguments']['torrent-added']['id'] + ' ' + response.response['arguments']['torrent-added']['name']);
                  } else {
                    alert('请求失败', response);
                  }
                }
              });
              } else {
              console.log('请求', response.response);
              if (response.response['result'] == 'success') {
                alert('请求成功: ' + response.response['arguments']['torrent-added']['id'] + ' ' + response.response['arguments']['torrent-added']['name']);
              } else {
                alert('请求失败', response);
              }
            }
          },
          onerror: function(response){
            console.log("请求失败", response);
          }
        });    
    }});
    
  };
  
  $('#torrentinfo > div:nth-child(1) > form > div > table > tbody > tr:nth-child(3) > td > a').parent().append('<input type="button" value="下载" id="download" onclick="sendDownload(this)"/>');
})();
