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
    calendarId: defaultCalendarId || null,
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [],
      endDate: null,
      count: null
    }
  });

  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [editScope, setEditScope] = useState('this'); // 'this' or 'all' for recurring events

  useEffect(() => {
    if (event) {
      const isRecurring = event.isRecurring || false;

      // For new recurring events, pre-select the day based on the event's start time
      let initialDaysOfWeek = [];
      if (!isRecurring && event.startTime) {
        const startDate = new Date(event.startTime);
        const utcDay = startDate.getUTCDay();
        initialDaysOfWeek = [utcDay];
        console.log('Pre-selecting day based on start time:', { startTime: event.startTime, utcDay });
      }

      setFormData({
        title: event.title || '',
        description: event.description || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        reminderTime: event.reminderTime || 15,
        color: event.color || '#3174ad',
        isImportant: event.isImportant || false,
        calendarId: event.calendarId || defaultCalendarId || null,
        isRecurring: isRecurring,
        recurringPattern: event.recurringPattern || {
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: initialDaysOfWeek,
          endDate: null,
          count: null
        }
      });
      setShowRecurringOptions(isRecurring);
    }
  }, [event, defaultCalendarId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRecurringPatternChange = (field, value) => {
    setFormData({
      ...formData,
      recurringPattern: {
        ...formData.recurringPattern,
        [field]: value
      }
    });
  };

  const toggleDayOfWeek = (day) => {
    const currentDays = formData.recurringPattern.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();

    handleRecurringPatternChange('daysOfWeek', newDays);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSave = { ...formData };

    // For recurring weekly events, fix the day selection to use LOCAL day not UTC day
    if (formData.isRecurring && formData.recurringPattern.frequency === 'weekly') {
      const startDate = new Date(formData.startTime);

      // Get the LOCAL day of week for this event
      const localDay = startDate.getDay();

      // Get timezone offset in minutes (e.g., EST is -300 = -5 hours)
      const timezoneOffset = startDate.getTimezoneOffset();

      // Update the pattern to use the local day and include timezone offset
      dataToSave.recurringPattern = {
        ...formData.recurringPattern,
        daysOfWeek: [localDay],
        timezoneOffset: timezoneOffset
      };

      console.log('Recurring event using LOCAL timezone:', {
        startTime: formData.startTime,
        localDay: localDay,
        localDayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][localDay],
        timezoneOffset: timezoneOffset,
        timezoneOffsetHours: timezoneOffset / 60,
        pattern: dataToSave.recurringPattern
      });
    }

    // Pass editScope to parent for handling recurring events
    onSave({
      ...dataToSave,
      editScope: editScope,
      isRecurringInstance: event?.isRecurringInstance,
      recurringEventId: event?.recurringEventId,
      originalStartTime: event?.originalStartTime
    });
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

          {mode === 'create' && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => {
                    setFormData({ ...formData, isRecurring: e.target.checked });
                    setShowRecurringOptions(e.target.checked);
                  }}
                />
                <span>🔁 Repeat</span>
              </label>
            </div>
          )}

          {showRecurringOptions && formData.isRecurring && (
            <div className="recurring-options" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
              <h3 style={{ marginTop: 0 }}>Recurrence Pattern</h3>

              <div className="form-group">
                <label htmlFor="frequency">Repeat</label>
                <select
                  id="frequency"
                  value={formData.recurringPattern.frequency}
                  onChange={(e) => handleRecurringPatternChange('frequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="interval">Repeat every</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    id="interval"
                    value={formData.recurringPattern.interval}
                    onChange={(e) => handleRecurringPatternChange('interval', parseInt(e.target.value))}
                    min="1"
                    style={{ width: '80px' }}
                  />
                  <span>
                    {formData.recurringPattern.frequency === 'daily' && 'day(s)'}
                    {formData.recurringPattern.frequency === 'weekly' && 'week(s)'}
                    {formData.recurringPattern.frequency === 'monthly' && 'month(s)'}
                    {formData.recurringPattern.frequency === 'yearly' && 'year(s)'}
                  </span>
                </div>
              </div>

              {formData.recurringPattern.frequency === 'weekly' && (
                <div className="form-group">
                  <label>Repeat on</label>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, displayIndex) => {
                      // Map display index to moment.js day number (Monday=1 to Sunday=0)
                      const momentDayIndex = displayIndex === 6 ? 0 : displayIndex + 1;
                      return (
                        <button
                          key={displayIndex}
                          type="button"
                          onClick={() => toggleDayOfWeek(momentDayIndex)}
                          style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            border: '2px solid #3174ad',
                            backgroundColor: formData.recurringPattern.daysOfWeek?.includes(momentDayIndex) ? '#3174ad' : 'white',
                            color: formData.recurringPattern.daysOfWeek?.includes(momentDayIndex) ? 'white' : '#3174ad',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Mon, Tue, Wed, Thu, Fri, Sat, Sun
                  </small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="endDate">End date (optional)</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.recurringPattern.endDate ? formData.recurringPattern.endDate.split('T')[0] : ''}
                  onChange={(e) => handleRecurringPatternChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="count">Or, number of occurrences (optional)</label>
                <input
                  type="number"
                  id="count"
                  value={formData.recurringPattern.count || ''}
                  onChange={(e) => handleRecurringPatternChange('count', e.target.value ? parseInt(e.target.value) : null)}
                  min="1"
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>
          )}

          {mode === 'edit' && (event?.isRecurring || event?.isRecurringInstance || event?.isPartOfSeries) && (
            <div className="form-group">
              <label>Edit</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="editScope"
                    value="this"
                    checked={editScope === 'this'}
                    onChange={(e) => setEditScope(e.target.value)}
                  />
                  <span>This event only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="radio"
                    name="editScope"
                    value="all"
                    checked={editScope === 'all'}
                    onChange={(e) => setEditScope(e.target.value)}
                  />
                  <span>All events in the series</span>
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">
              {mode === 'create' ? 'Create' : 'Update'}
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(editScope, event?.isRecurringInstance, event?.recurringEventId, event?.originalStartTime)}
              >
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
