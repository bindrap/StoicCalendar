import React, { useState } from 'react';
import { userService } from '../services/api';
import ContactsManager from './ContactsManager';
import './Settings.css';

function Settings({ user, setUser }) {
  const [preferences, setPreferences] = useState(user.preferences || {});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updatePreferences(preferences);
      setUser({ ...user, preferences: response.data.preferences });
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="container">
        <h1>Settings</h1>

        <div className="card">
          <ContactsManager />
        </div>

        <div className="settings-section">
          <div className="card">
            <h2>Notification Preferences</h2>
            <form onSubmit={handleSavePreferences}>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={preferences.emailNotifications || false}
                    onChange={handlePreferenceChange}
                  />
                  <span>Email notifications for event reminders</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={preferences.smsNotifications || false}
                    onChange={handlePreferenceChange}
                  />
                  <span>SMS notifications for event reminders</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="defaultReminderTime">Default reminder time (minutes before event)</label>
                <input
                  type="number"
                  id="defaultReminderTime"
                  name="defaultReminderTime"
                  value={preferences.defaultReminderTime || 15}
                  onChange={handlePreferenceChange}
                  min="0"
                />
              </div>

              <h3>Daily Stoic Quote</h3>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="dailyQuote"
                    checked={preferences.dailyQuote || false}
                    onChange={handlePreferenceChange}
                  />
                  <span>Enable daily stoic quote</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="quoteDelivery">Quote delivery method</label>
                <select
                  id="quoteDelivery"
                  name="quoteDelivery"
                  value={preferences.quoteDelivery || 'web'}
                  onChange={handlePreferenceChange}
                  disabled={!preferences.dailyQuote}
                >
                  <option value="web">Website only</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                Save Preferences
              </button>
            </form>
          </div>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
