"use client";

import { useState } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';

export default function SearchBox({ onPlaceSelect, placeholder }) {
  const [searchBox, setSearchBox] = useState(null);
  const [searchText, setSearchText] = useState('');

  const onLoad = ref => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        onPlaceSelect(location, searchText);
      }
    }
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <StandaloneSearchBox
      onLoad={onLoad}
      onPlacesChanged={onPlacesChanged}
    >
      <input
        type="text"
        placeholder={placeholder || "Search for a location..."}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchText}
        onChange={handleInputChange}
      />
    </StandaloneSearchBox>
  );
} 