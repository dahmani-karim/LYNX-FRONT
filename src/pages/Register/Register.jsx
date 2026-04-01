import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import '../Login/Login.scss';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      register(name, email, password);
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
          <h1 className="auth-page__title">Créer un compte</h1>
          <p className="auth-page__subtitle">Rejoignez LYNX gratuitement</p>

          {error && <div className="auth-page__error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label className="auth-page__label">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="auth-page__input"
                required
                autoComplete="name"
              />
            </div>

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
                  placeholder="Minimum 6 caractères"
                  className="auth-page__input"
                  required
                  autoComplete="new-password"
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

            <div className="auth-page__field">
              <label className="auth-page__label">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez le mot de passe"
                className="auth-page__input"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-page__switch">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-page__switch-link">Se connecter</Link>
          </p>
        </div>

        <Link to="/" className="auth-page__back">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
