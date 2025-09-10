import React, { useState, useEffect, forwardRef } from 'react';
import { Button, TextField, Box, Typography, Grid, Paper, CircularProgress, Snackbar, Alert, Divider } from '@mui/material';
import { Client, getCnpjData, getCepData } from '../services/clientService';
import { IMaskInput } from 'react-imask';

interface ClientFormProps {
  onSave: (clientData: Partial<Client>) => void;
  clientToEdit: Client | null;
  isSaving: boolean;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CnpjMask = forwardRef<HTMLElement, CustomProps>(function CnpjMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00.000.000/0000-00"
      definitions={{
        '#': /[1-9]/,
      }}
      // @ts-ignore
      inputRef={ref}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const CepMask = forwardRef<HTMLElement, CustomProps>(function CepMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="00000-000"
      definitions={{
        '#': /[1-9]/,
      }}
      // @ts-ignore
      inputRef={ref}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});


const ClientForm: React.FC<ClientFormProps> = ({ onSave, clientToEdit, isSaving }) => {
  const [clientData, setClientData] = useState<Partial<Client>>({});
  const [lookupLoading, setLookupLoading] = useState({ cnpj: false, cep: false });
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setClientData(clientToEdit);
    } else {
      setClientData({});
    }
  }, [clientToEdit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientData({ ...clientData, [event.target.name]: event.target.value });
  };

  const handleCnpjBlur = async () => {
    if (clientData.cnpj) {
      const cnpj = clientData.cnpj.replace(/\D/g, '');
      if (cnpj.length === 14) {
        setLookupLoading({ ...lookupLoading, cnpj: true });
        setLookupError('');
        try {
          const { data } = await getCnpjData(cnpj);
          setClientData({
            ...clientData,
            name: data.nome,
            logradouro: data.logradouro,
            numero: data.numero,
            complemento: data.complemento,
            bairro: data.bairro,
            municipio: data.municipio,
            uf: data.uf,
            cep: data.cep.replace(/\D/g, ''),
            telefone: data.telefone.replace(/\D/g, ''),
          });
        } catch (error) {
          setLookupError('Failed to fetch CNPJ data. Please check the CNPJ and try again.');
        } finally {
          setLookupLoading({ ...lookupLoading, cnpj: false });
        }
      }
    }
  };

  const handleCepBlur = async () => {
    if (clientData.cep) {
      const cep = clientData.cep.replace(/\D/g, '');
      if (cep.length === 8) {
        setLookupLoading({ ...lookupLoading, cep: true });
        setLookupError('');
        try {
          const { data } = await getCepData(cep);
          setClientData({
            ...clientData,
            logradouro: data.logradouro,
            bairro: data.bairro,
            municipio: data.localidade,
            uf: data.uf,
          });
        } catch (error) {
          setLookupError('Failed to fetch CEP data. Please check the CEP and try again.');
        } finally {
          setLookupLoading({ ...lookupLoading, cep: false });
        }
      }
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(clientData);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações da Empresa
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="cnpj"
              label="CNPJ"
              name="cnpj"
              value={clientData.cnpj || ''}
              onChange={handleChange}
              onBlur={handleCnpjBlur}
              InputProps={{
                inputComponent: CnpjMask as any,
                endAdornment: lookupLoading.cnpj ? <CircularProgress size={20} /> : null,
              }}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="inscricaoEstadual"
              label="Inscrição Estadual"
              name="inscricaoEstadual"
              value={clientData.inscricaoEstadual || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="name"
              label="Nome do Cliente"
              name="name"
              value={clientData.name || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Endereço
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="cep"
              label="CEP"
              name="cep"
              value={clientData.cep || ''}
              onChange={handleChange}
              onBlur={handleCepBlur}
              InputProps={{
                inputComponent: CepMask as any,
                endAdornment: lookupLoading.cep ? <CircularProgress size={20} /> : null,
              }}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              id="logradouro"
              label="Logradouro"
              name="logradouro"
              value={clientData.logradouro || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="numero"
              label="Número"
              name="numero"
              value={clientData.numero || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              id="complemento"
              label="Complemento"
              name="complemento"
              value={clientData.complemento || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="bairro"
              label="Bairro"
              name="bairro"
              value={clientData.bairro || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              id="municipio"
              label="Município"
              name="municipio"
              value={clientData.municipio || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              id="uf"
              label="UF"
              name="uf"
              value={clientData.uf || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h6" gutterBottom>
          Contato
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="telefone"
              label="Telefone"
              name="telefone"
              value={clientData.telefone || ''}
              onChange={handleChange}
              disabled={isSaving}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, position: 'relative' }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSaving}
        >
          {clientToEdit ? 'Save Changes' : 'Create Client'}
        </Button>
        {isSaving && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      <Snackbar open={!!lookupError} autoHideDuration={6000} onClose={() => setLookupError('')}>
        <Alert onClose={() => setLookupError('')} severity="warning" sx={{ width: '100%' }}>
          {lookupError}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ClientForm;
