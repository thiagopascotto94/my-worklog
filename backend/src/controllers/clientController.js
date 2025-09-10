const { Client, Sequelize } = require('../models');
const { getCnpjData, getCepData } = require('../services/externalApiService');
const { Op } = Sequelize;

// @route   POST api/clients
// @desc    Create a client
// @access  Private
exports.createClient = async (req, res) => {
  try {
    const { name, cnpj, inscricaoEstadual, cep, logradouro, numero, complemento, bairro, municipio, uf, telefone } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required.' });
    }

    const newClient = await Client.create({
      name,
      userId,
      cnpj,
      inscricaoEstadual,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      municipio,
      uf,
      telefone,
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/clients
// @desc    Get all clients for a user with search, pagination
// @access  Private
exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { search, page = 1, limit = 10 } = req.query;

    let whereClause = { userId };
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { cnpj: { [Op.iLike]: `%${search}%` } },
        { municipio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Client.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      clients: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalClients: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/clients/:id
// @desc    Get a single client by ID
// @access  Private
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT api/clients/:id
// @desc    Update a client
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, inscricaoEstadual, cep, logradouro, numero, complemento, bairro, municipio, uf, telefone } = req.body;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    client.name = name || client.name;
    client.cnpj = cnpj || client.cnpj;
    client.inscricaoEstadual = inscricaoEstadual || client.inscricaoEstadual;
    client.cep = cep || client.cep;
    client.logradouro = logradouro || client.logradouro;
    client.numero = numero || client.numero;
    client.complemento = complemento || client.complemento;
    client.bairro = bairro || client.bairro;
    client.municipio = municipio || client.municipio;
    client.uf = uf || client.uf;
    client.telefone = telefone || client.telefone;

    await client.save();

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE api/clients/:id
// @desc    Delete a client
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    await client.destroy();

    res.status(200).json({ message: 'Client deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/clients/cnpj/:cnpj
// @desc    Get CNPJ data from ReceitaWS
// @access  Private
exports.getClientByCnpj = async (req, res) => {
  try {
    const { cnpj } = req.params;
    const data = await getCnpjData(cnpj);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/clients/cep/:cep
// @desc    Get CEP data from ViaCEP
// @access  Private
exports.getClientByCep = async (req, res) => {
  try {
    const { cep } = req.params;
    const data = await getCepData(cep);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
