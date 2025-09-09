const axios = require('axios');

const getCnpjData = async (cnpj) => {
  try {
    const response = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CNPJ data:', error);
    throw new Error('Failed to fetch CNPJ data');
  }
};

const getCepData = async (cep) => {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CEP data:', error);
    throw new Error('Failed to fetch CEP data');
  }
};

module.exports = {
  getCnpjData,
  getCepData,
};
