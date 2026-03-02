import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ─── Constants ─── */
const IITM_CENTER = [12.9915, 80.2337];
const IIT_LOGO = "https://upload.wikimedia.org/wikipedia/en/6/69/IIT_Madras_Logo.svg";

const FILTER_OPTIONS = [
  { label: "All Vehicles", value: "All Vehicles", icon: "🚍" },
  { label: "Carts", value: "Cart", icon: "🛺" },
  { label: "Buses", value: "Bus", icon: "🚌" },
  { label: "Hostel → Main Gate", value: "Hostel → Main Gate", icon: "🏠" },
  { label: "Main Gate → Hostel", value: "Main Gate → Hostel", icon: "🚪" },
  { label: "Velachery → Main Gate", value: "Velachery Gate → Main Gate", icon: "🔄" },
  { label: "Velachery → Hostel", value: "Velachery Gate → Hostel", icon: "🔄" },
  { label: "RP → ED", value: "Research Park → ED", icon: "🏢" },
  { label: "ED → RP", value: "ED → Research Park", icon: "🏢" },
];

const SCHEDULE_TABS = [
  "Hostel → Main Gate",
  "Main Gate → Hostel",
  "Velachery Gate → Main Gate",
  "Velachery Gate → Hostel",
  "Research Park → ED",
  "ED → Research Park",
];

const SCHEDULE_DATA = {
  "Hostel → Main Gate": {
    times: [
      "06:10 AM", "06:30 AM", "06:50 AM", "07:10 AM", "07:30 AM", "07:50 AM", "08:10 AM",
      "08:30 AM", "08:50 AM", "09:10 AM", "09:30 AM", "09:50 AM", "10:10 AM", "10:30 AM",
      "10:50 AM", "11:10 AM", "11:30 AM", "11:50 AM", "12:10 PM", "12:30 PM", "12:50 PM",
      "01:10 PM", "01:30 PM", "01:50 PM", "02:10 PM", "02:30 PM", "02:50 PM", "03:10 PM",
      "03:30 PM", "03:50 PM", "04:10 PM", "04:30 PM", "04:50 PM", "05:10 PM", "05:30 PM",
      "05:50 PM", "06:10 PM", "06:30 PM", "06:50 PM", "07:10 PM", "07:30 PM", "07:50 PM",
      "08:10 PM", "08:30 PM", "08:50 PM", "09:10 PM",
    ],
    notes: [],
  },
  "Main Gate → Hostel": {
    times: [
      "06:20 AM", "06:40 AM", "07:00 AM", "07:20 AM", "07:40 AM", "08:00 AM", "08:20 AM",
      "08:40 AM", "09:00 AM", "09:20 AM", "09:40 AM", "10:00 AM", "10:20 AM", "10:40 AM",
      "11:00 AM", "11:20 AM", "11:40 AM", "12:00 PM", "12:20 PM", "12:40 PM", "01:00 PM",
      "01:20 PM", "01:40 PM", "02:00 PM", "02:20 PM", "02:40 PM", "03:00 PM", "03:20 PM",
      "03:40 PM", "04:00 PM", "04:20 PM", "04:40 PM", "05:00 PM", "05:20 PM", "05:40 PM",
      "06:00 PM", "06:20 PM", "06:40 PM", "07:00 PM", "07:20 PM", "07:40 PM", "08:00 PM",
      "08:20 PM", "08:40 PM", "09:00 PM", "09:20 PM",
    ],
    notes: [
      { time: "09:40 PM", text: "To Velachery Gate" },
      { time: "10:00 PM", text: "To Velachery Gate" },
    ],
  },
  "Velachery Gate → Main Gate": {
    times: [
      "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM",
      "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
      "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM",
    ],
    notes: [],
  },
  "Velachery Gate → Hostel": {
    times: [
      "06:40 AM", "07:10 AM", "07:40 AM", "08:10 AM", "08:40 AM", "09:10 AM", "09:40 AM",
      "10:10 AM", "10:40 AM", "11:10 AM", "11:40 AM", "12:10 PM", "12:40 PM", "01:10 PM",
      "01:40 PM", "02:10 PM", "02:40 PM", "03:10 PM", "03:40 PM", "04:10 PM", "04:40 PM",
      "05:10 PM", "05:40 PM", "06:10 PM", "06:40 PM", "07:10 PM",
    ],
    notes: [],
  },
  "Research Park → ED": {
    times: [
      "08:45 AM", "09:15 AM", "09:45 AM", "10:15 AM", "10:45 AM", "11:15 AM", "11:45 AM",
      "12:15 PM", "12:45 PM", "01:15 PM", "01:45 PM", "02:15 PM", "02:45 PM", "03:15 PM",
      "03:45 PM", "04:15 PM", "04:45 PM", "05:15 PM", "05:45 PM",
    ],
    notes: [],
  },
  "ED → Research Park": {
    times: [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
      "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM",
    ],
    notes: [],
  },
};

/* ─── Simulated Vehicle Data ─── */
const MOCK_VEHICLES = [
  { id: 1, type: "bus", name: "Bus 01", lat: 12.9942, lng: 80.2310, route: "Hostel → Main Gate" },
  { id: 2, type: "bus", name: "Bus 02", lat: 12.9900, lng: 80.2380, route: "Main Gate → Hostel" },
  { id: 3, type: "bus", name: "Bus 03", lat: 12.9870, lng: 80.2290, route: "Hostel → Main Gate" },
  { id: 4, type: "bus", name: "Bus 04", lat: 12.9960, lng: 80.2350, route: "Velachery Gate → Main Gate" },
  { id: 5, type: "bus", name: "Bus 05", lat: 12.9925, lng: 80.2400, route: "Velachery Gate → Hostel" },
  { id: 6, type: "bus", name: "Bus 06", lat: 12.9880, lng: 80.2320, route: "Research Park → ED" },
  { id: 7, type: "bus", name: "Bus 07", lat: 12.9935, lng: 80.2280, route: "ED → Research Park" },
  { id: 8, type: "cart", name: "Cart A", lat: 12.9910, lng: 80.2355, route: "Hostel → Main Gate" },
  { id: 9, type: "cart", name: "Cart B", lat: 12.9890, lng: 80.2340, route: "Main Gate → Hostel" },
  { id: 10, type: "cart", name: "Cart C", lat: 12.9950, lng: 80.2370, route: "Hostel → Main Gate" },
  { id: 11, type: "cart", name: "Cart D", lat: 12.9930, lng: 80.2305, route: "Main Gate → Hostel" },
  { id: 12, type: "cart", name: "Cart E", lat: 12.9870, lng: 80.2365, route: "Velachery Gate → Main Gate" },
  { id: 13, type: "bus", name: "Bus 08", lat: 12.9905, lng: 80.2295, route: "Hostel → Main Gate" },
  { id: 14, type: "cart", name: "Cart F", lat: 12.9945, lng: 80.2325, route: "Velachery Gate → Hostel" },
  { id: 15, type: "bus", name: "Bus 09", lat: 12.9918, lng: 80.2415, route: "Research Park → ED" },
  { id: 16, type: "cart", name: "Cart G", lat: 12.9888, lng: 80.2385, route: "ED → Research Park" },
  { id: 17, type: "bus", name: "Bus 10", lat: 12.9855, lng: 80.2330, route: "Hostel → Main Gate" },
];

/* ─── Helper: Parse 12-hour time string to today's Date ─── */
function parseScheduleTime(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/* ─── Helper: Find next bus across all routes ─── */
function findNextBus(currentFilter) {
  const now = new Date();
  let nextBus = null;

  // Determine which routes to check
  const routesToCheck =
    currentFilter === "All Vehicles" || currentFilter === "Cart" || currentFilter === "Bus"
      ? SCHEDULE_TABS
      : [currentFilter];

  for (const route of routesToCheck) {
    const data = SCHEDULE_DATA[route];
    if (!data) continue;
    for (const timeStr of data.times) {
      const t = parseScheduleTime(timeStr);
      if (t > now) {
        const diff = t - now;
        if (!nextBus || diff < nextBus.diff) {
          nextBus = { route, time: timeStr, diff, date: t };
        }
        break; // this route's next bus found, move to next route
      }
    }
  }

  return nextBus;
}

/* ─── Helper: Format countdown ─── */
function formatCountdown(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

/* ─── Custom Leaflet Icons ─── */
function createBusIcon() {
  return L.divIcon({
    className: "vehicle-marker",
    html: `<div class="marker-bus">
      <svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createCartIcon() {
  return L.divIcon({
    className: "vehicle-marker",
    html: `<div class="marker-cart">C</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const busIcon = createBusIcon();
const cartIcon = createCartIcon();

/* ─── Map Recenter Component ─── */
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

/* ─── Live Clock Hook ─── */
function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

/* ─── Schedule Modal ─── */
function ScheduleModal({ onClose }) {
  const [activeTab, setActiveTab] = useState(SCHEDULE_TABS[0]);
  const scheduleData = SCHEDULE_DATA[activeTab];
  const now = useLiveClock();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Find the next upcoming time for the active tab
  const nextTimeIndex = useMemo(() => {
    for (let i = 0; i < scheduleData.times.length; i++) {
      const t = parseScheduleTime(scheduleData.times[i]);
      if (t > now) return i;
    }
    return -1;
  }, [scheduleData.times, now]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <img
              src={IIT_LOGO}
              alt="IIT Madras"
              className="modal-logo"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <h2 className="modal-title">
              Campus Bus & Cart Schedule
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          {SCHEDULE_TABS.map((tab) => (
            <button
              key={tab}
              className={`modal-tab ${tab === activeTab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="modal-content">
          <h3 className="route-title">{activeTab}</h3>
          <div className="time-grid">
            {scheduleData.times.map((time, i) => {
              const isPast = i < nextTimeIndex || nextTimeIndex === -1;
              const isNext = i === nextTimeIndex;
              return (
                <div
                  key={i}
                  className={`time-chip${isNext ? " is-next" : ""}${isPast ? " is-past" : ""}`}
                >
                  {time}
                </div>
              );
            })}
          </div>

          {scheduleData.notes.map((note, i) => (
            <div key={i} className="time-note">
              <strong>{note.time}</strong> – {note.text}
            </div>
          ))}

          <div className="feedback-note">
            <a href="mailto:bustransport@iitm.ac.in">bustransport@iitm.ac.in</a>{" "}
            – For your feedback/complaints, please send a mail here.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Page ─── */
function AdminPage({ onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h2>Admin Login</h2>
        <p>Moving Mountains Control Panel</p>
        <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); onBack(); }}>
          ← Back to Map
        </a>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-login">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
function App() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [filter, setFilter] = useState("All Vehicles");
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [mapCenter, setMapCenter] = useState(IITM_CENTER);
  const now = useLiveClock();

  /* Simulate vehicle movement */
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          lat: v.lat + (Math.random() - 0.5) * 0.0004,
          lng: v.lng + (Math.random() - 0.5) * 0.0004,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Filter vehicles */
  const filteredVehicles = vehicles.filter((v) => {
    if (filter === "All Vehicles") return true;
    if (filter === "Cart") return v.type === "cart";
    if (filter === "Bus") return v.type === "bus";
    return v.route === filter;
  });

  /* Compute vehicle count per filter */
  const vehicleCounts = useMemo(() => {
    const counts = {};
    for (const opt of FILTER_OPTIONS) {
      if (opt.value === "All Vehicles") {
        counts[opt.value] = vehicles.length;
      } else if (opt.value === "Cart") {
        counts[opt.value] = vehicles.filter((v) => v.type === "cart").length;
      } else if (opt.value === "Bus") {
        counts[opt.value] = vehicles.filter((v) => v.type === "bus").length;
      } else {
        counts[opt.value] = vehicles.filter((v) => v.route === opt.value).length;
      }
    }
    return counts;
  }, [vehicles]);

  /* Find next bus */
  const nextBus = useMemo(() => findNextBus(filter), [filter, now]);

  const handleRefresh = useCallback(() => {
    setMapCenter([...IITM_CENTER]);
  }, []);

  /* Format the live clock */
  const clockStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (showAdmin) {
    return <AdminPage onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="app">
      {/* Full-Screen Map */}
      <div className="map-fullscreen">
        <MapContainer
          center={IITM_CENTER}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={mapCenter} />
          {filteredVehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={v.type === "bus" ? busIcon : cartIcon}
            >
              <Popup>
                <div>
                  <strong style={{ fontSize: "14px" }}>{v.name}</strong>
                  <br />
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{v.route}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ─── Floating Header Card ─── */}
      <div className="header-card">
        {/* Top row: Logo + Title + Clock + Admin */}
        <div className="header-top">
          <div className="header-left">
            <img
              src={IIT_LOGO}
              alt="IIT Madras"
              className="header-logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <h1 className="header-title">Moving Mountains</h1>
          </div>
          <div className="header-right">
            <div className="live-clock">
              <span className="clock-icon">🕐</span>
              <span>{clockStr}</span>
            </div>
            <a
              href="#"
              className="admin-link"
              onClick={(e) => {
                e.preventDefault();
                setShowAdmin(true);
              }}
            >
              Admin ↗
            </a>
          </div>
        </div>

        {/* Status row */}
        <div className="status-row">
          <div className="status-badge">
            <span className="status-dot"></span>
            Live
          </div>
          <span className="vehicle-count">
            {filteredVehicles.length} / {vehicles.length}
            <span className="count-label">vehicles</span>
          </span>
        </div>

        {/* Next Bus Countdown */}
        {nextBus && (
          <div className="next-bus-banner">
            <span className="next-bus-icon">🚌</span>
            <div className="next-bus-info">
              <div className="next-bus-label">Next Bus</div>
              <div className="next-bus-route">{nextBus.route} at {nextBus.time}</div>
            </div>
            <div className={`next-bus-time${nextBus.diff < 300000 ? " urgent" : ""}`}>
              {formatCountdown(nextBus.diff)}
            </div>
          </div>
        )}

        {/* Quick Route Chips */}
        <div className="route-chips">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`route-chip${filter === opt.value ? " active" : ""}`}
              onClick={() => setFilter(opt.value)}
            >
              <span className="chip-icon">{opt.icon}</span>
              {opt.label}
              <span className="chip-count">{vehicleCounts[opt.value]}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="controls-row">
          <button className="btn-refresh" onClick={handleRefresh}>
            🔄 Recenter
          </button>
          <button
            className="btn-schedule"
            onClick={() => setShowSchedule(true)}
          >
            📅 Schedule
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span className="footer-dot"></span>
          <span>Amit Kumar | CE20B009 | MInT Lab</span>
        </div>
        <div className="footer-right">
          <a
            href="https://forms.gle/9ydf7wbDwctUCHKs7"
            target="_blank"
            rel="noreferrer"
          >
            💬 Feedback ↗
          </a>
        </div>
      </footer>

      {/* Schedule Modal */}
      {showSchedule && (
        <ScheduleModal onClose={() => setShowSchedule(false)} />
      )}
    </div>
  );
}

export default App;
