import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

import donutIcon from '../assets/donut.svg';
import docIcon from '../assets/doc-icon.svg';
import supportIcon from '../assets/support-icon.svg';
import faceIcon from '../assets/footer-mycred-icon.svg';

const HelpWidget = () => {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('mycred_help_widget_pos');
      return saved ? JSON.parse(saved) : { right: 24, bottom: 24 };
    } catch (e) {
      return { right: 24, bottom: 24 };
    }
  });

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startRight: 24,
    startBottom: 24,
    moved: false
  });

  const handleMouseDown = (e) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
      moved: false
    };
    setIsDragging(true);
  };

  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // We update right & bottom based on movement
    const newRight = dragRef.current.startRight - deltaX;
    const newBottom = dragRef.current.startBottom - deltaY;

    // Optional: Bounds check could be added here
    setPos({ right: newRight, bottom: newBottom });

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragRef.current.moved = true;
    }
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('mycred_help_widget_pos', JSON.stringify(pos));
    }
  }, [isDragging, pos]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  const handleIconClick = () => {
    // If we didn't actually move much, it's a click
    if (!dragRef.current.moved) {
      setOpen(!open);
    }
  };

  const card = (
    <Card
      sx={{
        position: 'fixed',
        right: pos.right,
        bottom: pos.bottom + 88, // Offset above the icon
        width: 257,
        height: 216,
        borderRadius: '8px',
        border: '1px solid #E8E2F6',
        boxShadow: '0px 8px 24px rgba(45, 21, 114, 0.12)',
        backgroundColor: '#FFFFFF',
        zIndex: 10,
        // Prevent clicking through card during drag if needed, but card isn't draggable itself
        pointerEvents: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 2.25, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src={faceIcon} alt="helper" sx={{ width: 20, height: 20 }} />
            <Typography sx={{ fontFamily: 'Vollkorn', fontWeight: 600, color: '#2D1572' }}>Need help?</Typography>
          </Box>
          <Box
            role="button"
            aria-label="Close help"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            sx={{ cursor: 'pointer', color: '#7F7CA2', fontSize: 18, lineHeight: 1 }}
          >
            ×
          </Box>
        </Box>

        <Box
          component="a"
          href="https://codex.mycred.me/"
          target="_blank"
          rel="noopener"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, textDecoration: 'none' }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: 8, background: '#EDEBFE', display: 'grid', placeItems: 'center' }}>
            <Box component="img" src={docIcon} alt="Documentation" sx={{ width: 20, height: 20 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#2D1572', fontWeight: 600, fontSize: 16, lineHeight: '24px', fontFamily: 'Poppins, sans-serif' }}>Documentation</Typography>
            <Typography sx={{ color: '#7F7CA2', fontWeight: 400, fontSize: 13, lineHeight: '18px', fontFamily: 'Poppins, sans-serif' }}>Learn how this works</Typography>
          </Box>
        </Box>

        <Box
          component="a"
          href="https://mycred.me/support/"
          target="_blank"
          rel="noopener"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, textDecoration: 'none' }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: 8, background: '#EAF4E8', display: 'grid', placeItems: 'center' }}>
            <Box component="img" src={supportIcon} alt="Support" sx={{ width: 20, height: 20 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#2D1572', fontWeight: 600, fontSize: 16, lineHeight: '24px', fontFamily: 'Poppins, sans-serif' }}>Support</Typography>
            <Typography sx={{ color: '#7F7CA2', fontWeight: 400, fontSize: 13, lineHeight: '18px', fontFamily: 'Poppins, sans-serif' }}>Get help from our community</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <>
      {open && card}
      <Box
        onMouseDown={handleMouseDown}
        onClick={handleIconClick}
        role="button"
        aria-label="Toggle help"
        sx={{
          position: 'fixed',
          right: pos.right,
          bottom: pos.bottom,
          width: 64,
          height: 64,
          borderRadius: '999px',
          background: 'radial-gradient(100% 100% at 50% 50%, rgba(94,44,237,0.15) 0%, rgba(94,44,237,0.0) 70%)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9,
          cursor: isDragging ? 'grabbing' : 'pointer',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'all 0.2s ease',
          WebkitUserDrag: 'none',
        }}
      >
        <Box sx={{
          width: 56,
          height: 56,
          borderRadius: '999px',
          backgroundColor: '#7152F3',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0px 8px 24px rgba(45, 21, 114, 0.24)',
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.1s ease',
        }}>
          <Box component="img" src={donutIcon} alt="help" sx={{ width: 28, height: 28, pointerEvents: 'none' }} />
        </Box>
      </Box>
    </>
  );
};

export default HelpWidget;
