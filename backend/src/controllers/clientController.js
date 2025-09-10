const { Client, ClientContact } = require('../models');

exports.createClient = async (req, res) => {
  try {
    const { name, contacts } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required.' });
    }

    const newClient = await Client.create({
      name,
      userId,
    });

    if (contacts && contacts.length > 0) {
      await ClientContact.create({
        ...contacts[0],
        clientId: newClient.id,
      });
    }

    const clientWithContacts = await Client.findByPk(newClient.id, {
      include: ['contacts']
    });

    res.status(201).json(clientWithContacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const userId = req.user.userId;
    const clients = await Client.findAll({
      where: { userId },
      include: ['contacts'],
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const client = await Client.findOne({
      where: { id, userId },
      include: ['contacts'],
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contacts } = req.body;
    const userId = req.user.userId;

    const client = await Client.findOne({ where: { id, userId } });

    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    client.name = name || client.name;
    await client.save();

    if (contacts && contacts.length > 0) {
      const contactData = contacts[0];
      let contact = await ClientContact.findOne({ where: { clientId: id } });

      if (contact) {
        contact.name = contactData.name || contact.name;
        contact.email = contactData.email || contact.email;
        contact.phone = contactData.phone || contact.phone;
        await contact.save();
      } else {
        await ClientContact.create({ ...contactData, clientId: id });
      }
    }

    const updatedClient = await Client.findByPk(id, { include: ['contacts'] });

    res.status(200).json(updatedClient);
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
