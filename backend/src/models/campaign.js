const { createDoc, updateDoc, deleteDoc, getDoc, queryDocs } = require('./firestore');
const logger = require('../config/logger');

class CampaignModel {
  static collection = 'campaigns';

  static async createCampaign(campaignData) {
    try {
      return await createDoc(this.collection, {
        ...campaignData,
        status: 'draft',
        urls: campaignData.urls.map(url => ({
          ...url,
          status: 'pending'
        }))
      });
    } catch (error) {
      logger.error('Error creating campaign', { error, campaignData });
      throw error;
    }
  }

  static async updateCampaign(id, campaignData) {
    try {
      return await updateDoc(this.collection, id, campaignData);
    } catch (error) {
      logger.error('Error updating campaign', { error, id, campaignData });
      throw error;
    }
  }

  static async deleteCampaign(id) {
    try {
      return await deleteDoc(this.collection, id);
    } catch (error) {
      logger.error('Error deleting campaign', { error, id });
      throw error;
    }
  }

  static async getCampaignById(id) {
    try {
      return await getDoc(this.collection, id);
    } catch (error) {
      logger.error('Error getting campaign', { error, id });
      throw error;
    }
  }

  static async getCampaignsByUserId(userId) {
    try {
      return await queryDocs(this.collection, [
        { field: 'userId', operator: '==', value: userId }
      ]);
    } catch (error) {
      logger.error('Error getting campaigns by user', { error, userId });
      throw error;
    }
  }

  static async updateCampaignStatus(id, status) {
    try {
      const updateData = {
        status,
        ...(status === 'running' && { startedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() })
      };
      return await this.updateCampaign(id, updateData);
    } catch (error) {
      logger.error('Error updating campaign status', { error, id, status });
      throw error;
    }
  }

  static async updateUrlInCampaign(campaignId, urlId, status, error = null) {
    try {
      const campaign = await this.getCampaignById(campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const updatedUrls = campaign.urls.map(url => {
        if (url.urlId === urlId) {
          return {
            ...url,
            status,
            processedAt: new Date(),
            ...(error && { error })
          };
        }
        return url;
      });

      return await this.updateCampaign(campaignId, { urls: updatedUrls });
    } catch (error) {
      logger.error('Error updating URL in campaign', { error, campaignId, urlId, status });
      throw error;
    }
  }
}

module.exports = CampaignModel;
