import { useMemo } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import ScoreGauge from '../../components/ScoreGauge/ScoreGauge';
import AlertCard from '../../components/AlertCard/AlertCard';
import DeltaPanel from '../../components/DeltaPanel/DeltaPanel';
import NewsTicker from '../../components/NewsTicker/NewsTicker';
import EcosystemBridge from '../../components/EcosystemBridge/EcosystemBridge';
import PremiumGate from '../../components/PremiumGate/PremiumGate';
import Loader from '../../components/Loader/Loader';
import { CATEGORIES } from '../../config/categories';
import { getScoreColor } from '../../services/riskEngine';
import { findCorrelations, generateInsights } from '../../services/correlationEngine';
import { getPredictiveAlerts } from '../../services/predictiveEngine';
import { checkGeofences } from '../../utils/geofencing';
import { RefreshCw, MapPin, Thermometer, Wind, Droplets, Link2, TrendingUp, Crosshair, ChevronRight, Sun, Gauge, CloudRain, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.scss';

export default function Dashboard() {
  const { events, riskScores, weatherData, airQualityData, isLoading, errors } = useAlertStore();
  const { userLocation, zones } = useSettingsStore();
  const isPremium = useAuthStore((s) => s.isPremium);

  const topAlerts = [...events]
    .filter((e) => new Date(e.eventDate).getTime() <= Date.now())
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 5);

  const moduleKeys = useMemo(
    () =>
      Object.keys(CATEGORIES)
        .filter((k) => k !== 'other')
        .sort((a, b) => {
          const scoreDiff = (riskScores[b] || 0) - (riskScores[a] || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return (
            events.filter((e) => e.type === b).length -
            events.filter((e) => e.type === a).length
          );
        }),
    [riskScores, events]
  );

  const moduleCounts = useMemo(() => {
    const counts = {};
    for (const key of moduleKeys) {
      counts[key] = events.filter((e) => e.type === key).length;
    }
    return counts;
  }, [events, moduleKeys]);

  const insights = useMemo(() => {
    const correlations = findCorrelations(events);
    return generateInsights(correlations);
  }, [events]);

  const predictions = useMemo(() => getPredictiveAlerts(events), [events]);

  const zoneMatches = useMemo(() => checkGeofences(events, zones), [events, zones]);

  if (isLoading && events.length === 0) {
    return <Loader text="Analyse des données en cours..." />;
  }

  function aqiColor(severity) {
    if (severity === 'critical') return '#EF4444';
    if (severity === 'high') return '#F97316';
    if (severity === 'medium') return '#F59E0B';
    if (severity === 'low') return '#84CC16';
    return '#10B981';
  }
  
  return (
    <div className="dashboard">
      {/* 1. NewsTicker */}
      <NewsTicker events={events} />

      {/* 2. Top row: Risk score + Weather + Delta Panel */}
      <div className="dashboard__top-row">
        <section className="dashboard__risk-card">
          <div className="dashboard__risk-header">
            <div>
              <h2 className="dashboard__risk-title">Score de risque global</h2>
              <div className="dashboard__risk-location">
                <MapPin size={12} />
                <span>{userLocation.label}</span>
              </div>
            </div>
            {isLoading && <RefreshCw size={16} style={{ color: '#9CA3AF' }} className="animate-spin" />}
          </div>
          <div className="dashboard__risk-gauge">
            <ScoreGauge score={riskScores.global} size={140} strokeWidth={10} />
          </div>
        </section>

        {weatherData?.current && (
          <section className="dashboard__weather">
            <h3 className="dashboard__weather-title">Conditions actuelles</h3>
            <div className="dashboard__weather-grid">
              <div className="dashboard__weather-item">
                <Thermometer size={18} style={{ color: '#F59E0B' }} />
                <div>
                  <p className="dashboard__weather-value">{weatherData.current.temperature}°C</p>
                  <p className="dashboard__weather-sub">Ressenti {weatherData.current.feelsLike}°C</p>
                </div>
              </div>
              <div className="dashboard__weather-item">
                <Wind size={18} style={{ color: '#60A5FA' }} />
                <div>
                  <p className="dashboard__weather-label">{weatherData.current.windSpeed} km/h</p>
                  <p className="dashboard__weather-sub">Vent</p>
                </div>
              </div>
              <div className="dashboard__weather-item">
                <Droplets size={18} style={{ color: '#6366F1' }} />
                <div>
                  <p className="dashboard__weather-label">{weatherData.current.humidity}%</p>
                  <p className="dashboard__weather-sub">Humidité</p>
                </div>
              </div>
            </div>

            <div className="dashboard__weather-divider" />

            <div className="dashboard__weather-grid dashboard__weather-grid--secondary">
              {airQualityData && (
                <div className="dashboard__weather-item">
                  <Leaf size={16} style={{ color: aqiColor(airQualityData.severity) }} />
                  <div>
                    <p className="dashboard__weather-label">
                      <span
                        className="dashboard__weather-aqi-badge"
                        style={{ backgroundColor: aqiColor(airQualityData.severity) }}
                      >
                        {airQualityData.euAqi}
                      </span>
                      {airQualityData.label}
                    </p>
                    <p className="dashboard__weather-sub">Qualité air</p>
                  </div>
                </div>
              )}
              {weatherData.daily?.uv_index_max?.[0] != null && (
                <div className="dashboard__weather-item">
                  <Sun size={16} style={{ color: '#FBBF24' }} />
                  <div>
                    <p className="dashboard__weather-label">UV {weatherData.daily.uv_index_max[0]}</p>
                    <p className="dashboard__weather-sub">Index UV</p>
                  </div>
                </div>
              )}
              {weatherData.current.pressure != null && (
                <div className="dashboard__weather-item">
                  <Gauge size={16} style={{ color: '#A78BFA' }} />
                  <div>
                    <p className="dashboard__weather-label">{Math.round(weatherData.current.pressure)} hPa</p>
                    <p className="dashboard__weather-sub">Pression</p>
                  </div>
                </div>
              )}
              {weatherData.daily?.precipitation_sum?.[0] != null && (
                <div className="dashboard__weather-item">
                  <CloudRain size={16} style={{ color: '#38BDF8' }} />
                  <div>
                    <p className="dashboard__weather-label">{weatherData.daily.precipitation_sum[0]} mm</p>
                    <p className="dashboard__weather-sub">Précip. J</p>
                  </div>
                </div>
              )}
            </div>

            <p className="dashboard__weather-desc">{weatherData.current.description}</p>
          </section>
        )}

        <DeltaPanel />
      </div>

      {/* 3. Module Scores Grid */}
      <section>
        <div className="dashboard__alerts-header">
          <h3 className="dashboard__modules-title">Modules de surveillance</h3>
          <Link to="/stats" className="dashboard__alerts-link">
            Statistiques <ChevronRight size={14} />
          </Link>
        </div>
        <div className="dashboard__modules-grid">
          {moduleKeys.map((key) => {
            const cat = CATEGORIES[key];
            if (!cat) return null;
            const score = riskScores[key] || 0;
            const count = moduleCounts[key] || 0;
            const Icon = cat.icon;
            return (
              <Link
                key={key}
                to={`/alerts?category=${key}`}
                className="dashboard__module-card dashboard__module-card--link"
              >
                <div className="dashboard__module-icon" style={{ backgroundColor: cat.bgColor }}>
                  <Icon size={16} style={{ color: cat.color }} />
                </div>
                <span className="dashboard__module-label">{cat.label}</span>
                <div className="dashboard__module-stats">
                  <span className="dashboard__module-stat">
                    <span className="dashboard__module-stat-value" style={{ color: getScoreColor(score) }}>{score}</span>
                    <span className="dashboard__module-stat-label">risque</span>
                  </span>
                  <span className="dashboard__module-stat-divider" />
                  <span className="dashboard__module-stat">
                    <span className="dashboard__module-stat-value">{count}</span>
                    <span className="dashboard__module-stat-label">alerte{count > 1 ? 's' : ''}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Alertes récentes + Alertes zones (côte à côte) */}
      <div className="dashboard__two-col">
        {topAlerts.length > 0 && (
          <section>
            <div className="dashboard__alerts-header">
              <h3 className="dashboard__alerts-title">Alertes récentes ({events.length})</h3>
              <Link to="/alerts" className="dashboard__alerts-link">
                Toutes les alertes <ChevronRight size={14} />
              </Link>
            </div>
            <div className="dashboard__alerts-list dashboard__alerts-list--single">
              {topAlerts.map((event) => (
                <AlertCard key={event.id} event={event} compact />
              ))}
            </div>
          </section>
        )}

        {zoneMatches.length > 0 && (
          <section className="dashboard__insights">
            <h3 className="dashboard__insights-title">
              <Crosshair size={16} />
              Alertes dans vos zones ({zoneMatches.length})
            </h3>
            <div className="dashboard__insights-list">
              {zoneMatches.slice(0, 5).map((m, i) => (
                <div key={i} className={`dashboard__insight dashboard__insight--${m.event.severity === 'critical' || m.event.severity === 'high' ? 'high' : 'medium'}`}>
                  <p className="dashboard__insight-label">{m.event.title}</p>
                  <p className="dashboard__insight-desc">
                    Zone « {m.zone.label} » · {m.distanceKm} km · {m.event.sourceName}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 5. Corrélations + Tendances prédictives (côte à côte) */}
      {(insights.length > 0 || predictions.length > 0) && (
        <div className="dashboard__two-col">
          {/* Correlations & Insights */}
          {insights.length > 0 && (
            <section className="dashboard__insights">
              <div className="dashboard__alerts-header">
                <h3 className="dashboard__insights-title">
                  <Link2 size={16} />
                  Corrélations détectées
                </h3>
                <Link to="/analysis" className="dashboard__alerts-link">
                  Voir l'analyse complète <ChevronRight size={14} />
                </Link>
              </div>
              <div className="dashboard__insights-list">
                {insights.slice(0, isPremium ? 5 : 1).map((insight, i) => (
                  <div key={i} className={`dashboard__insight dashboard__insight--${insight.severity}`}>
                    <p className="dashboard__insight-label">{insight.title}</p>
                    <p className="dashboard__insight-desc">{insight.description}</p>
                  </div>
                ))}
                {!isPremium && insights.length > 1 && (
                  <p className="dashboard__insight-premium">
                    +{insights.length - 1} corrélation{insights.length > 2 ? 's' : ''} — Premium pour tout voir
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Predictive Alerts */}
          {predictions.length > 0 && (
            <PremiumGate feature="Tendances prédictives">
              <section className="dashboard__insights">
                <div className="dashboard__alerts-header">
                  <h3 className="dashboard__insights-title">
                    <TrendingUp size={16} />
                    Tendances prédictives
                  </h3>
                  <Link to="/analysis" className="dashboard__alerts-link">
                    Voir l'analyse complète <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="dashboard__insights-list">
                  {predictions.slice(0, 2).map((pred, i) => (
                    <div key={i} className={`dashboard__insight dashboard__insight--${pred.severity}`}>
                      <p className="dashboard__insight-label" style={{ color: pred.color }}>{pred.label}</p>
                      <p className="dashboard__insight-desc">{pred.message}</p>
                    </div>
                  ))}
                </div>
              </section>
            </PremiumGate>
          )}
        </div>
      )}

      {/* 6. EcosystemBridge */}
      <EcosystemBridge events={events} />

      {/* Errors */}
      {Object.keys(errors).length > 0 && (
        <section className="dashboard__errors">
          <p className="dashboard__errors-title">Modules indisponibles</p>
          {Object.entries(errors).map(([key, msg]) => (
            <p key={key} className="dashboard__errors-item">
              {CATEGORIES[key]?.label || key} : en attente
            </p>
          ))}
        </section>
      )}

      {/* Disclaimer */}
      <p className="dashboard__disclaimer">
        Données à titre informatif uniquement. LYNX ne se substitue pas aux autorités officielles.
        En cas de danger immédiat, contactez les services d'urgence (112).
      </p>
    </div>
  );
}
