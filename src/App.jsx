import React, { useState, useEffect, useRef } from 'react';
import { Home, MapPin, BedDouble, Bath, ExternalLink, CheckCircle, Info, Menu, X, ChevronRight, Check, Settings, Plus, Trash2, Edit, Lock } from 'lucide-react';

// Use a relative API base so requests go to the same origin (works with nginx proxy or
// when serving the frontend from the same host). Keep it simple: `/api`.
const API_BASE = '/api';

// --- COMPONENTS ---

const Header = ({ setView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('grid')}>
            <img src="/uhd_logo.svg" alt="Urban Housing Detroit logo" className="h-14 w-auto brightness-0 invert" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white font-extrabold text-lg">Urban Housing Detroit</span>
              <span className="text-slate-300 text-sm">Metro Detroit Rentals</span>
            </div>
            <span className="sr-only">Urban Housing Detroit</span>
          </div>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <button onClick={() => setView('grid')} className="text-gray-300 hover:text-white transition-colors">Properties</button>
            <button onClick={() => setView('map')} className="text-gray-300 hover:text-white transition-colors">Map View</button>
            <a href="https://resident.stessa.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Tenant Portal</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About Us</a>
            <a href="mailto:contact@example.com" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Contact
            </a>
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => { setView('grid'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded-md">Properties</button>
            <button onClick={() => { setView('map'); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded-md">Map View</button>
            <a href="https://app.stessa.com/" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded-md">Tenant Portal</a>
            <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-700 rounded-md">About Us</a>
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = () => (
  <div className="bg-slate-100 py-16 sm:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
        Elevating the <span className="text-blue-600">Detroit Rental Experience</span>
      </h1>
      <p className="max-w-xl mt-5 mx-auto text-xl text-slate-500">
        Discover your next home in our curated portfolio of modern, thoughtfully maintained properties across Metro Detroit. 
      </p>
    </div>
  </div>
);

const PropertyCard = ({ property, onClick }) => {
  const isVacant = property.status === 'Vacant';

  return (
    <div 
      onClick={() => onClick(property)}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full group transform hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={property.imageUrl} 
          alt={property.address} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${
            isVacant 
              ? 'bg-green-100/90 text-green-800 border border-green-200' 
              : 'bg-slate-100/90 text-slate-600 border border-slate-200'
          }`}>
            {isVacant ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            {property.status}
          </span>
        </div>
        {isVacant && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-lg font-bold shadow-sm">
              ${property.rent.toLocaleString()}<span className="text-sm font-normal text-slate-300">/mo</span>
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{property.address}</h3>
              <div className="flex items-center text-slate-500 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                {property.city}, {property.state} {property.zip}
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm mt-4 line-clamp-2">
            {property.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 py-4 border-t border-b border-slate-100">
            <div className="flex flex-col items-center">
              <BedDouble className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-sm font-semibold text-slate-700">{property.bedrooms} Bed</span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-slate-100">
              <Bath className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-sm font-semibold text-slate-700">{property.bathrooms} Bath</span>
            </div>
            <div className="flex flex-col items-center">
              <Home className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-sm font-semibold text-slate-700">{property.sqft} sqft</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-blue-600 font-medium">
          <span>View Details</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// New Modal Component
const PropertyModal = ({ property, onClose }) => {
  if (!property) return null;
  const isVacant = property.status === 'Vacant';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-sm transition-colors text-slate-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="h-64 sm:h-80 relative flex-shrink-0">
          <img src={property.imageUrl} alt={property.address} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex items-center gap-1.5 ${
              isVacant ? 'bg-green-500 text-white' : 'bg-slate-600 text-white'
            }`}>
              {isVacant ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              {property.status}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              {property.type}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{property.address}</h2>
              <div className="flex items-center text-slate-500 text-lg">
                <MapPin className="w-5 h-5 mr-1" />
                {property.city}, {property.state} {property.zip}
              </div>
            </div>
            {isVacant && (
              <div className="text-left sm:text-right bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider mb-1">Monthly Rent</div>
                <div className="text-3xl font-extrabold text-slate-900">${property.rent.toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">{property.bedrooms}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Beds</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">{property.bathrooms}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Baths</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <Home className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">{property.sqft}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Sqft</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">About this property</h3>
                <p className="text-slate-600 leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Amenities</h3>
              <ul className="space-y-3">
                {property.amenities?.map((amenity, idx) => (
                  <li key={idx} className="flex items-start text-slate-600">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            {property.listingLink && (
              <a 
                href={property.listingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                View Full Photo Gallery
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            
            {isVacant ? (
              <a 
                href={property.applicationLink || "https://app.stessa.com/"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors shadow-sm"
              >
                Apply for this property
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <button disabled className="flex-1 py-4 px-6 rounded-xl font-bold text-lg bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200">
                Currently Leased
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractiveMap = ({ properties, onPropertyClick }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    let mapInstance = null;

    const initMap = () => {
      if (!window.L || mapInstance) return;

      mapInstance = window.L.map('leaflet-map').setView([42.38, -82.95], 11);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapInstance);

      const customIcon = window.L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      properties.forEach(prop => {
        const marker = window.L.marker(prop.coordinates, { icon: customIcon }).addTo(mapInstance);
        
        // Add a click event to the marker directly to open the modal
        marker.on('click', () => {
          onPropertyClick(prop);
        });
      });
    };

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-script')) {
      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      setTimeout(initMap, 500); 
    }

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [properties, onPropertyClick]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
      <div id="leaflet-map" className="w-full h-[600px] rounded-xl z-0"></div>
    </div>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
  const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        // If API rejects, show message (401 will be invalid credentials)
        if (res.status === 401) setError('Invalid username or password');
        else setError('Login failed (server)');
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Save token for future requests
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      onLogin();
    } catch (err) {
      // If API is unreachable, fall back to the previous client-only password (temporary)
      console.warn('API login failed, falling back to client-side password check', err);
      if (password === 'Detroit2026!') {
        onLogin();
      } else {
        setError('Login failed (offline)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center mb-6">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-slate-700" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Admin Access</h2>
        <p className="text-slate-500 text-sm mt-1">Sign in with your admin credentials.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors border-slate-300 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:outline-none transition-colors ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

const AdminDashboard = ({ properties, setProperties }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleSave = (e) => {
    e.preventDefault();
    // Save via API when available
    const save = async () => {
      try {
        if (editingId) {
          const headers = { 'Content-Type': 'application/json' };
          const token = localStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${API_BASE}/properties/${editingId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(formData),
          });
          const updated = await res.json();
          setProperties(properties.map(p => p.id === editingId ? updated : p));
        } else {
          const headers = { 'Content-Type': 'application/json' };
          const token = localStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
          const res = await fetch(`${API_BASE}/properties`, {
            method: 'POST',
            headers,
            body: JSON.stringify(formData),
          });
          const created = await res.json();
          setProperties([...properties, created]);
        }
      } catch (err) {
        // If API is not available, fall back to local-only behavior (in-memory)
        if (editingId) {
          setProperties(properties.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
        } else {
          setProperties([...properties, { ...formData, id: Date.now().toString() }]);
        }
      } finally {
        setIsAdding(false);
        setEditingId(null);
      }
    };
    save();
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    const del = async () => {
      try {
        const headers = {};
        const token = localStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/properties/${id}`, { method: 'DELETE', headers });
        if (res.ok || res.status === 204) {
          setProperties(properties.filter(p => p.id !== id));
        } else {
          // fallback
          setProperties(properties.filter(p => p.id !== id));
        }
      } catch (err) {
        // fallback to local delete
        setProperties(properties.filter(p => p.id !== id));
      }
    };
    del();
  };

  const openEdit = (property) => {
    setFormData(property);
    setEditingId(property.id);
    setIsAdding(true);
  };

  const openAdd = () => {
    setFormData({ status: 'Vacant', type: 'Single Family', coordinates: [42.38, -82.95], amenities: [] });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to read the dimensions
        const img = new Image();
        img.onload = () => {
          // Set maximum dimensions for the thumbnail
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // Draw the resized image to a hidden canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas back to a highly compressed JPEG Base64 string (70% quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          
          setFormData({...formData, imageUrl: compressedBase64});
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  if (isAdding) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Property' : 'Add New Property'}</h2>
          <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input required type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input required type="text" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rent ($)</label>
                <input required type="number" value={formData.rent || ''} onChange={e => setFormData({...formData, rent: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={formData.status || 'Vacant'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail Image</label>
              <div className="flex items-center gap-4">
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Upload a small image (Will be auto-compressed & saved as Base64 text).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">External Listing Link</label>
                <input type="url" placeholder="https://zillow.com/..." value={formData.listingLink || ''} onChange={e => setFormData({...formData, listingLink: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-500 mt-1">Link to Zillow/Apartments.com for the full gallery.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beds</label>
                <input required type="number" value={formData.bedrooms || ''} onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Baths</label>
                <input required type="number" step="0.5" value={formData.bathrooms || ''} onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sqft</label>
                <input required type="number" value={formData.sqft || ''} onChange={e => setFormData({...formData, sqft: Number(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea rows="3" required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">Save Property</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Manage Properties</h2>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Rent</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {properties.map(prop => (
              <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-slate-900">{prop.address}</div>
                  <div className="text-sm text-slate-500">{prop.city}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${prop.status === 'Vacant' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {prop.status}
                  </span>
                </td>
                <td className="p-4 font-medium text-slate-900">${prop.rent}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => openEdit(prop)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(prop.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('grid');
  const [filter, setFilter] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState(null); // State for the modal
  const [properties, setProperties] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Security state
  const [isLoading, setIsLoading] = useState(true);
  // API will run on port 5000 in docker-compose on the Pi. Build an absolute base so
  // the frontend can reach it regardless of Vite or nginx origin.
  // (moved to module scope)

  useEffect(() => {
    // Try the API first, fall back to embedded properties.json (for static demo)
  fetch(`${API_BASE}/properties`)
      .then(res => {
        if (!res.ok) throw new Error('API not available');
        return res.json();
      })
      .then(data => {
        setProperties(data);
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to bundled JSON
        fetch('/properties.json')
          .then(res => res.json())
          .then(data => {
            setProperties(data);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Failed to load properties:', err);
            setIsLoading(false);
          });
      });
  }, []);

  const filteredProperties = properties.filter(p => 
    filter === 'All' ? true : p.status === filter
  );

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProperty]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <Header setView={setView} />
      
      <main>
        {view === 'grid' && <Hero />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-slate-900">
              {view === 'grid' ? 'Our Portfolio' : 'Property Map'}
            </h2>
            
            <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200 inline-flex">
              {['All', 'Vacant', 'Occupied'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === status 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : view === 'admin' ? (
            isAuthenticated ? (
              <AdminDashboard properties={properties} setProperties={setProperties} />
            ) : (
              <AdminLogin onLogin={() => setIsAuthenticated(true)} />
            )
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onClick={setSelectedProperty} 
                />
              ))}
              {filteredProperties.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No properties found matching this filter.
                </div>
              )}
            </div>
          ) : (
            <InteractiveMap 
              properties={filteredProperties} 
              onPropertyClick={setSelectedProperty} 
            />
          )}

        </div>
      </main>

      {/* Render the Modal if a property is selected */}
      <PropertyModal 
        property={selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />

      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/uhd_logo.svg" alt="Urban Housing Detroit" className="h-14 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed">
              Providing high-quality, well-maintained residential properties across the Metro Detroit area. We pride ourselves on responsive management and beautiful homes.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => {setView('grid'); setFilter('Vacant');}} className="hover:text-blue-400 transition-colors">Available Rentals</button></li>
              <li><button onClick={() => {setView('grid'); setFilter('All');}} className="hover:text-blue-400 transition-colors">Full Portfolio</button></li>
              <li><a href="https://app.stessa.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Tenant Portal</a></li>
              <li><button onClick={() => setView('admin')} className="hover:text-blue-400 transition-colors flex items-center gap-1 mt-4 text-slate-500"><Settings className="w-4 h-4"/> Admin Login</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Detroit, MI</li>
              <li><a href="mailto:leasing@example.com" className="hover:text-blue-400 transition-colors">leasing@example.com</a></li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; {new Date().getFullYear()} Urban Housing Detroit LLC. All rights reserved.
        </div>
      </footer>
    </div>
  );
}