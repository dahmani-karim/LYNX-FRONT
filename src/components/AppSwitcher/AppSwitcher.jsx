import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ECOSYSTEM_APPS, getAppUrl } from '../../config/ecosystem';
import './AppSwitcher.scss';

export default function AppSwitcher({ onClose }) {
  return createPortal(
    <div className="switcher">
      <div className="switcher__overlay" onClick={onClose} />
      <div className="switcher__panel">
        <div className="switcher__header">
          <h2>Écosystème La Caverne</h2>
          <button onClick={onClose} className="switcher__close">
            <X size={18} />
          </button>
        </div>
        <div className="switcher__list">
          {ECOSYSTEM_APPS.map((app) => (
            <a
              key={app.id}
              href={app.current ? undefined : getAppUrl(app)}
              onClick={app.current ? onClose : undefined}
              target={app.current ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`switcher__app ${app.current ? 'switcher__app--current' : ''}`}
            >
              <span
                className="switcher__app-icon"
                style={{ backgroundColor: `${app.color}20` }}
              >
                {app.emoji}
              </span>
              <div className="switcher__app-info">
                <div className="switcher__app-name">
                  <strong>{app.name}</strong>
                  {app.current && <span className="switcher__current-tag">actuel</span>}
                </div>
                <p className="switcher__app-desc">{app.description}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="switcher__footer">
          lacavernedurefractaire.fr
        </div>
      </div>
    </div>,
    document.body
  );
}
