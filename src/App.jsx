import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const VEHICLE_TABS = ["All Vehicles", "Cart", "Bus"];

const ROUTES = [
  "Hostel → Main Gate",
  "Main Gate → Hostel",
  "Velachery Gate → Main Gate",
  "Velachery Gate → Hostel",
  "Main Gate → Velachery Gate",
  "Hostel → Velachery Gate",
  "Research Park → EDED → Research Park",
];

const IITM_CENTER = [12.9915, 80.2337];

const defaultIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const [activeVehicleTab, setActiveVehicleTab] = useState("All Vehicles");
  const [activeRoute, setActiveRoute] = useState(ROUTES[0]);

  return (
    <div className="page">
      <header className="header">
        <div className="title-block">
          <h1 className="title">Moving Mountains</h1>
          <p className="subtitle">IIT Madras Campus Buses &amp; Carts</p>
        </div>
        <a
          href="https://mm.themint.space/admin"
          target="_blank"
          rel="noreferrer"
          className="admin-link"
        >
          Admin ↗
        </a>
      </header>

      <main className="main">
        <section className="card">
          <div className="card-header">
            <div className="tabs">
              {VEHICLE_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab ${tab === activeVehicleTab ? "tab-active" : ""}`}
                  onClick={() => setActiveVehicleTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="controls">
              <button className="btn-secondary">Refresh</button>
              <button className="btn-primary">Schedule</button>
            </div>
          </div>

          <div className="card-body">
            <div className="routes">
              <h2 className="section-title">Routes</h2>
              <div className="route-list">
                {ROUTES.map((route) => (
                  <button
                    key={route}
                    className={`route-pill ${
                      route === activeRoute ? "route-pill-active" : ""
                    }`}
                    onClick={() => setActiveRoute(route)}
                  >
                    {route}
                  </button>
                ))}
              </div>
            </div>

            <div className="map-panel">
              <div className="location-warning">
                <strong>Location is blocked in browser settings.</strong>
                <p>
                  Click the 🔒 icon near the URL → Site settings → Location → Allow
                  (or Ask), then refresh.
                </p>
              </div>
              <div className="map-container">
                <MapContainer
                  center={IITM_CENTER}
                  zoom={15}
                  scrollWheelZoom={true}
                  className="leaflet-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={IITM_CENTER} icon={defaultIcon}>
                    <Popup>Approx. IIT Madras campus center</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="map-attribution">
                <a
                  href="https://leafletjs.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Leaflet
                </a>{" "}
                · ©{" "}
                <a
                  href="https://openstreetmap.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenStreetMap
                </a>{" "}
                contributors
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <span>Amit Kumar | CE20B009 | MInT Lab</span>
          <a
            href="https://forms.gle/9ydf7wbDwctUCHKs7"
            target="_blank"
            rel="noreferrer"
          >
            Open feedback form ↗
          </a>
        </footer>
      </main>
    </div>
  );
}

export default App;

