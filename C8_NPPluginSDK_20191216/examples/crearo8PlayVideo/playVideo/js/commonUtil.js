// 获取URL上带的参数
function getUrlParameter(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){
                   // 双decodeURI解决中文乱码
                   return decodeURI(decodeURI(pair[1]));
                }
       }
       return "";
}