import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Crown, Lock } from 'lucide-react';
import './PremiumGate.scss';

export default function PremiumGate({ feature, children }) {
  const navigate = useNavigate();
  const isPremium = useAuthStore((s) => s.isPremium);

  if (isPremium) return children;

  // Don't render real children — prevents devtools bypass
  return (
    <div className="premium-gate" onClick={() => navigate('/pricing')}>
      <div className="premium-gate__overlay">
        <Lock size={24} />
        <p className="premium-gate__label">
          <Crown size={14} /> Premium requis
        </p>
        {feature && <p className="premium-gate__feature">{feature}</p>}
        <p className="premium-gate__cta">Voir les offres →</p>
      </div>
    </div>
  );
}
