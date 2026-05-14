const Spinner = ({ size = 40, color = '#C0392B' }) => (
  <div style={{
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', padding: '40px',
  }}>
    <div style={{
      width: size, height: size,
      border: `4px solid #F2F3F4`,
      borderTop: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;