import React, { useEffect, useRef } from "react";
import { Container } from "@mui/material";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

function WorksiteConfig() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [103.8198, 1.3521],
      zoom: 10,
    });

    map.fitBounds([
      // Bounding box is [103.6059, 1.1644], [104.0839, 1.4705]
      [103.5659, 1.1644],
      [104.0739, 1.4705],
    ]);

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });
    map.addControl(draw);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ width: "100vw" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "calc(100vh - 325px)" }}
      ></div>
    </Container>
  );
}

export default WorksiteConfig;
