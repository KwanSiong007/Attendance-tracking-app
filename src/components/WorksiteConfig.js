import React, { useEffect, useRef } from "react";
import {
  ref,
  push,
  set,
  onChildAdded,
  onChildRemoved,
  onChildChanged,
} from "firebase/database";
import { database } from "../firebase";
import { Container } from "@mui/material";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import DB_KEY from "../constants/dbKey";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;

function WorksiteConfig() {
  const mapContainer = useRef(null);

  const writeWorksite = async (worksite) => {
    const worksitesRef = ref(database, DB_KEY.WORKSITES);
    const newWorksiteRef = push(worksitesRef);
    await set(newWorksiteRef, worksite);
  };

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

    map.on("draw.create", async (event) => {
      try {
        const name = prompt("Enter a name for this worksite:", "Name");
        if (name === null) return;

        const worksite = {
          name: name,
          coordinates: event.features[0].geometry.coordinates[0],
        };

        await writeWorksite(worksite);
        draw.deleteAll();
        alert("Worksite saved!");
      } catch (error) {
        console.error("Error saving the worksite:", error);
      }
    });

    map.on("load", () => {
      const worksitesRef = ref(database, DB_KEY.WORKSITES);

      onChildAdded(worksitesRef, (snapshot) => {
        const worksite = snapshot.val();
        map.addLayer({
          id: snapshot.key,
          type: "fill",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [worksite.coordinates],
              },
            },
          },
          paint: {
            "fill-color": "#888888",
            "fill-opacity": 0.5,
          },
        });
      });

      onChildRemoved(worksitesRef, (snapshot) => {
        if (map.getLayer(snapshot.key)) {
          map.removeLayer(snapshot.key);
          map.removeSource(snapshot.key);
        }
      });

      onChildChanged(worksitesRef, (snapshot) => {
        const worksite = snapshot.val();
        if (map.getSource(snapshot.key)) {
          map.getSource(snapshot.key).setData({
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [worksite.coordinates],
            },
          });
        }
      });
    });

    return () => {
      map.remove();
    };
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
