import { useState, useEffect } from 'react';
import { fetchFuelPrices, fetchEnergyPrices } from '../../services/fuelPrices';
import Loader from '../../components/Loader/Loader';
import { Fuel, Zap, Flame, TreePine, Droplets, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import './EnergyPrices.scss';

const TYPE_CONFIG = {
  fuel: { icon: Fuel, color: '#14B8A6', label: 'Carburants' },
  electricity: { icon: Zap, color: '#F59E0B', label: 'Électricité' },
  gas: { icon: Flame, color: '#F97316', label: 'Gaz' },
  wood: { icon: TreePine, color: '#22C55E', label: 'Bois' },
};

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={14} className="energy-prices__trend energy-prices__trend--up" />;
  if (trend === 'down') return <TrendingDown size={14} className="energy-prices__trend energy-prices__trend--down" />;
  return <Minus size={14} className="energy-prices__trend energy-prices__trend--stable" />;
}

export default function EnergyPrices() {
  const [fuelPrices, setFuelPrices] = useState([]);
  const [energyPrices, setEnergyPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'fuel' | 'electricity' | 'gas'

  const loadData = async () => {
    setIsLoading(true);
    const [fuels, energy] = await Promise.allSettled([
      fetchFuelPrices(),
      fetchEnergyPrices(),
    ]);
    setFuelPrices(fuels.status === 'fulfilled' ? fuels.value : []);
    setEnergyPrices(energy.status === 'fulfilled' ? energy.value : []);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const allPrices = [...fuelPrices, ...energyPrices];
  const displayPrices = activeTab === 'all'
    ? allPrices
    : allPrices.filter((p) => p.type === activeTab);

  const tabs = [
    { key: 'all', label: 'Tout' },
    { key: 'fuel', label: 'Carburants' },
    { key: 'electricity', label: 'Électricité' },
    { key: 'gas', label: 'Gaz' },
  ];

  if (isLoading && allPrices.length === 0) {
    return <Loader text="Chargement des prix..." />;
  }

  return (
    <div className="energy-prices">
      <div className="energy-prices__header">
        <div>
          <h1 className="energy-prices__title">
            <Droplets size={20} />
            Prix Énergie & Carburants
          </h1>
          <p className="energy-prices__subtitle">
            Fourchettes de prix actuelles en France
          </p>
        </div>
        <button
          className="energy-prices__refresh"
          onClick={loadData}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="energy-prices__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`energy-prices__tab ${activeTab === tab.key ? 'energy-prices__tab--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Price cards */}
      <div className="energy-prices__grid">
        {displayPrices.map((price, i) => {
          const config = TYPE_CONFIG[price.type] || TYPE_CONFIG.fuel;
          const Icon = config.icon;
          return (
            <div key={`${price.name}-${i}`} className="energy-prices__card">
              <div className="energy-prices__card-header">
                <div className="energy-prices__card-icon" style={{ backgroundColor: `${config.color}20` }}>
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                <div className="energy-prices__card-info">
                  <h3 className="energy-prices__card-name">{price.name}</h3>
                  <span className="energy-prices__card-unit">{price.unit}</span>
                </div>
                {price.trend && <TrendIcon trend={price.trend} />}
              </div>

              <div className="energy-prices__card-prices">
                <div className="energy-prices__price-range">
                  <div className="energy-prices__price-bar">
                    <div
                      className="energy-prices__price-fill"
                      style={{
                        backgroundColor: config.color,
                        width: price.min === price.max ? '100%' : '100%',
                      }}
                    />
                  </div>
                  <div className="energy-prices__price-labels">
                    <span className="energy-prices__price energy-prices__price--min">
                      {formatPrice(price.min, price.unit)}
                    </span>
                    {price.min !== price.max && (
                      <span className="energy-prices__price energy-prices__price--max">
                        {formatPrice(price.max, price.unit)}
                      </span>
                    )}
                  </div>
                </div>
                {price.avg && price.min !== price.max && (
                  <p className="energy-prices__avg">
                    Moy. <strong>{formatPrice(price.avg, price.unit)}</strong>
                  </p>
                )}
              </div>

              {price.source && (
                <p className="energy-prices__source">Source : {price.source}</p>
              )}
            </div>
          );
        })}
      </div>

      {displayPrices.length === 0 && (
        <div className="energy-prices__empty">
          <p>Aucune donnée disponible</p>
        </div>
      )}

      {lastUpdate && (
        <p className="energy-prices__footer">
          Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
          <br />
          <span className="energy-prices__disclaimer">
            Les prix affichés sont des fourchettes indicatives. Les prix réels varient selon les stations et fournisseurs.
          </span>
        </p>
      )}
    </div>
  );
}

function formatPrice(value, unit) {
  if (unit === '€/tonne') return `${Math.round(value)}€`;
  return `${value.toFixed(2)}€`;
}
