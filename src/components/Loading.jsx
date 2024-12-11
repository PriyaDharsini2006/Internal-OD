'use client';

import React, { useState, useEffect } from 'react';

export default function CodeRainLoader() {
  const [codeLetters, setCodeLetters] = useState([]);

  // Generate random code letters
  const generateCodeLetters = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+[]{}|;:,.<>?';
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const numberOfLetters = Math.floor(screenWidth / 20);

    const newCodeLetters = Array.from({ length: numberOfLetters }, (_, index) => ({
      id: `letter-${index}`,
      letter: letters[Math.floor(Math.random() * letters.length)],
      left: Math.random() * screenWidth,
      animationDelay: Math.random() * 5,
      fontSize: Math.random() * 20 + 10,
      fallDuration: Math.random() * 5 + 3
    }));

    setCodeLetters(newCodeLetters);
  };

  useEffect(() => {
    // Generate initial code letters
    generateCodeLetters();

    // Regenerate letters periodically
    const letterInterval = setInterval(generateCodeLetters, 5000);

    // Add resize event listener to regenerate letters on window resize
    const handleResize = () => {
      generateCodeLetters();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(letterInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 9999
      }}
    >
      {/* Falling Code Letters Background */}
      {codeLetters.map((letter) => (
        <div
          key={letter.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: letter.left,
            color: '#00ffff',
            opacity: 0.5,
            fontSize: `${letter.fontSize}px`,
            animation: `fallCode ${letter.fallDuration}s linear infinite`,
            animationDelay: `${letter.animationDelay}s`,
            textShadow: '0 0 5px #00ffff'
          }}
        >
          {letter.letter}
        </div>
      ))}

      {/* Loading Text */}
      <div
        style={{
          position: 'relative',
          color: '#00ffff',
          fontSize: '2rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          zIndex: 10,
          textShadow: '0 0 10px #00ffff'
        }}
      >
        Loading...
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes fallCode {
          0% { 
            transform: translateY(-20px);
            opacity: 0.5;
          }
          100% { 
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}