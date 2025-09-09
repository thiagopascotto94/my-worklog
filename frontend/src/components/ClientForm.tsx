import React, { useState, useEffect, forwardRef } from 'react';
import { Button, TextField, Box, Modal, Typography, Grid } from '@mui/material';
import { Client, getCnpjData, getCepData } from '../services/clientService';
import { IMaskInput } from 'react-imask';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>, id?: number) => void;
  clientToEdit: Client | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

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


const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, onSave, clientToEdit }) => {
  const [clientData, setClientData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (clientToEdit) {
      setClientData(clientToEdit);
    } else {
      setClientData({});
    }
  }, [clientToEdit, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientData({ ...clientData, [event.target.name]: event.target.value });
  };

  const handleCnpjBlur = async () => {
    if (clientData.cnpj) {
      const cnpj = clientData.cnpj.replace(/\D/g, '');
      if (cnpj.length === 14) {
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
          console.error('Failed to fetch CNPJ data', error);
        }
      }
    }
  };

  const handleCepBlur = async () => {
    if (clientData.cep) {
      const cep = clientData.cep.replace(/\D/g, '');
      if (cep.length === 8) {
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
          console.error('Failed to fetch CEP data', error);
        }
      }
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(clientData, clientToEdit?.id);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {clientToEdit ? 'Edit Client' : 'Add New Client'}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="cnpj"
              label="CNPJ"
              name="cnpj"
              value={clientData.cnpj || ''}
              onChange={handleChange}
              onBlur={handleCnpjBlur}
              InputProps={{
                inputComponent: CnpjMask as any,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="inscricaoEstadual"
              label="Inscrição Estadual"
              name="inscricaoEstadual"
              value={clientData.inscricaoEstadual || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nome do Cliente"
              name="name"
              value={clientData.name || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              id="cep"
              label="CEP"
              name="cep"
              value={clientData.cep || ''}
              onChange={handleChange}
              onBlur={handleCepBlur}
              InputProps={{
                inputComponent: CepMask as any,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              margin="normal"
              fullWidth
              id="logradouro"
              label="Logradouro"
              name="logradouro"
              value={clientData.logradouro || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              id="numero"
              label="Número"
              name="numero"
              value={clientData.numero || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              margin="normal"
              fullWidth
              id="complemento"
              label="Complemento"
              name="complemento"
              value={clientData.complemento || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="bairro"
              label="Bairro"
              name="bairro"
              value={clientData.bairro || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              margin="normal"
              fullWidth
              id="municipio"
              label="Município"
              name="municipio"
              value={clientData.municipio || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              margin="normal"
              fullWidth
              id="uf"
              label="UF"
              name="uf"
              value={clientData.uf || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              fullWidth
              id="telefone"
              label="Telefone"
              name="telefone"
              value={clientData.telefone || ''}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Save Client
        </Button>
      </Box>
    </Modal>
  );
};

export default ClientForm;
