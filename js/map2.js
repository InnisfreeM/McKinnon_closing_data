//Creates the baselayer, more options available at https://leaflet-extras.github.io/leaflet-providers/preview/
var baselayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

//Create empty variable for data that we'll pull from the geojsons
var sitePoints = null,
	campusPoints = null;

// Create additional map panes to fix potential layering issues
//map.createPane("pane200").style.zIndex = 200; // tile pane
//map.createPane("pane450").style.zIndex = 450; // between overlays and shadows
//map.createPane("pane600").style.zIndex = 600; // marker pane

//Sets the color for each sector Type
//more sector Types can be added by following the pattern below
//the last color without a type label is the color that anything with a type that isn't listed will be colored 
function setColor(type) {
	return type == 'Private not-for-profit, 4-year or above' ? "#8856a7" : 
           type == 'Private not-for-profit, 2-year' ? "#9ebcda" :
		   type == 'Private not-for-profit, less-than 2-year' ? "#e0ecf4" :
		   type == 'Public, 4-year or above' ? "#2ca25f" :
           type == 'Public, 2-year' ? '#99d8c9' :
		   type == 'Public, less-than 2 year' ? '#e5f5f9' :
	       type == 'Source' ? "#ffeda0" : 
	                     "white";
}

//this is the part where we tell it to use sector to set the fill color of our circle and create a white outline
//the white outline is helpful when there are lots of points stacked on top of each other
function style(feature) {
    return {
        fillColor: setColor(feature.properties.sector),
        color: "white",
        fillOpacity: 0.9,
        width: 0.2
    };
}

//this highlights a clicked on datapoint in white, to help make it clear which point has been selected
//this is another helpful thing when you've got stacks of points
var activePoint;

function highlightFeature(e) {
	if (activePoint) {
		activePoint.setStyle(style(activePoint.feature));
	};
	
	var layer = e.target;
	activePoint = e.target;
	
	
	activePoint.setStyle({
		fillColor: '#ffffff',
	});
}

$.getJSON("data/campuses.geojson", function(data) {
	campusPoints = L.geoJson(data, {
		pointToLayer: function (feature, latlng) {
        return L.circleMarker (latlng, {
			radius: 3,
			color: '#ffffff',
			weight: .5, 
			fillColor: '#999999',
			fillOpacity: 1
			});
		},
		
	 onEachFeature: function(feature, layer) {            
        var props = layer.feature.properties;
        
        layer.bindPopup("<b>"+props.Name+"</b>"+
		        "<dl>"+
            props.City+", "+props.State+  
			"</dl>");
	
	    layer.on({
	        click: highlightFeature
	    	});
	    
    	}
	
	})

//uses jQueryget to get geoJSON data and style it
//this is also where we're adding the popup and determining what data goes in it
//the naming convention is "props.NAMEOFCOLUMN"
$.getJSON("data/data.geojson",function(data){
	// Create data layer
	sitePoints = L.geoJson(data, {
		pointToLayer: function (feature, latlng) {
        return L.circleMarker (latlng, style(feature));
		},
	
	 onEachFeature: function(feature, layer) {            
        var props = layer.feature.properties;
        
        layer.bindPopup("<b>"+props.school+"</b>"+
		        "<dl>"+
            props.city+", "+props.state+
            "<br><a href="+props.url_txt+">Read More</a>"+      
		        "</dl>");
	
	    layer.on({
	        click: highlightFeature
	    	});
	    
		}

	})



//time to make the legend and place it on the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    //this is the title for the legend
    div.innerHTML += "<b>"+ 'Closed Institutions'+ "</b>"+ "<br>";
    
    //type is the content of the sector field, labels is what you want the label on the legend to actually say
    //there need to be the same number of types as labels and listed in the same order
    type = ['Private not-for-profit, 4-year or above', 'Private not-for-profit, 2-year', 'Private not-for-profit, less-than 2-year', 'Public, 4-year or above', 'Public, 2-year', 'Public, less-than 2 year'];
    labels = ['Private not-for-profit, 4-year or above', 'Private not-for-profit, 2-year', 'Private not-for-profit, less-than 2-year', 'Public, 4-year or above', 'Public, 2-year', 'Public, less-than 2 year'];
    
    for (var i = 0; i < type.length; i++) {
        div.innerHTML +=
            '<i class="circle" style="background:' + setColor(type[i]) + '"></i> ' +
             (type[i] ? labels[i] + '<br>' : '+');
    }
    
    return div;
};



//adding the above baselayer, data points and legend to the map
//the map is being centered on the datapoints in the sitePoints layer
var map = L.map('map', {maxZoom: 20}).fitBounds(sitePoints.getBounds());
	baselayer.addTo(map);
	sitePoints.addTo(map);
	//campusPoints.addTo(map);
	legend.addTo(map);

});
