import React from "react";
import "../style/ConfirmModal.css";

const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="confirm-btn cancel" onClick={onCancel}>Cancelar</button>
          <button className="confirm-btn accept" onClick={onConfirm}>Sí, cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
