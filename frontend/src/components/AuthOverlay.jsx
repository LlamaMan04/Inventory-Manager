export default function AuthOverlay ({ onClose }) {

  return (
    <div>
      <h3>Connect to an inventory database</h3>
      <label>Database url:</label>
      <input type="text" placeholder="xx.xx.xx.xx:0000"></input>
      <button 
        className="auth-close-button"
        type="submit"
        onClick={onClose}
      >
        X
      </button>
    </div>
  );
}