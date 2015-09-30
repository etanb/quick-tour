$(".quicktour-search").click(function(){  
	$(".quicktour-input").hide("slow")
	$(".quicktour-map-container, .quicktour-card-container").show("slow")
	var map,
	    service;

	function initMap() {
	 	  map = new google.maps.Map(document.getElementById('map'), {
	 	    center: {lat: -0, lng: 0},
	 	    zoom: 1
	 	  });
	 	  service = new google.maps.places.PlacesService(map);
	 	}

	 	initMap()

 	var query = encodeURIComponent( $(".form-control").val() ),
 		placesIDArray = [];

 	async.series([
 	    function(callback){
 	    	var request = {
 	    	    query: query
 	    	  };
 	    	  service.textSearch(request, function(places, status) {
 	    	  	for (var key in places) 
	 	          	{ 
	 	          		placesIDArray.push(places[key].place_id)
	 	          	};
 	          	callback(null, places);
 	    	  });
 	    },
 	    function(callback){
 	    	var placeDetails = [];

 	    	if ( placesIDArray.length > 4 ) {
 	    		placesIDArray = placesIDArray.slice(0,4)
 	    	}

 	    	async.eachSeries(placesIDArray, function(place, done) {
 	    		var request = {
 	    		    placeId: place
 	    		  };
 	    		service.getDetails(request, function(place, status) {
 	    		    console.log(status)
 	    		    if (status == google.maps.places.PlacesServiceStatus.OK) {
 	    		      placeDetails.push(place)
 	    		      done();
 	    		    }
 	    		  });

 	    	}, function(err) {
 	    	  if (err) {
 	    	    throw err;
 	    	  }
 	    	  callback(null, placeDetails);
 	    	});
 	    }
 	],
 	function(err, results){
 		var detailsLength = results[1].length,
 			cardContainer = $(".quicktour-cards");
 		if ( detailsLength === 0) {

 		} else if ( detailsLength === 1 ) {

 		} else if ( detailsLength === 2 ) {

 		} else if ( detailsLength === 3 ) {

 		} else if ( detailsLength === 4 ) {
 			for (var key in results[1] ) {
 				var data = results[1][key];
 				var photo;
 				if ( data.photos === undefined ) {
 					photo = "img/no_image.png"
 				} else {
 					photo = data.photos[0].getUrl({'maxWidth': 350, 'maxHeight': 350}) 
 				}
 				var	template = "<div class='col-md-3'>" +
 				"<div class='container'>" +
 				"<div data-lat=" + data.geometry.location.lat().toString() + " " + "data-lon=" + data.geometry.location.lng().toString() + " class='card'>" +
 				"<div class='front'>" +
 				"<h2>" + data.name +"</h2>" +
 				"<img src='" + data.icon + "' />" +
 				"</div>" +
 				"<div class='back'>" +
 				"<div class='content'>" +
 				"<img src='" + photo + "' height='150' width='150'/>" +
 				"<p>" + data.name + "</p>" +
 				"<p>" + data.rating + "</p>" +
 				"<p>" + data.formatted_phone_number + "</p>" +
 				"<p>" + data.vicinity + "</p>" +
 				"</div>" +
 				"</div>" +
 				"</div>" +
 				"</div>" +
 				"</div>"

 				cardContainer.append(template)
 			} 			
 		}
 		$('.card').click(function(){
 		  $(this).toggleClass('flipped');
 		  
 		  var newLatLng = {lat: $(this).data("lat"), lng: $(this).data("lon")};

 		    var map = new google.maps.Map(document.getElementById('map'), {
 		      zoom: 14,
 		      center: newLatLng
 		    });

 		    var marker = new google.maps.Marker({
 		      position: newLatLng,
 		      animation: google.maps.Animation.BOUNCE,
 		      map: map
 		    });

 		});

 	});


});
