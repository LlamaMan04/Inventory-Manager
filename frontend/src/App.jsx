import { useState, useEffect } from 'react'
import Overlay from './components/Overlay'
import AppLayout from './components/AppLayout'
import AuthOverlay from './components/AuthOverlay'

function App() {
  const [ overlayComponent, setOverlayComponent ] = useState(null)

  // Open the auth overlay as the default state
  useEffect(() =>
    setOverlayComponent(<AuthOverlay onClose={() => setOverlayComponent(null)}/>)
  , []);

  return (
    <div>
      <AppLayout />
      <Overlay component={overlayComponent}/>
    </div>
  );
}

export default App
