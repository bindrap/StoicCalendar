import React, { useState, useEffect } from 'react';
import { contactService } from '../services/api';
import './ContactsManager.css';

function ContactsManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'email',
    value: '',
    label: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await contactService.getContacts();
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await contactService.createContact(newContact);
      setContacts([...contacts, response.data.contact]);
      setNewContact({ type: 'email', value: '', label: '' });
      setShowAddForm(false);
      setMessage({ type: 'success', text: 'Contact added successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to add contact'
      });
    }
  };

  const handleToggleNotifications = async (contact) => {
    try {
      const response = await contactService.updateContact(contact.id, {
        receiveNotifications: !contact.receiveNotifications
      });
      setContacts(contacts.map(c => c.id === contact.id ? response.data.contact : c));
      setMessage({ type: 'success', text: 'Contact updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update contact' });
    }
  };

  const handleSetPrimary = async (contact) => {
    try {
      const response = await contactService.updateContact(contact.id, {
        isPrimary: true
      });
      // Refresh all contacts to update primary status
      fetchContacts();
      setMessage({ type: 'success', text: 'Primary contact updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update contact' });
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await contactService.deleteContact(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
      setMessage({ type: 'success', text: 'Contact deleted!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete contact' });
    }
  };

  const emailContacts = contacts.filter(c => c.type === 'email');
  const phoneContacts = contacts.filter(c => c.type === 'phone');

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="contacts-manager">
      <div className="contacts-header">
        <h2>Contact Information</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddContact} className="add-contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={newContact.type}
                onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="value">
                {newContact.type === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <input
                type={newContact.type === 'email' ? 'email' : 'tel'}
                id="value"
                value={newContact.value}
                onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                placeholder={newContact.type === 'email' ? 'email@example.com' : '+12345678900'}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="label">Label (optional)</label>
              <input
                type="text"
                id="label"
                value={newContact.label}
                onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                placeholder="e.g., Work, Personal"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Add Contact</button>
        </form>
      )}

      <div className="contacts-sections">
        <div className="contact-section">
          <h3>Email Addresses</h3>
          {emailContacts.length === 0 ? (
            <p className="no-contacts">No email addresses added yet.</p>
          ) : (
            <div className="contacts-list">
              {emailContacts.map(contact => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-info">
                    <div className="contact-value">
                      {contact.value}
                      {contact.isPrimary && <span className="badge-primary">Primary</span>}
                      {contact.label && <span className="contact-label">({contact.label})</span>}
                    </div>
                  </div>
                  <div className="contact-actions">
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={contact.receiveNotifications}
                        onChange={() => handleToggleNotifications(contact)}
                      />
                      <span>Notifications</span>
                    </label>
                    {!contact.isPrimary && (
                      <button
                        className="btn-link"
                        onClick={() => handleSetPrimary(contact)}
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      className="btn-link btn-danger-link"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="contact-section">
          <h3>Phone Numbers</h3>
          {phoneContacts.length === 0 ? (
            <p className="no-contacts">No phone numbers added yet.</p>
          ) : (
            <div className="contacts-list">
              {phoneContacts.map(contact => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-info">
                    <div className="contact-value">
                      {contact.value}
                      {contact.isPrimary && <span className="badge-primary">Primary</span>}
                      {contact.label && <span className="contact-label">({contact.label})</span>}
                    </div>
                  </div>
                  <div className="contact-actions">
                    <label className="checkbox-inline">
                      <input
                        type="checkbox"
                        checked={contact.receiveNotifications}
                        onChange={() => handleToggleNotifications(contact)}
                      />
                      <span>Notifications</span>
                    </label>
                    {!contact.isPrimary && (
                      <button
                        className="btn-link"
                        onClick={() => handleSetPrimary(contact)}
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      className="btn-link btn-danger-link"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactsManager;
