import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { eventService, calendarService } from '../services/api';
import EventModal from './EventModal';
import './Calendar.css';

// Configure moment to start week on Monday
// IMPORTANT: Must be done BEFORE creating the localizer
// In moment.js: 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
moment.updateLocale('en', {
  week: {
    dow: 1, // First day of week is Monday
    doy: 4  // Week that contains Jan 4th is the first week of the year
  }
});

// Verify the configuration
console.log('Moment first day of week:', moment.localeData().firstDayOfWeek()); // Should print 1 for Monday

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(BigCalendar);

function Calendar({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [calendars, setCalendars] = useState({ owned: [], shared: [] });
  const [selectedCalendarIds, setSelectedCalendarIds] = useState([]);
  const [defaultCalendarId, setDefaultCalendarId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    if (calendars.owned && calendars.owned.length > 0) {
      // Select all calendars by default
      const allCalendarIds = [
        ...calendars.owned.map(c => c.id),
        ...(calendars.shared || []).map(c => c.id)
      ];
      setSelectedCalendarIds(allCalendarIds);
    }
  }, [calendars]);

  useEffect(() => {
    if (selectedCalendarIds.length > 0 || (calendars.owned && calendars.owned.length > 0)) {
      fetchEvents();
    }
  }, [selectedCalendarIds]);

  const fetchCalendars = async () => {
    try {
      const response = await calendarService.getCalendars();
      const ownedCalendars = response.data.owned || [];
      const sharedCalendars = response.data.shared || [];

      setCalendars({
        owned: ownedCalendars,
        shared: sharedCalendars
      });

      // Set default calendar (find "My Calendar" or first calendar)
      const myCalendar = ownedCalendars.find(cal => cal.isDefault || cal.name === 'My Calendar');
      if (myCalendar) {
        setDefaultCalendarId(myCalendar.id);
      } else if (ownedCalendars.length > 0) {
        setDefaultCalendarId(ownedCalendars[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch calendars:', error);
      // Continue even if calendars fail
      setCalendars({ owned: [], shared: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const calendarIdsToFetch = selectedCalendarIds.length > 0 ? selectedCalendarIds : null;

      // Calculate date range for fetching recurring events (3 months before and after)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 4, 0);

      const response = await eventService.getEvents(
        startDate.toISOString(),
        endDate.toISOString(),
        calendarIdsToFetch
      );

      const formattedEvents = response.data.events.map(event => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);

        // Debug log for recurring events
        if (event.isRecurring || event.isRecurringInstance) {
          console.log('Formatting recurring event:', {
            title: event.title,
            startTime: event.startTime,
            startDate: start,
            startDay: start.getDay(),
            startUTCDay: start.getUTCDay()
          });
        }

        return {
          ...event,
          start,
          end
        };
      });
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    // Default to 1 hour event instead of full day
    const endTime = new Date(start);
    endTime.setHours(endTime.getHours() + 1);

    setSelectedEvent({
      title: '',
      description: '',
      startTime: start.toISOString(),
      endTime: endTime.toISOString(),
      reminderTime: user.preferences?.defaultReminderTime || 15,
      color: '#3174ad',
      isImportant: false,
      calendarId: defaultCalendarId
    });
    setModalMode('create');
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (modalMode === 'create') {
        // Ensure calendarId is included
        const eventDataWithCalendar = {
          ...eventData,
          calendarId: eventData.calendarId || defaultCalendarId
        };
        const response = await eventService.createEvent(eventDataWithCalendar);

        // Refresh events to show all recurring instances
        await fetchEvents();
      } else {
        // Handle editing recurring events
        if (eventData.isRecurringInstance && eventData.editScope === 'this') {
          // Create an exception for this instance
          const parentId = eventData.recurringEventId || selectedEvent.id;
          await eventService.createException(parentId, {
            originalStartTime: eventData.originalStartTime,
            title: eventData.title,
            description: eventData.description,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            reminderTime: eventData.reminderTime,
            color: eventData.color,
            isImportant: eventData.isImportant
          });
        } else if ((eventData.isRecurringInstance || selectedEvent.isRecurring) && eventData.editScope === 'all') {
          // Update the entire series
          const parentId = eventData.recurringEventId || selectedEvent.id;
          await eventService.updateRecurringSeries(parentId, {
            title: eventData.title,
            description: eventData.description,
            reminderTime: eventData.reminderTime,
            color: eventData.color,
            isImportant: eventData.isImportant,
            calendarId: eventData.calendarId
          });
        } else {
          // Regular single event update
          const response = await eventService.updateEvent(selectedEvent.id, eventData);
        }

        // Refresh events to show updates
        await fetchEvents();
      }
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (editScope, isRecurringInstance, recurringEventId, originalStartTime) => {
    // Determine if this is a recurring event
    const isRecurring = selectedEvent.isRecurring || isRecurringInstance;

    let confirmMessage = 'Are you sure you want to delete this event?';
    if (isRecurring && editScope === 'all') {
      confirmMessage = 'Are you sure you want to delete all events in this series?';
    } else if (isRecurring && editScope === 'this') {
      confirmMessage = 'Are you sure you want to delete this occurrence?';
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (isRecurringInstance && editScope === 'this') {
        // Delete single instance of recurring event
        const parentId = recurringEventId || selectedEvent.id;
        await eventService.deleteInstance(parentId, originalStartTime);
      } else if ((isRecurringInstance || selectedEvent.isRecurring) && editScope === 'all') {
        // Delete entire series
        const parentId = recurringEventId || selectedEvent.id;
        await eventService.deleteSeries(parentId);
      } else {
        // Delete regular single event
        await eventService.deleteEvent(selectedEvent.id);
      }

      // Refresh events
      await fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      // If this is a recurring event instance, create an exception
      if (event.isRecurringInstance) {
        const parentId = event.recurringEventId || event.id.split('_')[0];
        await eventService.createException(parentId, {
          originalStartTime: event.originalStartTime,
          title: event.title,
          description: event.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          reminderTime: event.reminderTime,
          color: event.color,
          isImportant: event.isImportant
        });

        // Refresh events
        await fetchEvents();
      } else {
        // Regular single event
        const updatedEventData = {
          title: event.title,
          description: event.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          reminderTime: event.reminderTime,
          color: event.color,
          isImportant: event.isImportant,
          calendarId: event.calendarId
        };

        const response = await eventService.updateEvent(event.id, updatedEventData);

        // Refresh events
        await fetchEvents();
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to move event. Please try again.');
      // Revert by refetching
      fetchEvents();
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      // If this is a recurring event instance, create an exception
      if (event.isRecurringInstance) {
        const parentId = event.recurringEventId || event.id.split('_')[0];
        await eventService.createException(parentId, {
          originalStartTime: event.originalStartTime,
          title: event.title,
          description: event.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          reminderTime: event.reminderTime,
          color: event.color,
          isImportant: event.isImportant
        });

        // Refresh events
        await fetchEvents();
      } else {
        // Regular single event
        const updatedEventData = {
          title: event.title,
          description: event.description,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          reminderTime: event.reminderTime,
          color: event.color,
          isImportant: event.isImportant,
          calendarId: event.calendarId
        };

        const response = await eventService.updateEvent(event.id, updatedEventData);

        // Refresh events
        await fetchEvents();
      }
    } catch (error) {
      console.error('Failed to resize event:', error);
      alert('Failed to resize event. Please try again.');
      // Revert by refetching
      fetchEvents();
    }
  };

  const toggleCalendar = (calendarId) => {
    if (isMobile) {
      // On mobile, only one calendar at a time (radio button behavior)
      setSelectedCalendarIds([calendarId]);
    } else {
      // On desktop, multiple calendars (checkbox behavior)
      setSelectedCalendarIds(prev => {
        if (prev.includes(calendarId)) {
          return prev.filter(id => id !== calendarId);
        } else {
          return [...prev, calendarId];
        }
      });
    }
  };

  const selectAllCalendars = () => {
    const allCalendarIds = [
      ...calendars.owned.map(c => c.id),
      ...calendars.shared.map(c => c.id)
    ];
    setSelectedCalendarIds(allCalendarIds);
  };

  const deselectAllCalendars = () => {
    setSelectedCalendarIds([]);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color || '#3174ad',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  const getSelectedCalendarName = () => {
    if (selectedCalendarIds.length === 0) return 'All Calendars';
    if (selectedCalendarIds.length === 1) {
      const calendar = [...calendars.owned, ...calendars.shared].find(c => c.id === selectedCalendarIds[0]);
      return calendar ? calendar.name : 'Calendar';
    }
    return `${selectedCalendarIds.length} Calendars`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-container">
        <div className="container">
          <div className="calendar-main">
            <div className="calendar-wrapper">
              {isMobile && (
                <div className="mobile-calendar-selector">
                  <button
                    className="btn-calendar-toggle"
                    onClick={() => setShowCalendarSelector(!showCalendarSelector)}
                  >
                    <span className="calendar-icon">📅</span>
                    {getSelectedCalendarName()}
                    <span className="toggle-icon">{showCalendarSelector ? '▲' : '▼'}</span>
                  </button>

                  {showCalendarSelector && (
                    <div className="calendar-selector-dropdown">
                      {calendars.owned && calendars.owned.length > 0 && (
                        <>
                          {calendars.owned.map(calendar => (
                            <label key={calendar.id} className="calendar-item-mobile">
                              <input
                                type="radio"
                                name="calendar"
                                checked={selectedCalendarIds.includes(calendar.id)}
                                onChange={() => {
                                  toggleCalendar(calendar.id);
                                  setShowCalendarSelector(false);
                                }}
                              />
                              <span
                                className="calendar-color"
                                style={{ backgroundColor: calendar.color }}
                              ></span>
                              <span className="calendar-name">{calendar.name}</span>
                            </label>
                          ))}
                        </>
                      )}

                      {calendars.shared && calendars.shared.length > 0 && (
                        <>
                          {calendars.shared.map(calendar => (
                            <label key={calendar.id} className="calendar-item-mobile">
                              <input
                                type="radio"
                                name="calendar"
                                checked={selectedCalendarIds.includes(calendar.id)}
                                onChange={() => {
                                  toggleCalendar(calendar.id);
                                  setShowCalendarSelector(false);
                                }}
                              />
                              <span
                                className="calendar-color"
                                style={{ backgroundColor: calendar.color }}
                              ></span>
                              <span className="calendar-name">{calendar.name}</span>
                            </label>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: isMobile ? 'calc(100vh - 280px)' : 600, minHeight: isMobile ? '500px' : '600px' }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventStyleGetter}
                views={isMobile ? ['week', 'day', 'work_week'] : ['month', 'week', 'day', 'work_week', 'agenda']}
                defaultView={isMobile ? 'week' : 'month'}
                resizable
                draggableAccessor={() => true}
              />
            </div>

            {!isMobile && (
              <div className="calendar-sidebar">
                <div className="calendar-filters">
                  <div className="filter-header">
                    <h3>Calendars</h3>
                    <div className="filter-actions">
                      <button onClick={selectAllCalendars} className="btn-link">All</button>
                      <button onClick={deselectAllCalendars} className="btn-link">None</button>
                    </div>
                  </div>

                  {calendars.owned && calendars.owned.length > 0 && (
                    <div className="calendar-group">
                      <h4>My Calendars</h4>
                      {calendars.owned.map(calendar => (
                        <label key={calendar.id} className="calendar-item">
                          <input
                            type="checkbox"
                            checked={selectedCalendarIds.includes(calendar.id)}
                            onChange={() => toggleCalendar(calendar.id)}
                          />
                          <span
                            className="calendar-color"
                            style={{ backgroundColor: calendar.color }}
                          ></span>
                          <span className="calendar-name">{calendar.name}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {calendars.shared && calendars.shared.length > 0 && (
                    <div className="calendar-group">
                      <h4>Shared With Me</h4>
                      {calendars.shared.map(calendar => (
                        <label key={calendar.id} className="calendar-item">
                          <input
                            type="checkbox"
                            checked={selectedCalendarIds.includes(calendar.id)}
                            onChange={() => toggleCalendar(calendar.id)}
                          />
                          <span
                            className="calendar-color"
                            style={{ backgroundColor: calendar.color }}
                          ></span>
                          <span className="calendar-name">{calendar.name}</span>
                          <span className="calendar-owner"> ({calendar.owner?.email})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showModal && (
            <EventModal
              event={selectedEvent}
              mode={modalMode}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              onClose={() => {
                setShowModal(false);
                setSelectedEvent(null);
              }}
              calendars={calendars}
              defaultCalendarId={defaultCalendarId}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default Calendar;
