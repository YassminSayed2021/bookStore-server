const Settings = require('../models/settingsModel');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      status: "Success",
      data: settings
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching settings",
      error: err.message || err
    });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Settings.getSettings();
    
    // Update fields
    if (updates.siteName) settings.siteName = updates.siteName;
    if (updates.logo) settings.logo = updates.logo;
    if (updates.contactEmail) settings.contactEmail = updates.contactEmail;
    if (updates.supportPhone) settings.supportPhone = updates.supportPhone;
    if (updates.address) settings.address = updates.address;
    
    // Update social links
    if (updates.socialLinks) {
      if (updates.socialLinks.facebook !== undefined) settings.socialLinks.facebook = updates.socialLinks.facebook;
      if (updates.socialLinks.twitter !== undefined) settings.socialLinks.twitter = updates.socialLinks.twitter;
      if (updates.socialLinks.instagram !== undefined) settings.socialLinks.instagram = updates.socialLinks.instagram;
      if (updates.socialLinks.linkedin !== undefined) settings.socialLinks.linkedin = updates.socialLinks.linkedin;
    }
    
    // Update shipping options
    if (updates.shippingOptions) {
      settings.shippingOptions = updates.shippingOptions;
    }
    
    // Update payment gateways
    if (updates.paymentGateways) {
      if (updates.paymentGateways.paypal !== undefined) settings.paymentGateways.paypal = updates.paymentGateways.paypal;
      if (updates.paymentGateways.stripe !== undefined) settings.paymentGateways.stripe = updates.paymentGateways.stripe;
      if (updates.paymentGateways.cod !== undefined) settings.paymentGateways.cod = updates.paymentGateways.cod;
    }
    
    // Update email notifications
    if (updates.emailNotifications) {
      if (updates.emailNotifications.newOrder !== undefined) settings.emailNotifications.newOrder = updates.emailNotifications.newOrder;
      if (updates.emailNotifications.orderStatusChange !== undefined) settings.emailNotifications.orderStatusChange = updates.emailNotifications.orderStatusChange;
      if (updates.emailNotifications.newUser !== undefined) settings.emailNotifications.newUser = updates.emailNotifications.newUser;
      if (updates.emailNotifications.newReview !== undefined) settings.emailNotifications.newReview = updates.emailNotifications.newReview;
    }
    
    // Update maintenance mode
    if (updates.maintenance) {
      if (updates.maintenance.enabled !== undefined) settings.maintenance.enabled = updates.maintenance.enabled;
      if (updates.maintenance.message !== undefined) settings.maintenance.message = updates.maintenance.message;
    }
    
    await settings.save();
    
    res.status(200).json({
      status: "Success",
      message: "Settings updated successfully",
      data: settings
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Error updating settings",
      error: err.message || err
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};