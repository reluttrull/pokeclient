import React, { useState } from 'react';
import { confirmable, createConfirmation } from 'react-confirm';
import Modal from 'react-modal';

const ConfirmationDialog = ({ show, proceed, confirmation }) => {
    const [modalIsOpen, setIsOpen] = useState(true);

    return (
    <Modal className="card-overlay-container"
        isOpen={modalIsOpen}
        contentLabel="Confirm Overlay"
      >
        <p
        style={{color:'#000'}}>{confirmation}</p>
        <button onClick={() => {setIsOpen(false); proceed(false);}}>Cancel</button>
        <button onClick={() => {setIsOpen(false); proceed(true);}}>OK</button>
    </Modal>
)};

const confirm = createConfirmation(confirmable(ConfirmationDialog));

export default confirm;