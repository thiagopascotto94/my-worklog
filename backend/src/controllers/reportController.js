const crypto = require('crypto');
const { Report, ReportItem, WorkSession, Client, ClientContact, sequelize } = require('../models');
const { Op } = require('sequelize');

// @route   POST api/reports/generate
// @desc    Generate a new report
// @access  Private
exports.generateReport = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { clientId, startDate, endDate, hourlyRate } = req.body;
    const userId = req.user.userId;

    if (!hourlyRate || isNaN(parseFloat(hourlyRate))) {
        return res.status(400).json({ message: 'A valid hourly rate is required.' });
    }

    const rate = parseFloat(hourlyRate);

    const sessions = await WorkSession.findAll({
      where: {
        userId,
        clientId,
        status: 'stopped',
        endTime: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      include: [{ model: ReportItem, required: false }],
      transaction: t,
    });

    const unbilledSessions = sessions.filter(s => !s.ReportItem);

    if (unbilledSessions.length === 0) {
      await t.rollback();
      return res.status(404).json({ message: 'No billable sessions found for the given criteria.' });
    }

    let newTotalAmount = 0;
    for (const session of unbilledSessions) {
        const durationInSeconds = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 - session.totalPausedSeconds;
        const durationInHours = durationInSeconds / 3600;
        session.hourlyRate = rate;
        session.totalEarned = durationInHours * rate;
        newTotalAmount += session.totalEarned;
        await session.save({ transaction: t });
    }

    const newReport = await Report.create({
      userId,
      clientId,
      startDate,
      endDate,
      hourlyRate: rate,
      totalAmount: newTotalAmount,
      status: 'draft',
    }, { transaction: t });

    const reportItems = unbilledSessions.map(s => ({
      reportId: newReport.id,
      workSessionId: s.id,
    }));

    await ReportItem.bulkCreate(reportItems, { transaction: t });

    await t.commit();

    const createdReport = await Report.findOne({
        where: { id: newReport.id },
        include: [
            { model: Client, as: 'client' },
            { model: ReportItem, as: 'items', include: [{ model: WorkSession }] }
        ]
    });

    res.status(201).json(createdReport);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/reports/client/:clientId
// @desc    Get all reports for a specific client and a summary
// @access  Private
exports.getReportsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user.userId;

    const reports = await Report.findAll({
      where: { userId, clientId },
      include: [
        { model: Client, as: 'client' },
        {
          model: ReportItem,
          as: 'items',
          include: [{ model: WorkSession }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    let totalAmount = 0;
    let totalSeconds = 0;

    reports.forEach(report => {
      totalAmount += parseFloat(report.totalAmount);
      report.items.forEach(item => {
        if (item.WorkSession) {
          const session = item.WorkSession;
          if (session.endTime && session.startTime) {
            const durationInSeconds = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 - (session.totalPausedSeconds || 0);
            totalSeconds += durationInSeconds;
          }
        }
      });
    });

    const totalHours = totalSeconds / 3600;
    const averageHourlyRate = totalHours > 0 ? totalAmount / totalHours : 0;

    const summary = {
      totalReports: reports.length,
      totalAmount,
      totalHours,
      averageHourlyRate,
    };

    res.status(200).json({ reports, summary });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST api/reports/:id/duplicate
// @desc    Duplicate a report
// @access  Private
exports.duplicateReport = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const originalReport = await Report.findOne({
      where: { id, userId },
      include: [{ model: ReportItem, as: 'items' }],
      transaction: t,
    });

    if (!originalReport) {
      await t.rollback();
      return res.status(404).json({ message: 'Original report not found.' });
    }

    const newReport = await Report.create({
      userId,
      clientId: originalReport.clientId,
      startDate: originalReport.startDate,
      endDate: originalReport.endDate,
      hourlyRate: originalReport.hourlyRate,
      totalAmount: originalReport.totalAmount,
      status: 'draft',
    }, { transaction: t });

    const newReportItems = originalReport.items.map(item => ({
      reportId: newReport.id,
      workSessionId: item.workSessionId,
    }));

    await ReportItem.bulkCreate(newReportItems, { transaction: t });

    await t.commit();

    const createdReport = await Report.findOne({
        where: { id: newReport.id },
        include: [
            { model: Client, as: 'client' },
            { model: ReportItem, as: 'items', include: [{ model: WorkSession }] }
        ]
    });

    res.status(201).json(createdReport);
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

// @route   PUT api/reports/:id
// @desc    Update a report (e.g., hourly rate)
// @access  Private
exports.updateReport = async (req, res) => {
  const { id } = req.params;
  const { hourlyRate } = req.body;
  const userId = req.user.userId;

  const t = await sequelize.transaction();

  try {
    const report = await Report.findOne({
      where: { id, userId },
      include: [{ model: ReportItem, as: 'items', include: [{ model: WorkSession }] }],
      transaction: t,
    });

    if (!report) {
      await t.rollback();
      return res.status(404).json({ message: 'Report not found' });
    }

    report.hourlyRate = hourlyRate;

    let newTotalAmount = 0;

    for (const item of report.items) {
      const session = item.WorkSession;
      session.hourlyRate = hourlyRate;
      const durationInSeconds = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 - session.totalPausedSeconds;
      const durationInHours = durationInSeconds / 3600;
      session.totalEarned = durationInHours * hourlyRate;
      newTotalAmount += session.totalEarned;
      await session.save({ transaction: t });
    }

    report.totalAmount = newTotalAmount;
    await report.save({ transaction: t });

    await t.commit();

    // Re-fetch the full report to return
    const updatedReport = await Report.findOne({
      where: { id },
      include: [
        { model: Client, as: 'client' },
        { model: ReportItem, as: 'items', include: [{ model: WorkSession }] },
        { model: ClientContact, as: 'approver' }
      ],
    });

    res.status(200).json(updatedReport);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE api/reports/:id
// @desc    Delete a report
// @access  Private
exports.deleteReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const t = await sequelize.transaction();

  try {
    const report = await Report.findOne({ where: { id, userId }, transaction: t });

    if (!report) {
      await t.rollback();
      return res.status(404).json({ message: 'Report not found' });
    }

    // Delete associated report items first
    await ReportItem.destroy({ where: { reportId: id }, transaction: t });

    // Then delete the report
    await report.destroy({ transaction: t });

    await t.commit();

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   POST api/reports/:id/share
// @desc    Generate a shareable link for a report
// @access  Private
exports.shareReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const report = await Report.findOne({ where: { id, userId } });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    report.shareToken = shareToken;
    report.status = 'sent';
    await report.save();

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET api/reports/public/:token
// @desc    Get a report by its public share token
// @access  Public
exports.getPublicReportByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const report = await Report.findOne({
      where: { shareToken: token },
      include: [
        { model: Client, as: 'client' },
        {
          model: ReportItem,
          as: 'items',
          include: [{ model: WorkSession }],
        },
        { model: ClientContact, as: 'approver' }
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

// @route   POST api/reports/public/:token/status
// @desc    Approve or decline a report
// @access  Public
exports.updateReportStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { token } = req.params;
    const { status, celular, rejectionReason } = req.body;

    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const report = await Report.findOne({ where: { shareToken: token }, transaction: t });
    if (!report) {
      await t.rollback();
      return res.status(404).json({ message: 'Report not found.' });
    }

    const contact = await ClientContact.findOne({ where: { celular }, transaction: t });
    if (!contact) {
      await t.rollback();
      return res.status(404).json({ message: 'Contact not found for the provided phone number.' });
    }

    // Security checks
    if (contact.clientId !== report.clientId) {
      await t.rollback();
      return res.status(403).json({ message: 'This contact is not associated with the report\'s client.' });
    }
    if (!contact.allowAproveReport) {
      await t.rollback();
      return res.status(403).json({ message: 'This contact does not have permission to approve reports.' });
    }

    // Update report
    report.status = status;
    report.approvedBy = contact.id;
    report.approvedAt = new Date();
    if (status === 'declined') {
      report.rejectionReason = rejectionReason || null;
    }
    await report.save({ transaction: t });

    await t.commit();

    res.status(200).json({ message: `Report successfully marked as ${status}.` });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
