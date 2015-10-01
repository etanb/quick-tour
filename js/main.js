(function(){
	var map,
	    service;

// Creates the static map of the world
	function initMap() {
	  map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: -0, lng: 0},
	    zoom: 1
	  });
	  service = new google.maps.places.PlacesService(map);
	};

// Using the textSearch Map library, we're finding results based upon the natural language inputted by user
	function getSearchResults(query, placesIDArray, callback) {
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
	};

// Based upon the individual Place IDs, we're getting each place's details
	function getPlaceDetails(placesIDArray, placeDetails, callback) {
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
	};

// Renders messsage if there are no place detail results 
	function noPlaceDetails(cardContainer) {
		var	template = "<div class='col-md-12 no-results'>" +
		"<h1>Sorry, your query yielded no results.</h1>" +
		"</div>"

		cardContainer.append(template)
	};

// Renders the 'cards' for each place detail
	function renderPlaceDetailCard(results, detailsLength, cardContainer, cardColumn) {
	// Used to dermine how many Bootstrap columns should be used based upon results length
		switch (detailsLength) {
			case 1:
				cardColumn = 12;
				break;
			case 2:
				cardColumn = 6;
				break;
			case 3:
				cardColumn = 4;
				break;
			case 4:
				cardColumn = 3;
				break;
		};

		for (var key in results[1] ) {
			var data = results[1][key];
			var photo;
			if ( data.photos === undefined ) {
				photo = "img/no_image.png"
			} else {
				photo = data.photos[0].getUrl({'maxWidth': 350, 'maxHeight': 350}) 
			}
			var	template = "<div class='col-md-" + cardColumn + "''>" +
			"<div class='container'>" +
			"<div data-lat=" + data.geometry.location.lat().toString() + " " + "data-lon=" + data.geometry.location.lng().toString() + " class='card'>" +
			"<div class='front'>" +
			"<h2><i>" + data.name +"</i></h2>" +
			"<img src='" + data.icon + "' />" +
			"</div>" +
			"<div class='back'>" +
			"<div class='content'>" +
			"<img src='" + photo + "' height='150' width='150'/>" +
			"<p>" + data.name + "</p>" +
			"<p><strong>Rating:</strong> " + data.rating + "</p>" +
			"<p><strong>Phone:</strong> " + data.formatted_phone_number + "</p>" +
			"<p><strong>Address:</strong> " + data.vicinity + "</p>" +
			"</div>" +
			"</div>" +
			"</div>" +
			"</div>" +
			"</div>"

			cardContainer.append(template)
		}; 
	};

// If a user clicks a card, it changes the map position based upon longitude / latitude
	function cardClickMapMove() {
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
	};

	$(".quicktour-search").click(function(){ 
	 // Shows/hides elements upon load
		$(".quicktour-input").hide("slow")
		$(".quicktour-map-container, .quicktour-card-container").show("slow")
		 	initMap();
	 	var query = encodeURIComponent( $(".form-control").val() ),
	 		placesIDArray = [];
	// Using the Async JS library, does all the HTTP requests
	 	async.series([
	 	    function(callback){
	 	    	getSearchResults(query, placesIDArray, callback);
	 	    },
	 	    function(callback){
	 	    	var placeDetails = [];
	 	    	// Only need at most 4 results and also prevents hitting API rate limiting
	 	    	if ( placesIDArray.length > 4 ) {
	 	    		placesIDArray = placesIDArray.slice(0,4)
	 	    	};
	 	    	getPlaceDetails(placesIDArray, placeDetails, callback);
	 	    }
	 	],
	 	function(err, results){
	 		// Rendering results, if there are any
	 		var detailsLength = results[1].length,
	 			cardContainer = $(".quicktour-cards"),
	 			cardColumn;
	 		
	 		if (detailsLength === 0) {
	 			noPlaceDetails(cardContainer);
	 		} else {
	 			renderPlaceDetailCard(results, detailsLength, cardContainer, cardColumn);
	 			cardClickMapMove();
	 		};
	 	});
	});

	$(".reload-icon").click( function() {
		location.reload(true);
	});
})();