"use strict";function initialize(){var a=[{featureType:"water",stylers:[{visibility:"on"},{color:"#acbcc9"}]},{featureType:"landscape",stylers:[{color:"#f2e5d4"}]},{featureType:"road.highway",elementType:"geometry",stylers:[{color:"#c5c6c6"}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{color:"#e4d7c6"}]},{featureType:"road.local",elementType:"geometry",stylers:[{color:"#fbfaf7"}]},{featureType:"poi.park",elementType:"geometry",stylers:[{color:"#c5dac6"}]},{featureType:"administrative",stylers:[{visibility:"on"},{lightness:33}]},{featureType:"road"},{featureType:"poi.park",elementType:"labels",stylers:[{visibility:"on"},{lightness:20}]},{},{featureType:"road",stylers:[{lightness:20}]}],b={center:new google.maps.LatLng(41.5839,-93.6289),zoom:14,disableDefaultUI:!0,VisualRefresh:!0,scrollwheel:!1,styles:a,mapTypeId:google.maps.MapTypeId.ROADMAP};map=new google.maps.Map(document.getElementById("map-canvas"),b)}function sortAllTime(a,b){return b.total-a.total}function sortAM(a,b){return b.am-a.am}function sortNoon(a,b){return b.noon-a.noon}function sortPM(a,b){return b.pm-a.pm}function removeMarkers(){$.each(markersArray,function(a,b){b.setMap(null)}),markersArray.length=0}function setMarkers(a){removeMarkers(),$(a).each(function(a,b){var c=new google.maps.LatLng(b.data.location.lat,b.data.location.lng),d=new google.maps.Marker({position:c,map:map,animation:google.maps.Animation.DROP,title:b.data.name+'<span class="here-now"> ('+b.data.hereNow.count+" people here)</span>"}),e='<div class="info-window"><h4>'+b.data.name+'<span class="here-now"> ('+b.data.hereNow.count+" here now)</span></h4>";infowindow=new google.maps.InfoWindow({content:e}),markersArray.push(d),google.maps.event.addListener(d,"click",function(){infowindow&&infowindow.close(),infowindow.setContent(e),infowindow.open(map,d)})})}function setTrendsList(a,b){var c;switch(console.log(a),a){case"now":c=$.grep(venues,function(a){return a.trending});break;case"alltime":b?("am"===b&&(c=venues.sort(sortAM)),"noon"===b&&(c=venues.sort(sortNoon)),"pm"===b&&(c=venues.sort(sortPM))):c=venues.sort(sortAllTime)}$("body").attr("class",a),c=c.slice(0,5),c.length>0?(trendsList.html(""),$(c).each(function(a,b){var c=b.data.name,d=b.data.hereNow.count,e=b.data.stats.checkinsCount,f="http://foursquare.com/venue/"+b.data.id,g='<a href="'+f+'" target="_blank">';g+="<h4>"+c+"</h4>",g+='<span class="here-now"><i class="icon-person"></i> '+d+'</span><span class="total-checkins"><i class="icon-pin"></i> '+e+" checkins</span>",g+="</a>",$("<li />").html(g).appendTo(trendsList)}),setMarkers(c)):$("<li />").html('<span class="none">No venues are trending right now.</span>').appendTo(trendsList)}function toggleTimeOfDay(){$(".time-of-day").toggleClass("open")}function clearTimeOfDayOptions(){$(".time-of-day input").removeAttr("checked")}function maybeResetTimeOfDay(a){currentTimeOfDay===a?($("input[name=timeofday]").removeAttr("checked"),currentTimeOfDay=""):(currentTimeOfDay=a,setTrendsList("alltime",a))}var infowindow=null,map,currentTimeOfDay,venues,markersArray=[],google=google||{},Parse=Parse||{},trendsList=$("#trends-list");$(document).ready(function(){Parse.initialize("0eVcAKXZWKD1p8Dy8MiipuCy7Ye67y64lBEOjuYW","3nZXyBOHROHK9YAoj0jvEGyQjdf4IEpBYAZC0W2k"),google.maps.event.addDomListener(window,"load",initialize),Parse.Cloud.run("trendingInDSM",{},{success:function(a){venues=a,setTrendsList("now")},error:function(a){console.log(a)}}),$("input[name=trend]").change(function(){toggleTimeOfDay(),clearTimeOfDayOptions(),setTrendsList($(this).val())}),$("input[name=timeofday]").click(function(){maybeResetTimeOfDay($(this).val())})});