import './Loader.scss';

export default function Loader({ text = 'Chargement...' }) {
  return (
    <div className="loader">
      <div className="loader__spinner">
        <div className="loader__ring" />
        <div className="loader__arc" />
      </div>
      <p className="loader__text">{text}</p>
    </div>
  );
}
