var myMap;
// // Store our API endpoint as queryUrl.
var queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
  console.log(data.features[0]);
});

function depthColor(depth) {
  console.log(depth);
  if (depth > 20) {
    return "red";
  }
  if (depth > 10) {
    return "yellow";
  }
  return "green";
}


function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3><hr><p>${new Date(
        feature.properties.time
      )} <br>Magnitude: ${feature.properties.mag}<br> Depth: ${
        feature.geometry.coordinates[2]
      } </p>`
    );
    console.log(feature.geometry.coordinates);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 4 * +feature.properties.mag,
        fillColor: depthColor(+feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.8,
      });
    },
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  var street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  var topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes],
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (myMap) {
    var div = L.DomUtil.create("div");
    var magnitudes = [0, 10, 20, 100];

    // Looping through our intervals to generate a label with a colored square for each interval.
    div.innerHTML +=
      "<div style='font-weight: 600; text-align: center;'>Depth</div>";
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        "<div style='background: " +
        depthColor(magnitudes[i]) +
        "; text-align: center; padding: 1; border: 1px solid grey; min-width: 80px;'>" +
        magnitudes[i] +
        (magnitudes[i + 1]
          ? "&ndash;" + magnitudes[i + 1] + "</div>"
          : "+</div>");
    }
    return div;
  };
  legend.addTo(myMap);
}
