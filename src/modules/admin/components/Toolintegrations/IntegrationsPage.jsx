// src/modules/admin/components/Integrations/IntegrationsPage.jsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Chip, IconButton,
  Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, Tooltip, Divider, LinearProgress,
} from '@mui/material';
import SyncIcon             from '@mui/icons-material/Sync';
import ExtensionIcon        from '@mui/icons-material/Extension';
import CloseIcon            from '@mui/icons-material/Close';
import AddIcon              from '@mui/icons-material/Add';
import EditIcon             from '@mui/icons-material/Edit';
import DeleteIcon           from '@mui/icons-material/Delete';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LockIcon              from '@mui/icons-material/Lock';

import integrationApi          from './integrationApi';
import BuiltInProviderForm     from './BuiltInProviderForm';
import CustomIntegrationDialog from './CustomIntegrationDialog';
import { BUILT_IN_PROVIDERS, TYPE_COLORS } from './providerMeta';
import ProviderCard             from './ProviderCard';
import useIntegrationEntitlement, {
  ENTITLEMENT_CUSTOM,
} from '../../hooks/useIntegrationEntitlement';

// Fixed height shared by every card type (built-in, custom, and the
// "add custom tool" tile) so a row never looks uneven regardless of how
// much text a given card has. Keep this in sync with the CARD_HEIGHT
// constant inside ProviderCard.jsx.
const CARD_HEIGHT = 280;

// Shared CSS Grid config for both card sections below — always exactly
// 4 equal-width columns, on every screen size, with equal row heights
// via CSS Grid's default align-items: stretch. This replaces MUI's
// 12-column <Grid> (which was only ever giving 3-per-row via xs={4},
// and whose breakpoint math was the source of the uneven wrapping).
const CARD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 2.5,
};

// ── Slot-limit enforcement ───────────────────────────────────────────────────
// How many integration slots every tenant gets before any INTEGRATION_STANDARD
// units are purchased. Contract §4 didn't specify a number for the Starter
// plan's included baseline, so this defaults to 0 (every slot must come from
// a purchased INTEGRATION_STANDARD unit or an INTEGRATION_CUSTOM plan) — bump
// this up if Starter is actually meant to include some integrations for free.
const INCLUDED_FREE_SLOTS = 2;

// ── Custom tool card, restyled to match the built-in provider tiles ──────────
function CustomToolCard({ item, onToggle, onEdit, onDelete, blockActivate }) {
  const activating = item.status !== 'ACTIVE';
  const toggleBlocked = activating && blockActivate;
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
        opacity: item.status === 'INACTIVE' ? 0.6 : 1,
        transition: 'box-shadow 0.2s ease, transform 0.15s ease, opacity 0.2s ease',
        '&:hover': { boxShadow: '0 8px 24px rgba(15,23,42,0.07)', transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: '14px',
            background: '#6366f116', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <ExtensionIcon sx={{ fontSize: 26, color: '#6366f1' }} />
        </Box>
        <Chip
          label={item.status}
          size="small"
          color={item.status === 'ACTIVE' ? 'success' : 'default'}
          sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }}
        />
      </Box>

      <Typography fontWeight={700} fontSize="1rem" color="text.primary" noWrap sx={{ flexShrink: 0 }}>
        {item.name}
      </Typography>

      {item.description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.5,
            minHeight: '3em',
            maxHeight: '3em',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            flexShrink: 0,
          }}
        >
          {item.description}
        </Typography>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.5, minHeight: '3em', maxHeight: '3em', overflow: 'hidden', flexShrink: 0 }}
        >
          {item.baseUrl || 'Custom integration'}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', flexShrink: 0 }}>
        <Chip label={item.type} size="small" color={TYPE_COLORS[item.type] ?? 'default'} variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
        <Chip label={item.authType} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
      </Box>

      {/* Spacer fills leftover space so the action row is always flush to the bottom */}
      <Box sx={{ flex: 1 }} />

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0, mt: 'auto' }}>
        <Button
          onClick={() => onEdit(item)}
          variant="outlined"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: 'none', fontWeight: 600, borderRadius: '8px',
            fontSize: '0.85rem', borderColor: '#e2e8f0', color: 'text.primary',
          }}
        >
          Modify
        </Button>
        <Tooltip title={toggleBlocked ? "You've used all your integration slots — upgrade to activate more" : (item.status === 'ACTIVE' ? 'Deactivate' : 'Activate')}>
          <span>
            <IconButton
              size="small"
              onClick={() => !toggleBlocked && onToggle(item.id)}
              disabled={toggleBlocked}
              sx={{ color: item.status === 'ACTIVE' ? '#22c55e' : 'text.disabled' }}
            >
              {toggleBlocked ? <LockIcon sx={{ fontSize: 16 }} /> : <PowerSettingsNewIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(item.id, item.name)} sx={{ color: '#ef4444', ml: 'auto' }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ── Small logo tile for the config dialog header, same fallback as ProviderCard ──
const LOGO_EXTENSIONS = ['svg', 'png', 'webp'];
function buildLogoCandidates(logoUrl) {
  if (!logoUrl) return [];
  const withoutExt = logoUrl.replace(/\.(svg|png|webp|jpe?g)$/i, '');
  return LOGO_EXTENSIONS.map(ext => `${withoutExt}.${ext}`);
}

function DialogLogo({ logoUrl, Icon, accent, label }) {
  const candidates = useMemo(() => buildLogoCandidates(logoUrl), [logoUrl]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const showRealLogo = candidateIndex < candidates.length;
  return (
    <Box sx={{
      width: 44, height: 44, borderRadius: '10px',
      background: showRealLogo ? '#fff' : `${accent}16`,
      border: showRealLogo ? '1px solid #f1f3f6' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {showRealLogo ? (
        <Box component="img" src={candidates[candidateIndex]} alt={`${label} logo`} onError={() => setCandidateIndex(i => i + 1)} sx={{ width: 30, height: 30, objectFit: 'contain' }} />
      ) : (
        <Icon sx={{ fontSize: 20, color: accent }} />
      )}
    </Box>
  );
}

// ── "Add a custom tool" tile, dashed outline, sits at the end of the grid ────
function AddCustomTile({ onClick, blocked }) {
  return (
    <Tooltip title={blocked ? "You've used all your integration slots — upgrade to add more" : ''}>
      <Box
        onClick={() => !blocked && onClick()}
        sx={{
          border: '2px dashed #d8dee6',
          borderRadius: '16px',
          p: 3,
          height: CARD_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
          cursor: blocked ? 'not-allowed' : 'pointer',
          color: blocked ? 'text.disabled' : 'text.secondary',
          opacity: blocked ? 0.6 : 1,
          transition: 'border-color 0.15s ease, background 0.15s ease, color 0.15s ease',
          '&:hover': blocked ? {} : { borderColor: '#6366f1', background: '#6366f108', color: '#6366f1' },
        }}
      >
        {blocked ? <LockIcon sx={{ fontSize: 28 }} /> : <AddIcon sx={{ fontSize: 28 }} />}
        <Typography fontWeight={600} fontSize="0.9rem">Add a custom tool</Typography>
        <Typography variant="caption" color="text.disabled" textAlign="center">
          {blocked ? 'Upgrade your plan for more slots' : 'Okta, Salesforce, or any other service'}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {

  // ── Resolve tenantId the same way RiskAssessmentTable does ───────────────
  // Read from sessionStorage cache first (already set by compliance page),
  // otherwise fetch from user-service. Never use JWT.organization directly
  // because that is the MongoDB _id, not the tenantId string.
  const [tenantId,  setTenantId]  = useState(null);
  const [tenantErr, setTenantErr] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      const cached = sessionStorage.getItem('tenantId');
      if (cached) { setTenantId(cached); return; }

      try {
        const user  = JSON.parse(sessionStorage.getItem('user') || '{}');
        const orgId = user?.organization?._id ?? user?.organization;
        if (!orgId) { setTenantErr(true); return; }

        const res = await axios.get(
          `https://api.calvant.com/user-service/api/organizations/${orgId}/tenant`,
          { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
        );
        const tid = res.data;
        sessionStorage.setItem('tenantId', tid);
        setTenantId(tid);
      } catch (err) {
        console.error('Failed to resolve tenantId:', err);
        setTenantErr(true);
      }
    };
    resolve();
  }, []);

  const [builtInConfig, setBuiltInConfig] = useState({});
  const [customList,    setCustomList]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [syncing,       setSyncing]       = useState(false);
  const [syncAlert,     setSyncAlert]     = useState(null);

  // ── Subscription entitlement — how many integration slots this tenant
  // is allowed, per contract §4. mode === CUSTOM means unlimited
  // (INTEGRATION_CUSTOM / "Contact Sales" tier); otherwise the cap is
  // INCLUDED_FREE_SLOTS + whatever INTEGRATION_STANDARD quantity they've
  // purchased (see subscriptionCatalogConfig.js for the addOnCode names).
  const { loading: entLoading, mode: entMode, slotLimit, error: entError } = useIntegrationEntitlement();
  const isUnlimited = entMode === ENTITLEMENT_CUSTOM;
  const slotCap = isUnlimited ? Infinity : INCLUDED_FREE_SLOTS + slotLimit;

  // Built-in provider config dialog
  const [configProviderKey, setConfigProviderKey] = useState(null);
  const configOpen = !!configProviderKey;
  const configProvider = BUILT_IN_PROVIDERS.find(p => p.key === configProviderKey) ?? null;

  // Custom tool dialog (unchanged behavior, just re-used here)
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [editingCustom,    setEditingCustom]    = useState(null);

  useEffect(() => { if (tenantId) loadAll(); }, [tenantId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [config, customs] = await Promise.all([
        integrationApi.getBuiltInConfig(tenantId),
        integrationApi.getAllCustom(tenantId),
      ]);
      setBuiltInConfig(config ?? {});
      setCustomList(Array.isArray(customs) ? customs : customs?.data ?? customs?.items ?? []);
    } catch {
      setSyncAlert({ type: 'error', message: 'Failed to load integrations.' });
    } finally {
      setLoading(false);
    }
  };

  const connectedBuiltIn = BUILT_IN_PROVIDERS.filter(p => !!builtInConfig[p.configKey ?? p.key]).length;
  const activeCustom     = customList.filter(c => c.status === 'ACTIVE').length;
  const totalConnected   = connectedBuiltIn + activeCustom;
  const atCap = !isUnlimited && totalConnected >= slotCap;

  // Built-in handlers
  const handleSave = async (provider, payload) => {
    const data = await integrationApi.saveBuiltIn(tenantId, provider, payload);
    if (data.success) await loadAll();
    return data;
  };
  const handleRemove = async (provider) => {
    if (!confirm(`Disconnect ${provider.toUpperCase()}?`)) return;
    await integrationApi.removeBuiltIn(tenantId, provider);
    await loadAll();
    setConfigProviderKey(null);
  };
  const handleTest = async (provider) => integrationApi.testBuiltIn(tenantId, provider);

  // Gate opening the config dialog for a NOT-YET-connected built-in provider
  // when at cap. Already-connected providers can still be opened (to edit
  // config, test, or disconnect) regardless of cap — the cap only blocks
  // adding a NEW connection.
  const handleOpenProvider = (provider) => {
    const alreadyConnected = !!builtInConfig[provider.configKey ?? provider.key];
    if (!alreadyConnected && atCap) {
      setSyncAlert({
        type: 'warning',
        message: "You've used all your integration slots. Upgrade your plan under Manage Subscription to connect more.",
      });
      return;
    }
    setConfigProviderKey(provider.key);
  };

  // Custom handlers
  const handleCustomSubmit = async (form, id) => {
    if (id) await integrationApi.updateCustom(tenantId, id, form);
    else    await integrationApi.createCustom(tenantId, form);
    setCustomDialogOpen(false);
    setEditingCustom(null);
    await loadAll();
  };
  const handleCustomDelete = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    await integrationApi.deleteCustom(tenantId, id);
    await loadAll();
  };
  const handleToggle = async (id) => {
    // Block only the INACTIVE -> ACTIVE direction when at cap; deactivating
    // always frees a slot, so it's always allowed.
    const item = customList.find((c) => c.id === id);
    if (item && item.status !== 'ACTIVE' && atCap) {
      setSyncAlert({
        type: 'warning',
        message: "You've used all your integration slots. Upgrade your plan under Manage Subscription to activate more.",
      });
      return;
    }
    await integrationApi.toggleCustom(tenantId, id);
    await loadAll();
  };

  const handleAddCustomClick = () => {
    if (atCap) {
      setSyncAlert({
        type: 'warning',
        message: "You've used all your integration slots. Upgrade your plan under Manage Subscription to add more.",
      });
      return;
    }
    setEditingCustom(null);
    setCustomDialogOpen(true);
  };

  // Sync
  const handleSync = async () => {
    setSyncing(true);
    setSyncAlert(null);
    try {
      await integrationApi.triggerSync(tenantId);
      setSyncAlert({ type: 'success', message: 'Compliance sync completed successfully.' });
    } catch {
      setSyncAlert({ type: 'error', message: 'Sync failed. Please try again.' });
    } finally {
      setSyncing(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (tenantErr) return (
    <Box sx={{ p: 4 }}>
      <Alert severity="error">Could not resolve tenant. Please log in again.</Alert>
    </Box>
  );

  if (!tenantId || loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <CircularProgress size={32} />
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>

      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" letterSpacing="-0.3px">
            Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Connect your cloud, HR, and security tools. Credentials are encrypted before storage.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            label={`${totalConnected} active`}
            size="small"
            color={totalConnected > 0 ? 'success' : 'default'}
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Button
            variant="contained"
            startIcon={syncing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
            onClick={handleSync}
            disabled={syncing || totalConnected === 0}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: '0.82rem' }}
          >
            {syncing ? 'Syncing…' : 'Run compliance sync'}
          </Button>
        </Box>
      </Box>

      {/* Slot-usage banner — only meaningful once entitlement has loaded and
          the tenant isn't on the unlimited/custom tier. */}
      {!entLoading && !entError && !isUnlimited && (
        <Box
          sx={{
            mb: 3, p: 2, borderRadius: '10px',
            border: '1px solid', borderColor: atCap ? '#fde68a' : '#e8edf2',
            background: atCap ? '#fffbeb' : '#f8fafc',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="body2" fontWeight={600} color={atCap ? '#92400e' : 'text.secondary'}>
              {totalConnected} of {slotCap} integration slot{slotCap === 1 ? '' : 's'} used
            </Typography>
            {atCap && (
              <Button
                size="small"
                variant="text"
                href="/admin/subscription"
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
              >
                Upgrade plan
              </Button>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={slotCap > 0 ? Math.min(100, (totalConnected / slotCap) * 100) : 100}
            sx={{
              height: 6, borderRadius: 3,
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': { backgroundColor: atCap ? '#f59e0b' : '#6366f1' },
            }}
          />
        </Box>
      )}

      {syncAlert && (
        <Alert severity={syncAlert.type} sx={{ mb: 3, borderRadius: '10px' }} onClose={() => setSyncAlert(null)}>
          {syncAlert.message}
        </Alert>
      )}

      {/* Built-in providers */}
      <Typography variant="subtitle2" fontWeight={700} color="text.disabled" sx={{ letterSpacing: '0.06em', fontSize: '0.72rem', mb: 1.5 }}>
        BUILT-IN TOOLS
      </Typography>
      <Box sx={{ ...CARD_GRID_SX, mb: 4 }}>
        {[...BUILT_IN_PROVIDERS].sort((a, b) => a.label.localeCompare(b.label)).map(provider => {
          const alreadyConnected = !!builtInConfig[provider.configKey ?? provider.key];
          return (
            <ProviderCard
              key={provider.key}
              icon={provider.Icon}
              logoUrl={provider.logoUrl}
              accent={provider.accent}
              label={provider.label}
              description={provider.description}
              isConnected={alreadyConnected}
              locked={!alreadyConnected && atCap}
              onOpen={() => handleOpenProvider(provider)}
            />
          );
        })}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Custom tools */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.disabled" sx={{ letterSpacing: '0.06em', fontSize: '0.72rem' }}>
          CUSTOM TOOLS
        </Typography>
        {customList.length > 0 && (
          <Chip label={customList.length} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
        )}
      </Box>
      <Box sx={CARD_GRID_SX}>
        {customList.map(item => (
          <CustomToolCard
            key={item.id}
            item={item}
            onToggle={handleToggle}
            onEdit={(i) => { setEditingCustom(i); setCustomDialogOpen(true); }}
            onDelete={handleCustomDelete}
            blockActivate={atCap}
          />
        ))}
        <AddCustomTile onClick={handleAddCustomClick} blocked={atCap} />
      </Box>

      {/* ── Built-in provider config dialog ──────────────────────────────── */}
      <Dialog
        open={configOpen}
        onClose={() => setConfigProviderKey(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}
      >
        {configProvider && (
          <>
            <DialogTitle sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              pb: 1.5, borderBottom: '1px solid #f1f5f9',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DialogLogo
                  key={configProvider.key}
                  logoUrl={configProvider.logoUrl}
                  Icon={configProvider.Icon}
                  accent={configProvider.accent}
                  label={configProvider.label}
                />
                <Box>
                  <Typography fontWeight={700} fontSize="1rem" color="text.primary">
                    {configProvider.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {configProvider.description}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setConfigProviderKey(null)} sx={{ color: 'text.secondary' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
              <BuiltInProviderForm
                providerKey={configProvider.key}
                configKey={configProvider.configKey ?? configProvider.key}
                savedConfig={builtInConfig}
                onSave={handleSave}
                onRemove={handleRemove}
                onTest={handleTest}
              />
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ── Custom tool dialog (unchanged) ───────────────────────────────── */}
      <CustomIntegrationDialog
        open={customDialogOpen}
        onClose={() => { setCustomDialogOpen(false); setEditingCustom(null); }}
        onSubmit={handleCustomSubmit}
        editing={editingCustom}
      />
    </Box>
  );
}