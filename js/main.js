

// to open the sliding navbar
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

// to close the sliding navbar
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

//Creating a marker
var markers=[];

//Loctions of all Cities
  var Cities=[
  {
  name: 'Delhi',
    location:{
      lat: 28.7041,
      lng: 77.1025
    },
    id: 'ChIJL_P_CXMEDTkRw0ZdG-0GVvw',
    show: true,
    selected: false

},
{
  name: 'Mumbai',
  location:{
    lat: 19.07283,
    lng:72.88261
  },
  id: 'ChIJwe1EZjDG5zsRaYxkjY_tpF0',
  show: true,
    selected: false
},
{
  name: 'Kolkata',
  location:{
    lat: 22.5726,
    lng: 88.3639
},
  id: 'ChIJZ_YISduC-DkRvCxsj-Yw40M',
  show: true,
  selected: false
},
{
  name: 'Jaipur',
location:{
   lat: 26.9124,
   lng: 75.7873
},
  id: 'ChIJgeJXTN9KbDkRCS7yDDrG4Qw',
  show: true,
  selected: false
},
{
  name: 'Chennai',
location: {
  lat: 13.0827,
  lng: 80.2707
},
  id: 'ChIJYTN9T-plUjoRM9RjaAunYW4',
  show: true,
  selected: false
}];

var Location = function (item) {
    this.name = ko.observable(item.name);
    this.location = ko.observable(item.location);
    this.marker = ko.observable();
};

//Initialize google map
var map;

// This init function is call back function for google map api loading
var initMap = function () {

    //Create google map object
    map= new google.maps.Map(document.getElementById('map'),{
    center: {lat: 20.5937, lng: 78.9629},
    zoom: 5,
    mapTypeControl: false
    });

    //Bind view Model to knockout
    ko.applyBindings(new viewModel());
};

var googleError = function () {
    $('#map').append('<div class="error"><h3>OOPS...Something went wrong. Google Map is not Loaded</h3></div>');
};

var viewModel = function () {

    var self = this;

    this.locations = ko.observableArray ();

    //Create InfoWindow object
    var infoWindow = new google.maps.InfoWindow({});
    var bounds=new google.maps.LatLngBounds();

    //Loop through all locationsList array of objects and create location object

    Cities.forEach(function (item) {

        //Create location object
        var location = new Location(item);

        //Create marker object
        var marker = new google.maps.Marker({
                position: item.location,
                map: map,
                title: item.name,
                icon: item.icon,
                animation: google.maps.Animation.DROP,
                show: ko.observable(true)
        });

        //Set marker property to the marker just created
        location.marker = marker;

        markers.push(marker);
        bounds.extend(marker.position);
        //this keyword can not be used as it was giving locations undefined error, so using self.
        //Push created location object into observable Array
        self.locations.push(location);

        // animating the pins on the map
        var makeBounce =null;
        var clickListener = function() {
        if(makeBounce!=null)
         makeBounce.setAnimation(null);
        if(makeBounce != this) {
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){makeBounce.setAnimation(null);},500)
        makeBounce = this;
        }
       else
        makeBounce = null;
        }
     google.maps.event.addListener(marker, 'click', clickListener);
     marker.addListener('click', function (){
         self.openInfoWindow(this);
       });
     map.fitBounds(bounds);

    });

    //  Open InfoWindow when marker or list item is clicked.
    //   This function receives marker object.
    //   Do the Asynchronous call to foursquare api to get review details of marker/location that is clicked.

    this.openInfoWindow = function (marker) {

        /* Error handling for Ajax request. If it takes more than 8 sec, display below message */
        var forsquareRequestTimeOut = setTimeout(function () {
               infoWindow.setContent("<h4> FourSquare info unavailable at the moment. Please try back later.</h4>");
               infoWindow.open(map, marker);
        },8000);

        //Make Ajax request to foursquare API end point.
        $.ajax({
                url: 'https://api.foursquare.com/v2/venues/explore',
                type: 'GET',
                dataType: 'json',

                data: {
                        client_id: 'QDHBVRFOZVOOUF442VUWKDQOKBZVX50VMPJAYIZ3DCXFGP4S',
                        client_secret: 'EUSSHEJASZD33QUGVHXHNH4TI1D24S0MVZTFJN2ROWTOH4YA',
                        v: '20160407',
                        limit: 1,
                        ll: marker.position.lat() + ',' + marker.position.lng(),
                        query: marker.title,
                        async: true
                    },

                //Execute success function once response is received from 3rd party. Show InfoWindw
                success: function(results) {
                        infoWindow.open(map, marker);
                        infoWindow.setContent('<div class="infowindow"><h3>'+marker.title+'</h3>Rating:' +results.response.groups[0].items[0].venue.rating    +
                            '</h4><p>' + results.response.groups[0].items[0].tips[0].text +
                            '</p><a href=' + results.response.groups[0].items[0].tips[0].canonicalUrl + '>FourSquare</a></p></div>');
                            clearTimeout(forsquareRequestTimeOut);
                        },

                });
    };


    /* Observable for Filter Functionality*/
    this.places = ko.observableArray(self.locations());
    this.userInput = ko.observable('');

    /* Filter Functionality for List View */
    this.filteredList = ko.computed (function () {
        return ko.utils.arrayFilter(self.places(), function(loc) {
           if (loc.name().toLowerCase().indexOf(self.userInput().toLowerCase()) >= 0) {
                loc.marker.setVisible(true);
                return true;
            } else {
                loc.marker.setVisible(false);
                return false;
            }
        });
    });

    //Trigger click event when location is clicked from list view.
    this.locationClicked = function (loc) {
        self.openInfoWindow(loc.marker);
        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){loc.marker.setAnimation(null);},500)
    };

};
