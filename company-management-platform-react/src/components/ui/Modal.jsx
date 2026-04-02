export default function Modal({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={wide ? { maxWidth: 600 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ marginBottom: 0 }}>{title}</h3>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
