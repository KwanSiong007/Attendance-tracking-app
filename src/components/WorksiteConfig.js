import React, { useEffect, useRef } from "react";
import {
  ref,
  push,
  set,
  update,
  child,
  remove,
  onChildAdded,
  onChildRemoved,
  onChildChanged,
  off,
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
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  const writeWorksite = async (worksite) => {
    console.log("writeWorksite run");
    const worksitesRef = ref(database, DB_KEY.WORKSITES);
    const newWorksiteRef = push(worksitesRef);
    await set(newWorksiteRef, worksite);
    return newWorksiteRef;
  };

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
      [103.5659, 1.1644],
      [104.0739, 1.4705],
    ]);

    if (!drawRef.current) {
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
    }
    const draw = drawRef.current;

    map.on("load", () => {
      map.addSource("worksites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "worksite-fill",
        type: "fill",
        source: "worksites",
        paint: {
          "fill-color": "#627BC1",
          "fill-opacity": 0.5,
        },
      });

      map.addLayer({
        id: "worksite-border",
        type: "line",
        source: "worksites",
        paint: {
          "line-color": "#627BC1",
          "line-width": 2,
        },
      });

      map.addControl(draw);

      const worksitesRef = ref(database, DB_KEY.WORKSITES);

      onChildAdded(worksitesRef, (snapshot) => {
        console.log("onChildAdded run");
        const worksite = snapshot.val();

        const feature = {
          type: "Feature",
          properties: {
            name: worksite.name,
            mapboxId: worksite.mapboxId,
            firebaseId: snapshot.key,
          },
          geometry: {
            type: "Polygon",
            coordinates: [worksite.coordinates],
          },
        };

        const data = map.getSource("worksites")._data;
        data.features.push(feature);
        map.getSource("worksites").setData(data);
      });

      onChildRemoved(worksitesRef, (snapshot) => {
        console.log("onChildRemoved run");

        const data = map.getSource("worksites")._data;
        data.features = data.features.filter(
          (f) => f.properties.firebaseId !== snapshot.key
        );
        map.getSource("worksites").setData(data);

        const drawFeature = draw
          .getAll()
          .features.find((f) => f.id === snapshot.key);

        if (drawFeature) {
          draw.delete(drawFeature.id);
        }
      });

      onChildChanged(worksitesRef, (snapshot) => {
        console.log("onChildChanged run");
        const worksite = snapshot.val();

        const data = map.getSource("worksites")._data;
        const featureIndex = data.features.findIndex(
          (f) => f.properties.firebaseId === snapshot.key
        );

        if (featureIndex !== -1) {
          data.features[featureIndex].geometry.coordinates =
            worksite.coordinates;
          map.getSource("worksites").setData(data);
        }

        const drawFeature = draw
          .getAll()
          .features.find((f) => f.id === snapshot.key);

        if (drawFeature) {
          drawFeature.geometry.coordinates = worksite.coordinates;
        }
      });

      return () => {
        off(worksitesRef, "child_added");
        off(worksitesRef, "child_removed");
        off(worksitesRef, "child_changed");
      };
    });

    const handleWorksiteClick = (e) => {
      const clickedFeature = e.features[0];

      clickedFeature.id = clickedFeature.properties.firebaseId;
      draw.add(clickedFeature);

      const data = map.getSource("worksites")._data;
      data.features = data.features.filter(
        (f) => f.properties.firebaseId !== clickedFeature.id
      );
      map.getSource("worksites").setData(data);

      draw.changeMode("simple_select", {
        featureId: clickedFeature.id,
      });
    };

    map.on("click", "worksite-fill", handleWorksiteClick);

    map.on("mouseenter", "worksite-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "worksite-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("draw.create", async (e) => {
      console.log("on draw.create run");
      try {
        const feature = e.features[0];
        const name = prompt("Enter a name for this worksite:", "Name");
        if (name === null) return;

        const worksite = {
          name: name,
          coordinates: feature.geometry.coordinates[0],
          mapboxId: feature.id,
        };

        await writeWorksite(worksite);
        console.log("Worksite added in Firebase.");

        draw.delete(feature.id);
      } catch (error) {
        console.error("Error saving the worksite:", error);
      }
    });

    map.on("draw.update", async (e) => {
      console.log("on draw.update run");
      try {
        const feature = e.features[0];
        const worksitesRef = ref(database, DB_KEY.WORKSITES);
        const worksiteRef = child(worksitesRef, feature.properties.firebaseId);

        await update(worksiteRef, {
          coordinates: feature.geometry.coordinates[0],
        });
        console.log("Worksite updated in Firebase.");
      } catch (error) {
        console.error("Error updating the worksite:", error);
      }
    });

    map.on("draw.delete", async (e) => {
      console.log("on draw.delete run");
      try {
        const feature = e.features[0];
        const worksitesRef = ref(database, DB_KEY.WORKSITES);
        const worksiteRef = child(worksitesRef, feature.properties.firebaseId);

        await remove(worksiteRef);
        console.log("Worksite deleted from Firebase.");
      } catch (error) {
        console.error("Error deleting the worksite:", error);
      }
    });

    return () => {
      map.off("load");
      map.off("click", "worksite-fill", handleWorksiteClick);
      map.off("mouseenter", "worksite-fill");
      map.off("mouseleave", "worksite-fill");
      map.off("draw.create");
      map.off("draw.update");
      map.off("draw.delete");
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
