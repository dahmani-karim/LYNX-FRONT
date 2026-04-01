import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import './Login.scss';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <Link to="/" className="auth-page__logo">
          <span>🐆</span> LYNX
        </Link>

        <div className="auth-page__card">
          <h1 className="auth-page__title">Connexion</h1>
          <p className="auth-page__subtitle">Accédez à votre tableau de bord</p>

          {error && <div className="auth-page__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@email.com"
                className="auth-page__input"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Mot de passe</label>
              <div className="auth-page__input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-page__input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="auth-page__eye"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-page__switch">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-page__switch-link">Créer un compte</Link>
          </p>
        </div>

        <Link to="/" className="auth-page__back">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
