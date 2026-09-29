
// src/modules/admin/components/Integrations/ProviderCard.jsx'use client';
import { useState, useMemo } from 'react';
import { Box, Typography, Button, Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon    from '@mui/icons-material/Settings';
import AddIcon         from '@mui/icons-material/Add';
import LockIcon        from '@mui/icons-material/Lock';

const LOGO_EXTENSIONS = ['svg', 'png', 'webp'];

// Turns '/logos/aws.svg' (or '/logos/aws', extension omitted) into a list of
// candidate URLs to try in order: ['/logos/aws.svg', '/logos/aws.png', '/logos/aws.webp'].
function buildLogoCandidates(logoUrl) {
  if (!logoUrl) return [];
  const withoutExt = logoUrl.replace(/\.(svg|png|webp|jpe?g)$/i, '');
  return LOGO_EXTENSIONS.map(ext => `${withoutExt}.${ext}`);
}

// CARD_HEIGHT is a fixed pixel height (not a minimum) — every card in the grid
// renders at exactly this height regardless of how long its label or
// description is. This is the actual fix for the uneven-row problem: a
// minHeight only sets a floor, so a card with a 1-line description still ends
// up visibly shorter than a neighbor with a 2-line description. Fixed height
// + a reserved 2-line slot for the description (below) removes that variance
// entirely.
const CARD_HEIGHT = 280;

export default function ProviderCard({
  icon: Icon,
  logoUrl,
  accent,
  label,
  description,
  isConnected,
  locked,
  onOpen,
}) {
  const candidates = useMemo(() => buildLogoCandidates(logoUrl), [logoUrl]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const showRealLogo = candidateIndex < candidates.length;

  return (
    <Box
      sx={{
        border: '1px solid #e8edf2',
        borderRadius: '16px',
        p: 3,
        background: '#fff',
        height: CARD_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'box-shadow 0.2s ease, transform 0.15s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(15,23,42,0.07)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Logo + status — fixed height row, does not grow */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '14px',
            background: showRealLogo ? '#fff' : `${accent}16`,
            border: showRealLogo ? '1px solid #f1f3f6' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {showRealLogo ? (
            <Box
              component="img"
              src={candidates[candidateIndex]}
              alt={`${label} logo`}
              onError={() => setCandidateIndex(i => i + 1)}
              sx={{ width: 46, height: 46, objectFit: 'contain' }}
            />
          ) : (
            <Icon sx={{ fontSize: 30, color: accent }} />
          )}
        </Box>

        {isConnected ? (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
            label="Connected"
            size="small"
            sx={{
              background: '#dcfce7',
              color: '#15803d',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              '& .MuiChip-icon': { color: '#15803d' },
            }}
          />
        ) : (
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={600}
            sx={{ mt: 0.75, fontSize: '0.72rem' }}
          >
            Available
          </Typography>
        )}
      </Box>

      {/* Name — fixed, single line, truncated with ellipsis if too long */}
      <Typography
        fontWeight={700}
        fontSize="1rem"
        color="text.primary"
        noWrap
        sx={{ flexShrink: 0 }}
      >
        {label}
      </Typography>

      {/* Description — RESERVED 2-line slot regardless of actual text length.
          This is the key fix: a 1-line description ("Threat intelligence feed")
          now occupies the same vertical space as a 2-line one, so the button
          below always lands at the same y-position across every card. */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.5,
          minHeight: '3em',   // reserves exactly 2 lines at line-height 1.5 (1.5em × 2)
          maxHeight: '3em',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flexShrink: 0,
        }}
      >
        {description}
      </Typography>

      {/* Spacer fills any leftover space so the button is always flush to
          the card's bottom edge, never floating mid-card. */}
      <Box sx={{ flex: 1 }} />

      {/* Action button — pinned to bottom via mt: 'auto' as a second safeguard.
          `locked` (not yet connected + at slot cap) disables the button entirely —
          onOpen must never fire in that case, since it's what actually opens the
          config dialog and lets a connection be saved. */}
      <Tooltip title={locked ? "You've used all your integration slots — upgrade to connect more" : ''}>
        <span style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
          <Button
            onClick={locked ? undefined : onOpen}
            disabled={locked}
            variant={isConnected ? 'outlined' : 'contained'}
            startIcon={locked ? <LockIcon sx={{ fontSize: 16 }} /> : (isConnected ? <SettingsIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />)}
            sx={
              isConnected
                ? {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    borderColor: '#e2e8f0',
                    color: 'text.primary',
                    '&:hover': { borderColor: accent, background: `${accent}0d` },
                  }
                : {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    background: '#0f172a',
                    '&:hover': { background: '#1e293b' },
                  }
            }
          >
            {locked ? 'Locked' : (isConnected ? 'Modify' : 'Connect')}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
}