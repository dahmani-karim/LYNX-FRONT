import { Download, Check } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import './InstallPrompt.scss';

export default function InstallPrompt() {
  const { canInstall, isInstalled, install } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className="install-prompt install-prompt--installed">
        <Check size={18} className="install-prompt__icon install-prompt__icon--success" />
        <span className="install-prompt__label">Application installée</span>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <button onClick={install} className="install-prompt install-prompt--available">
      <Download size={18} className="install-prompt__icon install-prompt__icon--accent" />
      <div className="install-prompt__body">
        <p className="install-prompt__title">Installer LYNX</p>
        <p className="install-prompt__desc">Accès rapide depuis l'écran d'accueil</p>
      </div>
    </button>
  );
}
