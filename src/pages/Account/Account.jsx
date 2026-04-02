import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { checkMembership } from '../../services/strapi';
import {
  User, Mail, LogOut, Crown, MapPin, Bell,
  ChevronRight, Shield, RefreshCw, ExternalLink, Loader
} from 'lucide-react';
import './Account.scss';

export default function Account() {
  const navigate = useNavigate();
  const { user, isPremium, premiumPlan, logout, updateProfile } = useAuthStore();
  const userLocation = useSettingsStore((s) => s.userLocation);
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.username || '');
  const [checkingMembership, setCheckingMembership] = useState(false);
  const [membershipMsg, setMembershipMsg] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveName = async () => {
    if (nameValue.trim()) {
      try {
        await updateProfile({ firstName: nameValue.trim() });
      } catch {
        // silent
      }
    }
    setEditName(false);
  };

  const handleCheckMembership = async () => {
    setCheckingMembership(true);
    setMembershipMsg(null);
    try {
      const res = await checkMembership();
      if (res.isPremium || res.premiumApps?.premiumLynx) {
        useAuthStore.getState().setPremium(res.tierName || 'Fourthwall');
        setMembershipMsg({ type: 'success', text: 'Statut Premium activé avec succès !' });
      } else {
        setMembershipMsg({ type: 'info', text: 'Aucun abonnement Premium actif trouvé pour LYNX.' });
      }
    } catch {
      setMembershipMsg({ type: 'error', text: 'Impossible de vérifier. Réessayez plus tard.' });
    }
    setCheckingMembership(false);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="account">
      <h1 className="account__title">Mon compte</h1>

      {/* Profile card */}
      <section className="account__profile">
        <div className="account__avatar">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="account__avatar-img" />
          ) : (
            <div className="account__avatar-placeholder">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="account__info">
          {editName ? (
            <div className="account__edit-name">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                className="account__name-input"
                autoFocus
              />
              <button onClick={handleSaveName} className="account__save-btn">OK</button>
            </div>
          ) : (
            <button onClick={() => setEditName(true)} className="account__name">
              {user.username}
            </button>
          )}
          <p className="account__email">{user.email}</p>
          {isPremium && (
            <div className="account__premium-badge">
              <Crown size={14} />
              <span>{premiumPlan || 'Premium'}</span>
            </div>
          )}
        </div>
      </section>

      {/* Premium status */}
      {isPremium ? (
        <section className="account__premium-active">
          <Crown size={20} className="account__premium-active-icon" />
          <div>
            <h3>Premium actif</h3>
            <p>{premiumPlan || 'Abonnement Fourthwall'}</p>
          </div>
        </section>
      ) : (
        <section className="account__upgrade-section">
          <div className="account__upgrade" onClick={() => navigate('/pricing')}>
            <Crown size={20} className="account__upgrade-icon" />
            <div className="account__upgrade-body">
              <h3>Passer à Premium</h3>
              <p>Zones illimitées, refresh 1 min, alertes push prioritaires</p>
            </div>
            <ChevronRight size={16} className="account__upgrade-arrow" />
          </div>
          <button
            onClick={handleCheckMembership}
            disabled={checkingMembership}
            className="account__check-membership"
          >
            {checkingMembership ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
            Vérifier mon abonnement Fourthwall
          </button>
          {membershipMsg && (
            <p className={`account__membership-msg account__membership-msg--${membershipMsg.type}`}>
              {membershipMsg.text}
            </p>
          )}
        </section>
      )}

      {/* Account info */}
      <section className="account__section">
        <h3 className="account__section-title">Informations</h3>

        <div className="account__row">
          <User size={18} />
          <div className="account__row-body">
            <p className="account__row-label">Nom</p>
            <p className="account__row-value">{user.username}</p>
          </div>
        </div>

        <div className="account__row">
          <Mail size={18} />
          <div className="account__row-body">
            <p className="account__row-label">Email</p>
            <p className="account__row-value">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Settings summary */}
      <section className="account__section">
        <h3 className="account__section-title">Paramètres rapides</h3>

        <div className="account__row" onClick={() => navigate('/settings')}>
          <MapPin size={18} />
          <div className="account__row-body">
            <p className="account__row-label">Localisation</p>
            <p className="account__row-value">{userLocation.label}</p>
          </div>
          <ChevronRight size={16} />
        </div>

        <div className="account__row" onClick={() => navigate('/settings')}>
          <Bell size={18} />
          <div className="account__row-body">
            <p className="account__row-label">Notifications</p>
            <p className="account__row-value">Configurer</p>
          </div>
          <ChevronRight size={16} />
        </div>

        <div className="account__row" onClick={() => navigate('/settings')}>
          <Shield size={18} />
          <div className="account__row-body">
            <p className="account__row-label">Zones surveillées</p>
            <p className="account__row-value">Gérer</p>
          </div>
          <ChevronRight size={16} />
        </div>
      </section>

      {/* Logout */}
      <button onClick={handleLogout} className="account__logout">
        <LogOut size={18} />
        Se déconnecter
      </button>
    </div>
  );
}
