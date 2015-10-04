(function(){
	var map,
	    service;


/*

=====notes from running your app locally====

"bars in new york" had zero results

"bars in florida" displayed movie theaters

the app itself does not tell you anything about what it does

attributes like "rating" have "undefined" displayed as text -- this should never be shown to the user

nice transitions/animationg

the card UI doesn't make a ton of sense — why obscure that information from a user until they click?


====general note====

think about naming everywhere, it seems like you might have declared & named a bunch of variables
intending them to represent one concept but then drift occurred but you didn't rename them to
represent their new status

also you should be consistent with function names—-many people like them to be verb-based. you're inconsistent here

consistent spacing and indenting is also super crucial in an exercise like this

*/

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
		  		// why newline here?
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
					// the console.log looks like an oversight
			    console.log(status)
			    if (status == google.maps.places.PlacesServiceStatus.OK) {
			      placeDetails.push(place)
			      done();
			    }
			  });

		}, function(err) {
		  if (err) {
		    throw err;
		    // this will crash your app, do you un
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
	// does `detailsLength` describe what the parameter actually represents and why is it a separate variable
	// why pass in all of `results` if you're only going to use `results[1]`
	// Used to dermine how many Bootstrap columns should be used based upon results length


		// Why does this function only handle between 1-4 results?
		// Read about the concept of coupling. This is very tight coupling.
		// `renderPlaceDetailCard` should be able to handle any amount of results.
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
			// ^ what's your spacing strategy here? Some lines are super short, some are very long
			// also people don't like mixing html in with js, i would just use a seperate file

			cardContainer.append(template)
		};
	};


// If a user clicks a card, it changes the map position based upon longitude / latitude
// ^ Cool but this should be done for the top result when a query is run, it looks broken otherwise
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

		 // `query` and `placesIDArray` don't belong in the same var declaration
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
	 	    	// ^ where do you explain that you only need 4 results? why do you only need 4 results?
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

	// why have an icon that just reloads the page? i'd expect it to refresh results or something
	// but this clears out the query too
	$(".reload-icon").click( function() {
		location.reload(true);
	});
})();
