# Neighborhood

## Neighborhood is a web application that allows users to do mainly the following:
 * Browse Google Map
 * Add places to user places(My Places)
 * Get more information for user places, and view pictures of them
    from WikiMedia API, and Foursquare API
 * For built operations this project uses Grunt.

## In order to run the web site, it is required to
 * The application can run on an application server or it can be started by opening index.html
   with a browser directly.
 * It is required to use a modern browser
 * Have Internet connection, and have access to Google Maps API, WikiMedia API, and Foursquare API
 * Build tool Grunt is used in the project, in order to create distribution version it is required
   to run Grunt from terminal in project folder. In addition it is required to copy images and fonts
   folders from src folder to dist folder.

## Browsing the web site:
 * Open index.html (or visit the application server that the project deployed to)
 * When the project runs for the first time, there will be five user places by default.
 * The user places are listed in the sidebar, which is located at the left.
 * Sidebar also contains filter, and search controls.
 * To remove a place, click the edit button next to the My Places, then click the red button
   next to that place.
 * To get more information for a place, select the place by clicking its name from list or
   the marker of the place from the map.
 * When mouse moves over on a place name from list or a marker, place name appears above the marker.
 * When a place is selected, information window for that place appears. For small screens,
   the information window appears at the bottom of the page. For large screens, it appears
   below the My Places list.
 * Information window contains place address, Foursquare information and Wikipedia Information.
 * By clicking the buttons next to Wikipedia text or Foursquare, more information and pictures
   can be viewed from the modal opened.
 * In order to navigate between pictures of a place, the left and right buttons should be clicked.
 * My Places list can be filtered by place types, from the filter control on the top of Sidebar.
 * Search can performed on My Places list by writing to the search box on the Sidebar, below the
   filter control.
 * More places can be searched from Google Places by typing to the searchbox over the map. Search
   will be performed after pressing enter. The found places can be added to My Places by clicking
   the markers of found places.
 * There are two options for centering the map. When center on select option is active,
   the map centers to the selected place. When center on filter option is active,
   the map centers to the filtered places.