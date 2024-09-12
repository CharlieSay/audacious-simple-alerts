'use client'

import { useState, useEffect, useCallback } from 'react'

interface QueuedMessage {
  id: string;
  message: string;
  timestamp: number;
  sender: string;
}

export default function ShowPage() {
  const [currentMessage, setCurrentMessage] = useState<QueuedMessage | null>(null)
  const [textColor, setTextColor] = useState('text-white')

  const flashMessage = useCallback(() => {
    let flashCount = 0
    const flashInterval = setInterval(() => {
      setTextColor(prev => prev === 'text-white' ? 'text-red-500' : 'text-white')
      flashCount++
      if (flashCount >= 15) { // 15 flashes over 3 seconds
        clearInterval(flashInterval)
        setTextColor('text-white')
      }
    }, 200) // Flash every 200ms

    return () => clearInterval(flashInterval)
  }, [])

  useEffect(() => {
    console.log('Setting up EventSource')
    const eventSource = new EventSource('/api/messages')

    eventSource.onopen = () => {
      console.log('EventSource connection opened')
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
    }

    eventSource.onmessage = (event) => {
      console.log('Received message:', event.data)
      if (event.data === 'CLEAR_SCREEN') {
        setCurrentMessage(null)
        return
      }
      try {
        const newMessage: QueuedMessage = JSON.parse(event.data)
        console.log('Parsed message:', newMessage)
        setCurrentMessage(newMessage)
        flashMessage()
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    return () => {
      console.log('Closing EventSource')
      eventSource.close()
    }
  }, [flashMessage])

  return (
    <div className="flex flex-col justify-between h-screen bg-black">
      <div className="flex-grow flex items-center justify-center">
        {currentMessage && (
          <h1
            className={`text-7xl font-bold transition-colors duration-100 ${textColor}`}
          >
            {currentMessage.message.toUpperCase()}
          </h1>
        )}
      </div>
     <div className="flex justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="358"
          height="72"
          viewBox="0 0 177 36"
          fill="white"
        >
          <path d="M130.85 36.17H.17v-36h177v36h-46.32m-75.47-20.5v13.48c0 1.17.07 1.24 1.2 1.24 1.9.01 3.8.02 5.7 0 .72 0 1.43.08 2.15-.09a7.45 7.45 0 0 0 5.86-7.43v-9.42c-.01-4.49-3.25-7.47-7.56-7.66-2.07-.09-4.14-.02-6.21-.01-1.03 0-1.14.12-1.15 1.15v8.73m64.42 14.36c1.17.67 2.43.92 3.8.91a7.36 7.36 0 0 0 7.2-7.23c0-3.72.02-7.44-.01-11.16a7.27 7.27 0 0 0-8.89-7c-3.73.7-5.89 3.57-6 7.4-.09 3.48-.09 6.97 0 10.46a7.44 7.44 0 0 0 3.9 6.62m-95.8-2.2c.1-.48.25-.95.3-1.43.09-.66.42-.87 1.05-.85.98.04 1.96.05 2.94 0 .58-.03.83.2.93.74.2 1.07.46 2.13.64 3.2.12.7.43.98 1.16.93 1-.06 2.02 0 3.03-.02 1.04 0 1.12-.13.91-1.17a2465.8 2465.8 0 0 1-4.44-22.24c-.17-.88-.53-1.28-1.5-1.23-1.49.09-2.99.07-4.48 0-.95-.04-1.32.34-1.5 1.24-.94 4.84-1.94 9.67-2.9 14.5-.54 2.7-1.04 5.4-1.6 8.1-.14.68.12.83.7.8.6 0 1.21.02 1.82 0 2.94-.05 2.27.47 2.93-2.58m13.25-8.17v4.16a7.55 7.55 0 0 0 4.45 6.56c4.97 1.97 10.23-1.27 10.41-6.6.19-5.67.04-11.36.05-17.04 0-.7-.35-.97-1.03-.95-.98.02-1.96.04-2.93 0-.84-.04-1.12.31-1.11 1.12.03 3.03.01 6.06 0 9.09 0 2.48.02 4.96 0 7.43 0 1.5-.87 2.42-2.2 2.44-1.78.03-2.58-.76-2.58-2.56V7.03c0-1.08-.16-1.24-1.26-1.25h-2.68c-1.05 0-1.12.08-1.12 1.15v12.71m51.03 10.23c-.53-2.72-1.05-5.46-1.6-8.18-1-5-2.05-10-3.04-15-.14-.69-.44-.93-1.1-.92-1.7.02-3.4.03-5.1 0-.72-.02-1 .3-1.14.98-1.5 7.57-3.02 15.13-4.56 22.7-.13.66.05.93.7.94h3.54c.58.01.8-.3.9-.82.2-1.13.48-2.25.66-3.38.08-.47.25-.65.7-.64 1.16.02 2.31 0 3.46 0 .41 0 .6.13.68.57.2 1.13.46 2.25.68 3.38.12.63.42.94 1.11.9 1.12-.04 2.25 0 3.37 0 .3 0 .67.06.74-.52m47.15-1.99a7.18 7.18 0 0 0 6.23 3.04 7.27 7.27 0 0 0 7.12-7.02c.03-3.84.02-7.67.03-11.5 0-1.85-.02-3.7.01-5.54.02-.83-.31-1.15-1.13-1.1-.86.04-1.73 0-2.6 0-1.29.01-1.36.08-1.36 1.37l-.01 16.61c0 1.13-.58 1.85-1.59 2.07-1.27.28-2.33-.14-2.8-1.12a4.73 4.73 0 0 1-.4-2.1V6.94c0-1.03-.13-1.15-1.14-1.16h-2.5c-1.2 0-1.24.05-1.24 1.2l-.01 16.79a7 7 0 0 0 1.39 4.12m26.27-15.23c.05.56.45.6.88.6 1.1 0 2.19-.02 3.28.01.7.02.93-.3.9-.95a6.95 6.95 0 0 0-1.94-4.58 7.52 7.52 0 0 0-11.5.64c-2.07 2.78-1.93 7.34.74 9.79a11.55 11.55 0 0 0 4.35 2.35c.87.28 1.79.45 2.54 1.03.7.53 1 1.67.68 2.68a2.29 2.29 0 0 1-1.93 1.62c-1.51.09-2.45-.64-2.78-2.22-.08-.43-.2-.72-.68-.72l-3.63.01c-.53.01-.81.32-.74.84a8.2 8.2 0 0 0 .89 3.22c1.42 2.4 3.46 3.88 6.35 3.93 3.07.05 5.47-1.25 6.82-3.97 1.84-3.68 1-8.32-3.87-10.43-1.26-.55-2.64-.78-3.84-1.51a2.44 2.44 0 0 1-1.14-2.95c.3-1 1.43-1.8 2.41-1.72 1.1.1 2.04 1.03 2.2 2.33m-69.9 16a7.51 7.51 0 0 0 10.55.22 8.24 8.24 0 0 0 2.34-5.13c.06-.55-.23-.82-.75-.83-.73-.01-1.45-.03-2.16 0-.63.02-1.32-.22-1.86.15-.44.29-.28.96-.53 1.4-.04.06-.05.11-.08.17-.44 1-1.42 1.42-2.76 1.2a2.03 2.03 0 0 1-1.68-2.02 996.2 996.2 0 0 1 0-11.33c.01-1.4 1.38-2.38 2.76-2.08a2.3 2.3 0 0 1 1.94 1.93c.08.41.12.91.72.91h3.8c.37 0 .65-.19.6-.57-.18-1.22-.33-2.45-1-3.53a7.37 7.37 0 0 0-6.82-3.74 7.27 7.27 0 0 0-7.06 7.07c-.01 3.63.04 7.26-.02 10.9a7.59 7.59 0 0 0 2 5.29m20.87-8.5V6.93c0-1.04-.11-1.15-1.13-1.16h-2.85c-.75-.01-1.08.3-1.08 1.09v22.65c0 .62.22.9.86.88 1-.02 2.01 0 3.02 0 1.14 0 1.18-.05 1.18-1.16v-9.08M10.13 10.9c.62 1.08 1.64 1.8 2.5 2.74-.93.1-1.83.1-2.74.1-1.13 0-1.18.06-1.18 1.16v6.14c0 1.34 0 1.34 1.28 1.75-.73 1.21-1.54 2.4-1.21 3.92A4.75 4.75 0 0 0 11.2 30c1.86 1.03 4.54.31 5.76-1.57.5-.79.83-1.7.74-2.62-.26-2.34-1.67-3.74-3.87-4.25.05-.47.32-.52.5-.66a8.23 8.23 0 0 0 3.37-6.33c.13-2.6.02-5.24.03-7.86 0-.67-.3-.93-.94-.93H9.55c-.64-.01-.9.27-.84.89a8.5 8.5 0 0 0 1.41 4.23Zm0 0" />
          <path d="M65.23 17.13v5.62c0 1.66-.8 2.56-2.45 2.75-2.28.27-2.35.21-2.35-2.1V12.19c0-1.34 0-1.34 1.38-1.34.37 0 .75-.01 1.12 0 1.33.07 2.26.98 2.29 2.32.03 1.3.01 2.6.01 3.97Zm56.18 7.85a3.3 3.3 0 0 1-.48-1.7v-10.3c.02-2.16 1.88-3.23 3.77-2.21a1.8 1.8 0 0 1 1.01 1.68c.03 3.75.02 7.5 0 11.25 0 .94-.4 1.73-1.33 2.02-1.07.33-2.11.23-2.97-.74ZM25.6 20.26c.31-1.85.66-3.63 1-5.41l.26-.01c.48 1.81.8 3.66 1.11 5.6-.84.03-1.6.19-2.38-.18Zm54.67-4.66c.27 1.38.53 2.7.81 4.01.14.65-.08.88-.74.89-1.7.04-1.72.04-1.37-1.63.3-1.36.58-2.73.88-4.16.31.28.38.54.42.9Zm-66.16 7.16a3.35 3.35 0 0 1 2.35 4.27 3.42 3.42 0 0 1-4.24 2.25c-1.78-.48-2.78-2.38-2.25-4.3.46-1.69 2.33-2.7 4.14-2.22Zm2.19-9.16c-3.31-.22-6.03-3.02-6.41-6.54.11-.2.33-.19.52-.19l5.52-.01c.5 0 .73.18.73.7-.02 1.84 0 3.68-.01 5.52 0 .2.08.49-.35.53Zm-1.37 5.31a7.59 7.59 0 0 1-4.24 2.56c-.6.14-.92-.03-.9-.72.02-1.73 0-3.45 0-5.18 0-.41.05-.75.59-.75h6.1a5.88 5.88 0 0 1-1.55 4.09Zm0 0" />
        </svg>
      </div>
    </div>
  )
}

