// src/modules/admin/components/Integrations/CustomIntegrationDialog.jsx
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, Select, MenuItem, FormControl,
  InputLabel, Button, Typography, Divider, IconButton
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon  from '@mui/icons-material/Close';

const INTEGRATION_TYPES = ['CLOUD', 'HRMS', 'IAM', 'TICKETING', 'COMMUNICATION', 'CUSTOM'];
const AUTH_TYPES        = ['API_KEY', 'BEARER_TOKEN', 'OAUTH2', 'BASIC'];

const AUTH_DEFAULTS = {
  API_KEY:      [{ key: 'apiKey',       label: 'API Key'       }],
  BEARER_TOKEN: [{ key: 'bearerToken',  label: 'Bearer Token'  }],
  OAUTH2:       [
    { key: 'clientId',     label: 'Client ID'     },
    { key: 'clientSecret', label: 'Client Secret' },
    { key: 'tokenUrl',     label: 'Token URL'     },
  ],
  BASIC:        [
    { key: 'username', label: 'Username' },
    { key: 'password', label: 'Password' },
  ],
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
};

export default function CustomIntegrationDialog({ open, onClose, onSubmit, editing }) {
  const [form, setForm] = useState(emptyForm());
  const [credFields, setCredFields] = useState(AUTH_DEFAULTS['API_KEY']);

  function emptyForm() {
    return {
      name: '', type: 'CUSTOM', authType: 'API_KEY',
      baseUrl: '', description: '', credentials: {},
    };
  }

  useEffect(() => {
    if (editing) {
      setForm({
        name:        editing.name        ?? '',
        type:        editing.type        ?? 'CUSTOM',
        authType:    editing.authType    ?? 'API_KEY',
        baseUrl:     editing.baseUrl     ?? '',
        description: editing.description ?? '',
        credentials: {},
      });
      if (editing.credentials) {
        setCredFields(Object.keys(editing.credentials).map(k => ({ key: k, label: k })));
      } else {
        setCredFields(AUTH_DEFAULTS[editing.authType ?? 'API_KEY']);
      }
    } else {
      setForm(emptyForm());
      setCredFields(AUTH_DEFAULTS['API_KEY']);
    }
  }, [editing, open]);

  const setField = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleAuthTypeChange = (authType) => {
    setForm(p => ({ ...p, authType, credentials: {} }));
    setCredFields(AUTH_DEFAULTS[authType]);
  };

  const setCredValue = (key, value) =>
    setForm(p => ({ ...p, credentials: { ...p.credentials, [key]: value } }));

  const addCredField = () =>
    setCredFields(p => [...p, { key: `field_${p.length + 1}`, label: `Field ${p.length + 1}` }]);

  const removeCredField = (idx) => {
    const removedKey = credFields[idx].key;
    setCredFields(p => p.filter((_, i) => i !== idx));
    setForm(p => {
      const creds = { ...p.credentials };
      delete creds[removedKey];
      return { ...p, credentials: creds };
    });
  };

  const updateCredFieldKey = (idx, newKey) => {
    const oldKey = credFields[idx].key;
    setCredFields(p => p.map((f, i) => i === idx ? { ...f, key: newKey, label: newKey } : f));
    setForm(p => {
      const creds = { ...p.credentials };
      const val = creds[oldKey];
      delete creds[oldKey];
      if (val !== undefined) creds[newKey] = val;
      return { ...p, credentials: creds };
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form, editing?.id ?? null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pb: 1.5, borderBottom: '1px solid #f1f5f9',
      }}>
        <Box>
          <Typography fontWeight={700} fontSize="1rem" color="text.primary">
            {editing ? 'Edit integration' : 'Add custom integration'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Connect any tool not listed under built-in providers
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          <TextField
            label="Tool name *"
            value={form.name}
            onChange={setField('name')}
            size="small" fullWidth
            placeholder="e.g. Okta, Slack, Salesforce"
            sx={inputSx}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                label="Type"
                onChange={setField('type')}
                sx={{ borderRadius: '8px' }}
              >
                {INTEGRATION_TYPES.map(t => (
                  <MenuItem key={t} value={t} sx={{ fontSize: '0.875rem' }}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Auth type</InputLabel>
              <Select
                value={form.authType}
                label="Auth type"
                onChange={e => handleAuthTypeChange(e.target.value)}
                sx={{ borderRadius: '8px' }}
              >
                {AUTH_TYPES.map(t => (
                  <MenuItem key={t} value={t} sx={{ fontSize: '0.875rem' }}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Base URL"
            value={form.baseUrl}
            onChange={setField('baseUrl')}
            size="small" fullWidth
            placeholder="https://yourcompany.okta.com"
            sx={inputSx}
          />

          <TextField
            label="Description (optional)"
            value={form.description}
            onChange={setField('description')}
            size="small" fullWidth multiline rows={2}
            placeholder="What does this integration do?"
            sx={inputSx}
          />

          <Divider />

          {/* Credential fields */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem" color="text.primary">
                  Credentials
                </Typography>
                {editing && (
                  <Typography variant="caption" color="text.secondary">
                    Leave value blank to keep existing
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addCredField}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                }}
              >
                Add field
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {credFields.map((field, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Key"
                    value={field.key}
                    onChange={e => updateCredFieldKey(idx, e.target.value)}
                    sx={{ width: 150, flexShrink: 0, ...inputSx }}
                  />
                  <TextField
                    size="small"
                    label="Value"
                    type="password"
                    fullWidth
                    placeholder={editing ? 'Leave blank to keep existing' : ''}
                    value={form.credentials[field.key] ?? ''}
                    onChange={e => setCredValue(field.key, e.target.value)}
                    sx={inputSx}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeCredField(idx)}
                    sx={{ flexShrink: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: 'none', borderRadius: '8px', color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            px: 3,
          }}
        >
          {editing ? 'Update integration' : 'Save integration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}