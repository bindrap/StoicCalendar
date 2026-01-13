import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { eventService, calendarService } from '../services/api';
import EventModal from './EventModal';
import './Calendar.css';

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
      const response = await eventService.getEvents(null, null, calendarIdsToFetch);
      const formattedEvents = response.data.events.map(event => ({
        ...event,
        start: new Date(event.startTime),
        end: new Date(event.endTime)
      }));
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
        const newEvent = {
          ...response.data.event,
          start: new Date(response.data.event.startTime),
          end: new Date(response.data.event.endTime)
        };
        // Only add to visible events if the calendar is selected
        if (selectedCalendarIds.includes(newEvent.calendarId)) {
          setEvents([...events, newEvent]);
        }
      } else {
        const response = await eventService.updateEvent(selectedEvent.id, eventData);
        const updatedEvent = {
          ...response.data.event,
          start: new Date(response.data.event.startTime),
          end: new Date(response.data.event.endTime)
        };
        // Update if visible, or remove if calendar was changed to unselected one
        if (selectedCalendarIds.includes(updatedEvent.calendarId)) {
          setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
        } else {
          setEvents(events.filter(e => e.id !== selectedEvent.id));
        }
      }
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(selectedEvent.id);
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
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
      const updatedEvent = {
        ...response.data.event,
        start: new Date(response.data.event.startTime),
        end: new Date(response.data.event.endTime)
      };

      setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to move event. Please try again.');
      // Revert by refetching
      fetchEvents();
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
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
      const updatedEvent = {
        ...response.data.event,
        start: new Date(response.data.event.startTime),
        end: new Date(response.data.event.endTime)
      };

      setEvents(events.map(e => e.id === event.id ? updatedEvent : e));
    } catch (error) {
      console.error('Failed to resize event:', error);
      alert('Failed to resize event. Please try again.');
      // Revert by refetching
      fetchEvents();
    }
  };

  const toggleCalendar = (calendarId) => {
    setSelectedCalendarIds(prev => {
      if (prev.includes(calendarId)) {
        return prev.filter(id => id !== calendarId);
      } else {
        return [...prev, calendarId];
      }
    });
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-container">
        <div className="container">
          <div className="calendar-header">
            <h1>My Calendars</h1>
          </div>

          <div className="calendar-main">
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

            <div className="calendar-wrapper">
              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                style={{ height: 600 }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                resizable
                draggableAccessor={() => true}
              />
            </div>
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
