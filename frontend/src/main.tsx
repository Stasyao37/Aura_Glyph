import React from 'react'
import {createRoot} from 'react-dom/client'
import './styles/global.css'
import App from './App'
import { ModalProvider } from './hooks/useModal'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <ModalProvider>
            <App/>
        </ModalProvider>
    </React.StrictMode>
)
