"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import SearchBox from "./SearchBox";

const FISK_COORDINATES = {
  lat: 36.1676,
  lng: -86.8083,
};

const mapContainerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "0.5rem",
};

export default function CampusMap() {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
    // Get user location when map loads
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const calculateRoute = useCallback(async (destination) => {
    if (!userLocation) return;

    const directionsService = new google.maps.DirectionsService();
    try {
      const result = await directionsService.route({
        origin: userLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      });
      setDirectionsResponse(result);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  }, [userLocation]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 z-10">
        <SearchBox onPlaceSelect={calculateRoute} />
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={FISK_COORDINATES}
        zoom={17}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: "satellite",
          mapTypeControl: true,
        }}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "/user-location.png",
              scaledSize: new google.maps.Size(30, 30),
            }}
          />
        )}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: "#2563eb",
                strokeWeight: 5,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
} 