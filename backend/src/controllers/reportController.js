const { Report, ReportItem, WorkSession, Client, sequelize } = require('../models');
const { Op } = require('sequelize');

// @route   POST api/reports/generate
// @desc    Generate a new report
// @access  Private
exports.generateReport = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { clientId, startDate, endDate } = req.body;
    const userId = req.user.userId;

    const sessions = await WorkSession.findAll({
      where: {
        userId,
        clientId,
        status: 'stopped',
        endTime: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      include: [{ model: ReportItem, required: false }], // Eager load to check if already in a report
      transaction: t,
    });

    const unbilledSessions = sessions.filter(s => !s.ReportItem);

    if (unbilledSessions.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'No billable sessions found for the given criteria.' });
    }

    const totalAmount = unbilledSessions.reduce((sum, s) => sum + parseFloat(s.totalEarned || 0), 0);

    const newReport = await Report.create({
      userId,
      clientId,
      startDate,
      endDate,
      totalAmount,
      status: 'draft',
    }, { transaction: t });

    const reportItems = unbilledSessions.map(s => ({
      reportId: newReport.id,
      workSessionId: s.id,
    }));

    await ReportItem.bulkCreate(reportItems, { transaction: t });

    await t.commit();
    res.status(201).json(newReport);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/reports
// @desc    Get all reports for a user
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { userId: req.user.userId },
      include: [{ model: Client, as: 'client' }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/reports/:id
// @desc    Get a single report by ID
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({
      where: { id, userId: req.user.userId },
      include: [
        { model: Client, as: 'client' },
        {
          model: ReportItem,
          as: 'items',
          include: [{ model: WorkSession }],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/reports/:id/send
// @desc    Send a report to the client (marks as 'sent')
// @access  Private
exports.sendReport = async (req, res) => {};

// @route   GET api/reports/approve/:token
// @desc    Approve a report (public link for client)
// @access  Public
exports.approveReport = async (req, res) => {};
