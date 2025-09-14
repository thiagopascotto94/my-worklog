const { Client, ClientContact, sequelize, Sequelize } = require('../models');
const { getCnpjData, getCepData } = require('../services/externalApiService');
const { Op } = Sequelize;

// @route   POST api/clients
// @desc    Create a client
// @access  Private
exports.createClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { name, cnpj, inscricaoEstadual, cep, logradouro, numero, complemento, bairro, municipio, uf, telefone, contacts } = req.body;
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
    }, { transaction: t });

    if (contacts && contacts.length > 0) {
      const clientContacts = contacts.map(contact => ({
        ...contact,
        clientId: newClient.id,
      }));
      await ClientContact.bulkCreate(clientContacts, { transaction: t });
    }

    await t.commit();

    const clientWithContacts = await Client.findByPk(newClient.id, {
      include: [{
        model: ClientContact,
        as: 'contacts'
      }]
    });


    res.status(201).json(clientWithContacts);
  } catch (error) {
    await t.rollback();
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
        { name: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } },
        { municipio: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Client.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [{
        model: ClientContact,
        as: 'contacts'
      }]
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

    const client = await Client.findOne({
      where: { id, userId },
      include: [{
        model: ClientContact,
        as: 'contacts'
      }]
    });

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
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, cnpj, inscricaoEstadual, cep, logradouro, numero, complemento, bairro, municipio, uf, telefone, contacts } = req.body;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId }, transaction: t });

    if (!client) {
      await t.rollback();
      return res.status(404).json({ message: 'Client not found.' });
    }

    await client.update({
      name,
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
    }, { transaction: t });

    if (contacts) {
      const contactIds = contacts.map(c => c.id).filter(id => id);

      // Delete contacts that are no longer associated with the client
      await ClientContact.destroy({
        where: {
          clientId: client.id,
          id: { [Op.notIn]: contactIds }
        },
        transaction: t
      });

      // Upsert contacts
      for (const contactData of contacts) {
        if (contactData.id) {
          // Update existing contact
          await ClientContact.update(contactData, {
            where: { id: contactData.id, clientId: client.id },
            transaction: t,
          });
        } else {
          // Create new contact
          await ClientContact.create({
            ...contactData,
            clientId: client.id
          }, { transaction: t });
        }
      }
    }

    await t.commit();

    const updatedClient = await Client.findByPk(id, {
      include: [{
        model: ClientContact,
        as: 'contacts'
      }]
    });

    res.status(200).json(updatedClient);
  } catch (error) {
    await t.rollback();
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

    await client.destroy(); // This will also delete associated contacts due to CASCADE DELETE

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
