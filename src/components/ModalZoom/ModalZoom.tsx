import React, { useState } from 'react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  children: React.ReactNode
  onClose: React.Dispatch<React.SetStateAction<boolean>>
}

const ModalZoom: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className='modal-content'>
        <span className='close' onClick={() => onClose(false)}>
          &times;
        </span>
        {children}
      </div>
    </div>
  )
}

export default ModalZoom
