import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import LOCATIONS from '../locations.json'
import { EDICOES, getEditionDisplayNumber } from '../lib/site'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const createStationIcon = color =>
  L.divIcon({
    className: 'custom-station-icon',
    html: `<div class="station-dot" style="border-color: ${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

function MapRecenter({ coords }) {
  const map = useMap()

  useEffect(() => {
    map.setView(coords, 14)
  }, [coords, map])

  return null
}

export default function MapaView({ setView, setEdicaoAtiva }) {
  const { t } = useTranslation()
  const [activeLocation, setActiveLocation] = useState(null)
  const [center, setCenter] = useState([52.501, 13.41])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="mapa-view">
      <button className="mapa-toggle-btn" onClick={() => setSidebarOpen(open => !open)}>
        {sidebarOpen ? t('map.closeList') : t('map.openList')}
      </button>
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="sidebar-header">
          <h1>{t('map.title')}</h1>
        </header>
        <div className="sidebar-content">
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            {t('map.subtitle')}
          </p>
          {LOCATIONS.map(location => (
            <div
              key={location.id}
              className="location-item"
              onClick={() => {
                setCenter(location.coords)
                setActiveLocation(location.id)
              }}
              style={activeLocation === location.id ? { borderLeft: `8px solid ${location.color}` } : {}}
            >
              {location.imageUrl && (
                <img src={location.imageUrl} alt={location.name} className="location-img-thumb" referrerPolicy="no-referrer" />
              )}
              <h2>{location.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span className="u-line-tag" style={{ backgroundColor: location.color }}>
                  {location.line}
                </span>
                <span style={{ fontSize: '12px', color: '#888' }}>{t('map.city')}</span>
              </div>
              <p>{location.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {LOCATIONS.map(location => (
            <Marker
              key={location.id}
              position={location.coords}
              icon={createStationIcon(location.color)}
              eventHandlers={{ click: () => setActiveLocation(location.id) }}
            >
              <Popup>
                <div className="popup-title" style={{ backgroundColor: location.color }}>
                  {location.name}
                </div>
                <div className="popup-body">
                  {location.imageUrl && (
                    <img src={location.imageUrl} alt={location.name} className="popup-img" referrerPolicy="no-referrer" />
                  )}
                  <p style={{ margin: '0 0 8px', fontSize: '13px' }}>{location.description}</p>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#888' }}>{t('map.line', { line: location.line })}</span>
                  {location.edicaoId && (() => {
                    const edicao = EDICOES.find(item => item.id === location.edicaoId)
                    return edicao ? (
                      <button
                        onClick={() => {
                          setEdicaoAtiva(edicao)
                          setView('edicao')
                        }}
                        style={{
                          display: 'block',
                          marginTop: '10px',
                          width: '100%',
                          padding: '7px',
                          background: '#111',
                          color: 'white',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {t('map.readEdition', { id: String(getEditionDisplayNumber(edicao)).padStart(2, '0') })}
                      </button>
                    ) : null
                  })()}
                </div>
              </Popup>
            </Marker>
          ))}
          <MapRecenter coords={center} />
        </MapContainer>
      </div>
    </div>
  )
}
