function initialize(){var a=[{featureType:"landscape",stylers:[{color:"#c4d0a4"}]},{featureType:"road.highway.controlled_access",stylers:[{color:"#ffffe4"}]},{featureType:"road.local",stylers:[{color:"#ddffe2"}]},{featureType:"road.arterial",stylers:[{color:"#ffc980"},{saturation:-21},{hue:"#ffee00"}]},{featureType:"administrative",stylers:[{weight:.1},{hue:"#ff0008"},{color:"#ff5a54"}]}],b={center:new google.maps.LatLng(41.5839,-93.6289),zoom:14,disableDefaultUI:!0,VisualRefresh:!0,draggable:!1,scrollwheel:!1,styles:a,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("map-canvas"),b)}function setMarkers(a){$(a).each(function(a,b){var c=new google.maps.LatLng(b.data.location.lat,b.data.location.lng),d=new google.maps.Marker({position:c,map:map,animation:google.maps.Animation.DROP,title:b.data.name+" ("+b.data.hereNow.count+" people here)"}),e="<div class='info-window'><h4>"+b.data.name+" ("+b.data.hereNow.count+" here now)</h4>";infowindow=new google.maps.InfoWindow({content:e}),google.maps.event.addListener(d,"click",function(){infowindow&&infowindow.close(),infowindow.setContent(e),infowindow.open(map,d)})})}function setTrendsList(a){a.length>0?$(a).each(function(a,b){console.log(b.data);var c=b.data.name,d=b.data.hereNow.count,e=b.data.stats.checkinsCount,f=b.data.categories[0].shortName,g=b.data.categories[0].icon.prefix+"64"+b.data.categories[0].icon.suffix,h="http://foursquare.com/venue/"+b.data.id,i='<a href="'+h+'" target="_blank">';i+="<h4>"+c+"</h4>",i+='<span class="type"><img src="'+g+'" alt="'+f+'" /> '+f+"</span>",i+='<span class="checkins">'+d+" people here now / "+e+" total</span>",i+="</a>",$("<li />").html(i).appendTo($("#trends"))}):$("<li />").html('<span class="none">No venues are trending right now. How lame!</span>').appendTo($("#trends"))}var infowindow=null,map;$(document).ready(function(){Parse.initialize("0eVcAKXZWKD1p8Dy8MiipuCy7Ye67y64lBEOjuYW","3nZXyBOHROHK9YAoj0jvEGyQjdf4IEpBYAZC0W2k"),google.maps.event.addDomListener(window,"load",initialize),Parse.Cloud.run("trendingInDSM",{},{success:function(a){console.log(a),setMarkers(a),setTrendsList(a)},error:function(a){console.log(a)}})});