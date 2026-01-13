import React, { useState, useEffect } from 'react';

function EventModal({ event, mode, onSave, onDelete, onClose, calendars, defaultCalendarId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    reminderTime: 15,
    color: '#3174ad',
    isImportant: false,
    calendarId: defaultCalendarId || null
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        reminderTime: event.reminderTime || 15,
        color: event.color || '#3174ad',
        isImportant: event.isImportant || false,
        calendarId: event.calendarId || defaultCalendarId || null
      });
    }
  }, [event, defaultCalendarId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create Event' : 'Edit Event'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formatDateTimeLocal(formData.startTime)}
              onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value).toISOString() })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formatDateTimeLocal(formData.endTime)}
              onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value).toISOString() })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminderTime">Reminder (minutes before)</label>
            <input
              type="number"
              id="reminderTime"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </div>

          {calendars && calendars.owned && calendars.owned.length > 0 && (
            <div className="form-group">
              <label htmlFor="calendarId">Calendar</label>
              <select
                id="calendarId"
                name="calendarId"
                value={formData.calendarId || ''}
                onChange={handleChange}
              >
                {calendars.owned.map(calendar => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isImportant"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              />
              <span>⭐ Mark as Important (SMS + Email notifications)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              {mode === 'create' ? 'Create' : 'Update'}
            </button>

            {mode === 'edit' && (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                Delete
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
