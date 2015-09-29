$(".quicktour-search").click(function(){       
 	var query = encodeURIComponent( $(".form-control").val() );

 	$.get( "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAwE_RA--Pi7ZoUKbZUzDo-9hfCJg5aaZM&address=" + query, function( data ) {
 	  $( ".result" ).html( data );
 	
 	  alert( data );
 	});
});