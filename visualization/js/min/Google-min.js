L.Google=L.Class.extend({includes:L.Mixin.Events,options:{minZoom:0,maxZoom:18,tileSize:256,subdomains:"abc",errorTileUrl:"",attribution:"",opacity:1,continuousWorld:!1,noWrap:!1,mapOptions:{backgroundColor:"rgba(0,0,0,0)"}},initialize:function(t,e){L.Util.setOptions(this,e),this._ready=void 0!==google.maps.Map,this._ready||L.Google.asyncWait.push(this),this._type=t||"SATELLITE"},onAdd:function(t,e){this._map=t,this._insertAtTheBottom=e,this._initContainer(),this._initMapObject(),t.on("viewreset",this._resetCallback,this),this._limitedUpdate=L.Util.limitExecByInterval(this._update,150,this),t.on("move",this._update,this),t.on("zoomanim",this._handleZoomAnim,this),t._controlCorners.bottomright.style.marginBottom="20px",this._reset(),this._update()},onRemove:function(t){t._container.removeChild(this._container),t.off("viewreset",this._resetCallback,this),t.off("move",this._update,this),t.off("zoomanim",this._handleZoomAnim,this),t._controlCorners.bottomright.style.marginBottom="0em"},getAttribution:function(){return this.options.attribution},setOpacity:function(t){this.options.opacity=t,1>t&&L.DomUtil.setOpacity(this._container,t)},setElementSize:function(t,e){t.style.width=e.x+"px",t.style.height=e.y+"px"},_initContainer:function(){var t=this._map._container,e=t.firstChild;this._container||(this._container=L.DomUtil.create("div","leaflet-google-layer leaflet-top leaflet-left"),this._container.id="_GMapContainer_"+L.Util.stamp(this),$(".leaflet-google-layer").length>=1?this._container.style.zIndex="0":this._container.style.zIndex="2"),t.insertBefore(this._container,e),this.setOpacity(this.options.opacity),this.setElementSize(this._container,this._map.getSize())},_initMapObject:function(){if(this._ready){this._google_center=new google.maps.LatLng(0,0);var t=new google.maps.Map(this._container,{center:this._google_center,zoom:0,tilt:0,mapTypeId:google.maps.MapTypeId[this._type],disableDefaultUI:!0,keyboardShortcuts:!1,draggable:!1,disableDoubleClickZoom:!0,scrollwheel:!1,streetViewControl:!1,styles:this.options.mapOptions.styles,backgroundColor:this.options.mapOptions.backgroundColor}),e=this;this._reposition=google.maps.event.addListenerOnce(t,"center_changed",function(){e.onReposition()}),this._google=t,google.maps.event.addListenerOnce(t,"idle",function(){e._checkZoomLevels()}),google.maps.event.addListener(t,"tilesloaded",function(){e.fire("load")}),this.fire("MapObjectInitialized",{mapObject:t})}},_checkZoomLevels:function(){void 0!==this._map.getZoom()&&this._google.getZoom()!==this._map.getZoom()&&this._map.setZoom(this._google.getZoom())},_resetCallback:function(t){this._reset(t.hard)},_reset:function(t){this._initContainer()},_update:function(t){if(this._google){this._resize();var e=this._map.getCenter(),i=new google.maps.LatLng(e.lat,e.lng);this._google.setCenter(i),void 0!==this._map.getZoom()&&this._google.setZoom(Math.round(this._map.getZoom())),this._checkZoomLevels()}},_resize:function(){var t=this._map.getSize();(this._container.style.width!==t.x||this._container.style.height!==t.y)&&(this.setElementSize(this._container,t),this.onReposition())},_handleZoomAnim:function(t){var e=t.center,i=new google.maps.LatLng(e.lat,e.lng);this._google.setCenter(i),this._google.setZoom(Math.round(t.zoom))},onReposition:function(){this._google&&google.maps.event.trigger(this._google,"resize")}}),L.Google.asyncWait=[],L.Google.asyncInitialize=function(){var t;for(t=0;t<L.Google.asyncWait.length;t++){var e=L.Google.asyncWait[t];e._ready=!0,e._container&&(e._initMapObject(),e._update())}L.Google.asyncWait=[]};