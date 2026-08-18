import { createPortal } from 'react-dom';

export default function Overlay( {component} ) {
  if (component === null) return null;
    

  return createPortal(
    <div className="overlay-backdrop">
      <div className="overlay-content">
        {component}
      </div>
    </div>, 
    document.getElementById('overlay-root')
  );
}