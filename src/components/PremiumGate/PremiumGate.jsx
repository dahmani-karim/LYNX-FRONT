import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Crown, Lock } from 'lucide-react';
import './PremiumGate.scss';

export default function PremiumGate({ feature, children }) {
  const navigate = useNavigate();
  const isPremium = useAuthStore((s) => s.isPremium);

  if (isPremium) return children;

  return (
    <div className="premium-gate" onClick={() => navigate('/pricing')}>
      <div className="premium-gate__overlay">
        <Lock size={20} />
        <p className="premium-gate__label">
          <Crown size={14} /> Premium requis
        </p>
        {feature && <p className="premium-gate__feature">{feature}</p>}
      </div>
      <div className="premium-gate__blur">{children}</div>
    </div>
  );
}
