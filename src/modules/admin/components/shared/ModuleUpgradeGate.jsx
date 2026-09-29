// src/modules/admin/components/shared/ModuleUpgradeGate.jsx
'use client';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

/**
 * Fulfilment cap for whole modules — same visual language as the
 * IntegrationsPage slot-lock (Lock icon + "Upgrade your plan" CTA),
 * but blocks an entire module instead of a single card/tile.
 *
 * Usage:
 *   <ModuleUpgradeGate loading={loading} entitled={dpia} moduleName="DPIA">
 *     <DpiaDashboard />
 *   </ModuleUpgradeGate>
 */
export default function ModuleUpgradeGate({ loading, entitled, moduleName, children }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!entitled) {
    return (
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', minHeight: '50vh', p: 4,
        }}
      >
        <Box
          sx={{
            width: 64, height: 64, borderRadius: '18px', background: '#6366f116',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
          }}
        >
          <LockIcon sx={{ fontSize: 30, color: '#6366f1' }} />
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {moduleName} isn't included in your plan
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
          Add the {moduleName} module under Manage Subscription to unlock it for your whole organization.
        </Typography>
        <Button
          variant="contained"
          href="/admin/subscription"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
        >
          Upgrade plan
        </Button>
      </Box>
    );
  }

  return children;
}
