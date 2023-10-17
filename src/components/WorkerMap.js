import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import GPS_STATUS from "../constants/gpsStatus";
import ATTENDANCE_STATUS from "../constants/attendanceStatus";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

function WorkerMap({
  location,
  gpsStatus,
  gpsSite,
  checkedInSite,
  attendanceStatus,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [103.8198, 1.3521],
        zoom: 10,
      });
    }
    const map = mapRef.current;

    map.fitBounds([
      // Bounding box is [103.6059, 1.1644], [104.0839, 1.4705]
      [103.5659, 1.1844],
      [104.0739, 1.4905],
    ]);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (
      [ATTENDANCE_STATUS.CHECKING_OUT, ATTENDANCE_STATUS.CHECKED_OUT].includes(
        attendanceStatus
      )
    ) {
      if (marker) {
        marker.remove();
      }
      return;
    }

    if (location && map) {
      const { lng, lat } = location;

      const markerColor = () => {
        switch (attendanceStatus) {
          case ATTENDANCE_STATUS.LOADING:
            return "grey";
          case ATTENDANCE_STATUS.CHECKED_IN:
          case ATTENDANCE_STATUS.CHECKING_IN:
            return "green";
          default:
            return "red";
        }
      };

      if (marker) {
        marker.remove();
      }
      markerRef.current = new mapboxgl.Marker({ color: markerColor() })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      map.flyTo({ center: [lng, lat], zoom: 15 });
    }
  }, [location, attendanceStatus]);

  const gpsStatusMsg = () => {
    switch (gpsStatus) {
      case GPS_STATUS.REQUESTING:
        return "Detecting location.";
      case GPS_STATUS.ON:
        if (!gpsSite) {
          return "Your current location is not at a work site.";
        } else if (checkedInSite && gpsSite !== checkedInSite) {
          return `Your current location is ${gpsSite}. You must check out from ${checkedInSite}.`;
        } else {
          return `Your current location is ${gpsSite}.`;
        }
      case GPS_STATUS.NOT_SUPPORTED:
        return "Location access not supported. Please use a compatible browser.";
      case GPS_STATUS.DENIED:
        return "Location access denied. Please grant access to confirm you're at a work site.";
      case GPS_STATUS.ERROR:
        return "Location access error. Please contact support.";
      default:
        return;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mr: 3,
      }}
    >
      <Typography>{gpsStatusMsg()}</Typography>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "325px",
          borderRadius: "4px",
        }}
      ></div>
    </Box>
  );
}

export default WorkerMap;
