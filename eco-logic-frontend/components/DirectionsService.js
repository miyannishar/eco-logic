export const getDirections = async (origin, destination) => {
  const directionsService = new google.maps.DirectionsService();

  try {
    const result = await directionsService.route({
      origin,
      destination,
      travelMode: google.maps.TravelMode.WALKING,
    });

    return result;
  } catch (error) {
    console.error("Error getting directions:", error);
    throw error;
  }
};

export const showDirections = (buildingName) => {
  const building = FISK_BUILDINGS.find(b => b.name === buildingName);
  if (!building) return;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      try {
        const directions = await getDirections(userLocation, building.position);
        // Handle displaying directions
        console.log(directions);
      } catch (error) {
        console.error("Error getting directions:", error);
      }
    });
  }
};

// Make the function available globally for the info window
if (typeof window !== "undefined") {
  window.showDirections = showDirections;
} 